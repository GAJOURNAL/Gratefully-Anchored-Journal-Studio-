exports.handler = async function (event) {
  const headers = {
    "Content-Type": "application/json",
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Headers": "Content-Type, Authorization",
    "Access-Control-Allow-Methods": "POST, OPTIONS"
  };

  if (event.httpMethod === "OPTIONS") {
    return {
      statusCode: 200,
      headers,
      body: ""
    };
  }

  if (event.httpMethod !== "POST") {
    return {
      statusCode: 405,
      headers,
      body: JSON.stringify({
        error: "Method not allowed."
      })
    };
  }

  const supabaseUrl = process.env.SUPABASE_URL;
  const publishableKey = process.env.SUPABASE_PUBLISHABLE_KEY;

  if (!supabaseUrl || !publishableKey) {
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({
        error: "Supabase environment variables are missing."
      })
    };
  }

  let body = {};

  try {
    body = JSON.parse(event.body || "{}");
  } catch (error) {
    return {
      statusCode: 400,
      headers,
      body: JSON.stringify({
        error: "Invalid request."
      })
    };
  }

  const action = body.action || "anonymous";

  const authHeaders = {
    apikey: publishableKey,
    Authorization: `Bearer ${publishableKey}`,
    "Content-Type": "application/json"
  };

  try {
    let response;

    // ------------------------------------------------
    // CREATE A REAL USER ACCOUNT
    // ------------------------------------------------
    if (action === "signup") {
      const email = String(body.email || "").trim();
      const password = String(body.password || "");

      if (!email || !password) {
        return {
          statusCode: 400,
          headers,
          body: JSON.stringify({
            error: "Email and password are required."
          })
        };
      }

      response = await fetch(`${supabaseUrl}/auth/v1/signup`, {
        method: "POST",
        headers: authHeaders,
        body: JSON.stringify({
          email,
          password
        })
      });

      const data = await response.json();

      if (!response.ok) {
        return {
          statusCode: response.status,
          headers,
          body: JSON.stringify({
            error:
              data.msg ||
              data.message ||
              data.error_description ||
              data.error ||
              "Could not create account."
          })
        };
      }

      // When email confirmation is enabled,
      // Supabase may create the user without returning a session yet.
      const accessToken =
        data.access_token ||
        data.session?.access_token ||
        null;

      const refreshToken =
        data.refresh_token ||
        data.session?.refresh_token ||
        null;

      const user =
        data.user ||
        data.session?.user ||
        null;

      return {
        statusCode: 200,
        headers,
        body: JSON.stringify({
          success: true,
          action: "signup",
          needs_confirmation: !accessToken,
          access_token: accessToken,
          refresh_token: refreshToken,
          expires_at:
            data.expires_at ||
            data.session?.expires_at ||
            null,
          user_id: user?.id || null,
          email: user?.email || email
        })
      };
    }

    // ------------------------------------------------
    // LOG IN WITH EMAIL + PASSWORD
    // ------------------------------------------------
    if (action === "login") {
      const email = String(body.email || "").trim();
      const password = String(body.password || "");

      if (!email || !password) {
        return {
          statusCode: 400,
          headers,
          body: JSON.stringify({
            error: "Email and password are required."
          })
        };
      }

      response = await fetch(
        `${supabaseUrl}/auth/v1/token?grant_type=password`,
        {
          method: "POST",
          headers: authHeaders,
          body: JSON.stringify({
            email,
            password
          })
        }
      );

      const data = await response.json();

      if (!response.ok) {
        return {
          statusCode: response.status,
          headers,
          body: JSON.stringify({
            error:
              data.msg ||
              data.message ||
              data.error_description ||
              data.error ||
              "Could not log in."
          })
        };
      }

      return {
        statusCode: 200,
        headers,
        body: JSON.stringify({
          success: true,
          action: "login",
          access_token: data.access_token,
          refresh_token: data.refresh_token,
          expires_at: data.expires_at,
          user_id: data.user?.id || null,
          email: data.user?.email || email
        })
      };
    }

    // ------------------------------------------------
    // REFRESH AN EXISTING SESSION
    // ------------------------------------------------
    if (action === "refresh") {
      const refreshToken = body.refresh_token;

      if (!refreshToken) {
        return {
          statusCode: 400,
          headers,
          body: JSON.stringify({
            error: "Refresh token is required."
          })
        };
      }

      response = await fetch(
        `${supabaseUrl}/auth/v1/token?grant_type=refresh_token`,
        {
          method: "POST",
          headers: authHeaders,
          body: JSON.stringify({
            refresh_token: refreshToken
          })
        }
      );

      const data = await response.json();

      if (!response.ok) {
        return {
          statusCode: response.status,
          headers,
          body: JSON.stringify({
            error:
              data.msg ||
              data.message ||
              data.error_description ||
              data.error ||
              "Could not refresh session."
          })
        };
      }

      return {
        statusCode: 200,
        headers,
        body: JSON.stringify({
          success: true,
          action: "refresh",
          access_token: data.access_token,
          refresh_token: data.refresh_token,
          expires_at: data.expires_at,
          user_id: data.user?.id || null,
          email: data.user?.email || null
        })
      };
    }

    // ------------------------------------------------
    // EXISTING ANONYMOUS ACCOUNT FALLBACK
    // ------------------------------------------------
    if (action === "anonymous") {
      response = await fetch(`${supabaseUrl}/auth/v1/signup`, {
        method: "POST",
        headers: authHeaders,
        body: JSON.stringify({})
      });

      const data = await response.json();

      if (!response.ok) {
        return {
          statusCode: response.status,
          headers,
          body: JSON.stringify({
            error:
              data.msg ||
              data.message ||
              data.error_description ||
              data.error ||
              "Could not create anonymous session."
          })
        };
      }

      return {
        statusCode: 200,
        headers,
        body: JSON.stringify({
          success: true,
          action: "anonymous",
          access_token: data.access_token,
          refresh_token: data.refresh_token,
          expires_at: data.expires_at,
          user_id: data.user?.id || null
        })
      };
    }

    return {
      statusCode: 400,
      headers,
      body: JSON.stringify({
        error: "Unknown authentication action."
      })
    };
  } catch (error) {
    console.error("cloud-auth error:", error);

    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({
        error: "Authentication service error."
      })
    };
  }
};
