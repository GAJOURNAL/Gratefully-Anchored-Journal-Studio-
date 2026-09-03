function respond(statusCode, body) {
  return {
    statusCode,
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify(body)
  };
}

function getConfig() {
  const url = process.env.SUPABASE_URL;
  const publishableKey = process.env.SUPABASE_PUBLISHABLE_KEY;

  if (!url) {
    throw new Error("SUPABASE_URL is not set in Netlify.");
  }

  if (!publishableKey) {
    throw new Error("SUPABASE_PUBLISHABLE_KEY is not set in Netlify.");
  }

  return {
    url: url.replace(/\/+$/, ""),
    publishableKey
  };
}

function getBearerToken(event) {
  const auth =
    event.headers?.authorization ||
    event.headers?.Authorization ||
    "";

  if (!auth.startsWith("Bearer ")) {
    return "";
  }

  return auth.slice(7).trim();
}

async function parseResponse(response) {
  const raw = await response.text();

  if (!raw) return null;

  try {
    return JSON.parse(raw);
  } catch {
    return raw;
  }
}

async function getCurrentUser(url, publishableKey, accessToken) {
  const response = await fetch(`${url}/auth/v1/user`, {
    method: "GET",
    headers: {
      apikey: publishableKey,
      Authorization: `Bearer ${accessToken}`
    }
  });

  const data = await parseResponse(response);

  if (!response.ok) {
    return {
      ok: false,
      status: response.status,
      error:
        data?.msg ||
        data?.message ||
        "Cloud session is not valid."
    };
  }

  return {
    ok: true,
    user: data
  };
}

async function dataRequest(
  url,
  publishableKey,
  accessToken,
  path,
  options = {}
) {
  const response = await fetch(`${url}/rest/v1/${path}`, {
    method: options.method || "GET",
    headers: {
      apikey: publishableKey,
      Authorization: `Bearer ${accessToken}`,
      "Content-Type": "application/json",
      Prefer: options.prefer || "return=representation"
    },
    body:
      options.body === undefined
        ? undefined
        : JSON.stringify(options.body)
  });

  const data = await parseResponse(response);

  if (!response.ok) {
    return {
      ok: false,
      status: response.status,
      error:
        data?.message ||
        data?.hint ||
        data?.details ||
        (typeof data === "string"
          ? data
          : "Supabase subscriber request failed.")
    };
  }

  return {
    ok: true,
    data
  };
}

exports.handler = async event => {
  if (event.httpMethod !== "POST") {
    return respond(405, { error: "Method not allowed" });
  }

  try {
    const { url, publishableKey } = getConfig();
    const accessToken = getBearerToken(event);

    if (!accessToken) {
      return respond(401, {
        error: "Cloud session is missing."
      });
    }

    const userResult = await getCurrentUser(
      url,
      publishableKey,
      accessToken
    );

    if (!userResult.ok) {
      return respond(userResult.status || 401, {
        error:
          userResult.error ||
          "Cloud session is not valid."
      });
    }

    const userId = userResult.user?.id;
    const email = userResult.user?.email || "";

    if (!userId || !email) {
      return respond(401, {
        error: "Signed-in user information is missing."
      });
    }

    const {
      action = "get",
      consent = false,
      source = "account_preferences"
    } = JSON.parse(event.body || "{}");

    if (action === "get") {
      const result = await dataRequest(
        url,
        publishableKey,
        accessToken,
        `Subscribers?select=id,email,consent,source,user_id,created_at&user_id=eq.${encodeURIComponent(userId)}&order=created_at.desc&limit=1`
      );

      if (!result.ok) {
        return respond(result.status || 500, {
          error: result.error
        });
      }

      const subscriber =
        Array.isArray(result.data) && result.data.length
          ? result.data[0]
          : null;

      return respond(200, {
        subscriber
      });
    }

    if (action === "set") {
      const existingResult = await dataRequest(
        url,
        publishableKey,
        accessToken,
        `Subscribers?select=id,user_id&user_id=eq.${encodeURIComponent(userId)}&order=created_at.desc&limit=1`
      );

      if (!existingResult.ok) {
        return respond(existingResult.status || 500, {
          error: existingResult.error
        });
      }

      const existing =
        Array.isArray(existingResult.data) && existingResult.data.length
          ? existingResult.data[0]
          : null;

      const record = {
        email,
        consent: !!consent,
        source: String(source || "account_preferences"),
        user_id: userId
      };

      let saveResult;

      if (existing?.id !== undefined && existing?.id !== null) {
        saveResult = await dataRequest(
          url,
          publishableKey,
          accessToken,
          `Subscribers?id=eq.${encodeURIComponent(existing.id)}`,
          {
            method: "PATCH",
            body: record,
            prefer: "return=representation"
          }
        );
      } else {
        saveResult = await dataRequest(
          url,
          publishableKey,
          accessToken,
          "Subscribers",
          {
            method: "POST",
            body: record,
            prefer: "return=representation"
          }
        );
      }

      if (!saveResult.ok) {
        return respond(saveResult.status || 500, {
          error: saveResult.error
        });
      }

      const subscriber =
        Array.isArray(saveResult.data)
          ? saveResult.data[0] || null
          : saveResult.data;

      return respond(200, {
        subscriber
      });
    }

    return respond(400, {
      error: "Unknown subscriber action."
    });
  } catch (error) {
    return respond(500, {
      error:
        error?.message ||
        "Subscriber request failed."
    });
  }
};
