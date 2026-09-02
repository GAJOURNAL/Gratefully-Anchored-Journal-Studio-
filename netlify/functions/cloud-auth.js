unction respond(statusCode, body) {
  return {
    statusCode,
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify(body)
  };
}

function getConfig() {
  const url =
    process.env.SUPABASE_URL;

  const publishableKey =
    process.env.SUPABASE_PUBLISHABLE_KEY;

  if (!url) {
    throw new Error(
      "SUPABASE_URL is not set in Netlify."
    );
  }

  if (!publishableKey) {
    throw new Error(
      "SUPABASE_PUBLISHABLE_KEY is not set in Netlify."
    );
  }

  return {
    url: url.replace(/\/+$/, ""),
    publishableKey
  };
}

function normalizeSession(data) {
  const expiresIn =
    Number(data?.expires_in || 3600);

  const now =
    Math.floor(Date.now() / 1000);

  return {
    access_token:
      data?.access_token || "",
    refresh_token:
      data?.refresh_token || "",
    token_type:
      data?.token_type || "bearer",
    expires_in:
      expiresIn,
    expires_at:
      data?.expires_at ||
      now + expiresIn,
    user_id:
      data?.user?.id || ""
  };
}

async function supabaseAuthRequest(
  endpoint,
  publishableKey,
  body
) {
  const response = await fetch(
    endpoint,
    {
      method: "POST",
      headers: {
        "apikey": publishableKey,
        "Authorization":
          `Bearer ${publishableKey}`,
        "Content-Type":
          "application/json"
      },
      body: JSON.stringify(body)
    }
  );

  const raw =
    await response.text();

  let data;

  try {
    data = JSON.parse(raw);
  } catch {
    return {
      ok: false,
      status: 500,
      error:
        "Supabase Auth returned an unexpected response."
    };
  }

  if (!response.ok) {
    return {
      ok: false,
      status: response.status,
      error:
        data?.msg ||
        data?.message ||
        data?.error_description ||
        data?.error ||
        "Supabase Auth request failed."
    };
  }

  return {
    ok: true,
    data
  };
}

exports.handler = async event => {
  if (event.httpMethod !== "POST") {
    return respond(
      405,
      { error: "Method not allowed" }
    );
  }

  try {
    const {
      action = "anonymous",
      refresh_token = ""
    } =
      JSON.parse(event.body || "{}");

    const {
      url,
      publishableKey
    } = getConfig();

    let result;

    if (action === "refresh") {
      if (!refresh_token) {
        return respond(
          400,
          {
            error:
              "Refresh token is required."
          }
        );
      }

      result =
        await supabaseAuthRequest(
          `${url}/auth/v1/token?grant_type=refresh_token`,
          publishableKey,
          {
            refresh_token
          }
        );
    } else {
      result =
        await supabaseAuthRequest(
          `${url}/auth/v1/signup`,
          publishableKey,
          {}
        );
    }

    if (!result.ok) {
      return respond(
        result.status || 500,
        {
          error:
            result.error ||
            "Cloud sign-in failed."
        }
      );
    }

    const session =
      normalizeSession(result.data);

    if (!session.access_token) {
      return respond(
        500,
        {
          error:
            "Supabase did not return an access token."
        }
      );
    }

    return respond(
      200,
      session
    );

  } catch (error) {
    return respond(
      500,
      {
        error:
          error?.message ||
          "Cloud authentication failed."
      }
    );
  }
};
