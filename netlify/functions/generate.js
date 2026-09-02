exports.handler = async (event) => {
  if (event.httpMethod !== "POST") {
    return {
      statusCode: 405,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        error: "Method not allowed"
      })
    };
  }

  try {
    const { answers } = JSON.parse(event.body || "{}");

    if (!process.env.OPENAI_API_KEY) {
      return {
        statusCode: 500,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          error: "OPENAI_API_KEY is not set in Netlify."
        })
      };
    }

    const instructions = `
You are Gracefully Anchored Journal Studio.

Create a concise master blueprint for the user's approved Christian journal, devotional, workbook, or coordinated cover project.

Do not create the entire finished product in this first response.

Use the user's approved selections exactly.

If "Surprise Me" was selected, choose the strongest fitting option based on the other answers.

Keep the response:
- organized
- practical
- faith-centered
- elegant
- cohesive
- print-friendly

Do not invent Bible verses or Bible references.

For a complete journal, devotional, or workbook, return only:

# PROJECT OVERVIEW
Include:
- Title
- Optional subtitle
- Product type
- Theme
- Audience
- Purpose

# DESIGN PROFILE
Include:
- Size
- Style
- Color direction
- Typography
- Visual style
- Character direction if applicable
- Christian elements
- Overall mood

# FRONT MATTER
List only the recommended or selected opening pages.

# JOURNAL STRUCTURE
Create a concise section-by-section outline.

# PAGE-BY-PAGE OUTLINE
List page titles and their purpose only.
Do not write full detailed prompts yet.

# SUGGESTED PAGE COUNT
Give an estimated total interior page count.

# NEXT STEPS
A. Create detailed page prompts
B. Create front + back cover prompts
C. Create print map
D. Create marketing extras
E. Revise this blueprint

For a front + back cover project, return only:

# COVER OVERVIEW
# FRONT COVER DIRECTION
# BACK COVER DIRECTION
# TYPOGRAPHY
# COLOR PALETTE
# CHRISTIAN ELEMENTS
# NEXT STEPS

Keep the first blueprint concise.
Aim for approximately 500 to 800 words.
`;

    const project = Object.entries(answers || {})
      .map(([key, value]) => `- ${key}: ${value}`)
      .join("\n");

    const response = await fetch(
      "https://api.openai.com/v1/responses",
      {
        method: "POST",

        headers: {
          "Authorization": `Bearer ${process.env.OPENAI_API_KEY}`,
          "Content-Type": "application/json"
        },

        body: JSON.stringify({
          model: "gpt-5.6-luna",

          reasoning: {
            effort: "none"
          },

          max_output_tokens: 1200,

          instructions: instructions,

          input: `Create the Gracefully Anchored blueprint from these approved selections:

${project}`
        })
      }
    );

    const raw = await response.text();

    let data;

    try {
      data = JSON.parse(raw);
    } catch (error) {
      return {
        statusCode: 500,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          error: "OpenAI returned an unexpected response."
        })
      };
    }

    if (!response.ok) {
      return {
        statusCode: response.status,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          error:
            data &&
            data.error &&
            data.error.message
              ? data.error.message
              : "OpenAI request failed."
        })
      };
    }

    let output = data.output_text || "";

    if (!output && Array.isArray(data.output)) {
      output = data.output
        .flatMap((item) => item.content || [])
        .map((item) => item.text || "")
        .join("\n");
    }

    return {
      statusCode: 200,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        output:
          output ||
          "No blueprint text was returned."
      })
    };

  } catch (error) {
    return {
      statusCode: 500,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        error:
          error && error.message
            ? error.message
            : "Generation failed."
      })
    };
  }
};
