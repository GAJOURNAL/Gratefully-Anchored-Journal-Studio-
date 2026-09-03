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
  const raw =
    await response.text();

  if (!raw) {
    return null;
  }

  try {
    return JSON.parse(raw);
  } catch {
    return raw;
  }
}

async function getCurrentUser(
  url,
  publishableKey,
  accessToken
) {
  const response =
    await fetch(
      `${url}/auth/v1/user`,
      {
        method: "GET",
        headers: {
          "apikey":
            publishableKey,
          "Authorization":
            `Bearer ${accessToken}`
        }
      }
    );

  const data =
    await parseResponse(response);

  if (!response.ok) {
    return {
      ok: false,
      status:
        response.status,
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
  const response =
    await fetch(
      `${url}/rest/v1/${path}`,
      {
        method:
          options.method ||
          "GET",
        headers: {
          "apikey":
            publishableKey,
          "Authorization":
            `Bearer ${accessToken}`,
          "Content-Type":
            "application/json",
          "Prefer":
            options.prefer ||
            "return=representation"
        },
        body:
          options.body === undefined
            ? undefined
            : JSON.stringify(
                options.body
              )
      }
    );

  const data =
    await parseResponse(
      response
    );

  if (!response.ok) {
    return {
      ok: false,
      status:
        response.status,
      error:
        data?.message ||
        data?.hint ||
        data?.details ||
        (typeof data === "string"
          ? data
          : "Supabase data request failed.")
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
      url,
      publishableKey
    } = getConfig();

    const accessToken =
      getBearerToken(event);

    if (!accessToken) {
      return respond(
        401,
        {
          error:
            "Cloud session is missing."
        }
      );
    }

    const userResult =
      await getCurrentUser(
        url,
        publishableKey,
        accessToken
      );

    if (!userResult.ok) {
      return respond(
        userResult.status || 401,
        {
          error:
            userResult.error ||
            "Cloud session is not valid."
        }
      );
    }

    const userId =
      userResult.user?.id;

    if (!userId) {
      return respond(
        401,
        {
          error:
            "Cloud user ID is missing."
        }
      );
    }

    const {
      action = "list",
      project = {},
      id = ""
    } =
      JSON.parse(event.body || "{}");

    // -----------------------------------------
    // LIST SAVED PROJECTS
    // -----------------------------------------
    if (action === "list") {
      const result =
        await dataRequest(
          url,
          publishableKey,
          accessToken,
          "Projects?select=id,title,type,theme,answers,blueprint,created_at,updated_at&order=updated_at.desc"
        );

      if (!result.ok) {
        return respond(
          result.status || 500,
          {
            error:
              result.error
          }
        );
      }

      return respond(
        200,
        {
          projects:
            Array.isArray(
              result.data
            )
              ? result.data
              : []
        }
      );
    }

    // -----------------------------------------
    // SAVE OR UPDATE PROJECT
    // -----------------------------------------
    if (action === "save") {
      const now =
        new Date().toISOString();

      const record = {
        title:
          project.title ||
          "Untitled Project",
        type:
          project.type || "",
        theme:
          project.theme || "",
        answers:
          project.answers || {},
        blueprint:
          project.blueprint || "",
        user_id:
          userId,
        updated_at:
          now
      };

      let result;

      if (project.id) {
        result =
          await dataRequest(
            url,
            publishableKey,
            accessToken,
            `Projects?id=eq.${encodeURIComponent(project.id)}`,
            {
              method: "PATCH",
              body: record,
              prefer:
                "return=representation"
            }
          );
      } else {
        result =
          await dataRequest(
            url,
            publishableKey,
            accessToken,
            "Projects",
            {
              method: "POST",
              body: record,
              prefer:
                "return=representation"
            }
          );
      }

      if (!result.ok) {
        return respond(
          result.status || 500,
          {
            error:
              result.error
          }
        );
      }

      const saved =
        Array.isArray(
          result.data
        )
          ? result.data[0]
          : result.data;

      if (!saved?.id) {
        return respond(
          500,
          {
            error:
              "Supabase did not return the saved project."
          }
        );
      }

      return respond(
        200,
        {
          project: saved
        }
      );
    }

    // -----------------------------------------
    // DELETE PROJECT
    // -----------------------------------------
    if (action === "delete") {
      if (!id) {
        return respond(
          400,
          {
            error:
              "Project ID is required."
          }
        );
      }

      const result =
        await dataRequest(
          url,
          publishableKey,
          accessToken,
          `Projects?id=eq.${encodeURIComponent(id)}`,
          {
            method: "DELETE",
            prefer:
              "return=representation"
          }
        );

      if (!result.ok) {
        return respond(
          result.status || 500,
          {
            error:
              result.error
          }
        );
      }

      return respond(
        200,
        {
          deleted: true
        }
      );
    }

    return respond(
      400,
      {
        error:
          "Unknown cloud project action."
      }
    );

  } catch (error) {
    return respond(
      500,
      {
        error:
          error?.message ||
          "Cloud project request failed."
      }
    );
  }
};
