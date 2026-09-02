exports.handler = async (event) => {
  if (event.httpMethod !== "POST") {
    return {
      statusCode: 405,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ error: "Method not allowed" })
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

    const project = Object.entries(answers || {})
      .map(([key, value]) => `- ${key}: ${value}`)
      .join("\n");

    const instructions = `
You are Gracefully Anchored Journal Studio.

Create a concise Christian journal blueprint from the user's approved selections.

Rules:
- Do not ask more questions.
- If Surprise Me is selected, choose the strongest fitting option.
- Keep the design cohesive, elegant, faith-centered, and print-friendly.
- Do not invent Bible verses or references.
- Keep writing-heavy pages spacious.
- Coordinate fonts, colors, visual style, Christian elements, and decorative elements.
- If a female character is included, keep her original and consistent.
- For complete journals, include a project overview, design profile, suggested front matter, page-by-page structure, and several detailed page prompts.
- For devotional/workbook projects, include sections, page flow, prompts, and design direction.
- For cover projects, create separate FRONT COVER PROMPT and BACK COVER PROMPT.

Keep this first response reasonably concise so it returns quickly.
`;

    const response = await fetch("https://api.openai.com/v1/responses", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${process.env.OPENAI_API_KEY}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        model: "gpt-5.6-terra",
        reasoning: {
          effort: "low"
        },
        max_output_tokens: 2500,
        instructions,
        input: `Create the Gracefully Anchored blueprint from these selections:\n\n${project}`
      })
    });

    const raw = await response.text();

    let data;

    try {
      data = JSON.parse(raw);
    } catch {
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
          error: data?.error?.message || "OpenAI request failed."
        })
      };
    }

    const output =
      data.output_text ||
      (data.output || [])
        .flatMap(item => item.content || [])
        .map(item => item.text || "")
        .join("\n");

    return {
      statusCode: 200,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        output: output || "No blueprint text was returned."
      })
    };

  } catch (error) {
    return {
      statusCode: 500,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        error: error.message || "Generation failed."
      })
    };
  }
};
