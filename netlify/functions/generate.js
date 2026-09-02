function respond(statusCode, body) {
  return {
    statusCode,
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body)
  };
}

function extractText(data) {
  if (typeof data?.output_text === "string" && data.output_text.trim()) {
    return data.output_text.trim();
  }

  const pieces = [];

  if (Array.isArray(data?.output)) {
    for (const item of data.output) {
      if (!Array.isArray(item?.content)) continue;

      for (const content of item.content) {
        if (typeof content?.text === "string" && content.text.trim()) {
          pieces.push(content.text.trim());
        }
      }
    }
  }

  return pieces.join("\n\n").trim();
}

function projectSelections(answers) {
  return Object.entries(answers || {})
    .filter(([key]) => !key.endsWith("Page"))
    .map(([key, value]) => `- ${key}: ${value}`)
    .join("\n");
}

function instructionsFor(action) {
  const shared = `
You are Gracefully Anchored Journal Studio, a guided Christian journal design assistant.

Use the user's approved selections. Do not ask follow-up questions.

Core rules:
- Create cohesive Christian journals, devotionals, workbooks, and coordinated covers.
- Keep the tone warm, faith-centered, elegant, practical, and print-friendly.
- Never invent Bible verses or Scripture references.
- If Surprise Me is selected, choose a tasteful option that fits the project.
- Preserve approved character details, complexion, hair, outfit direction, accessories, mood, framing, and lighting.
- Coordinate colors, fonts, decorative details, Christian elements, writing space, and page composition.
- Keep writing-heavy pages spacious and functional.
- Use clear markdown headings so the website can display the result as styled cards.
`;

  if (action === "blueprint") {
    return shared + `
Create the PROJECT BLUEPRINT only.

Use these sections:
# PROJECT OVERVIEW
# DESIGN PROFILE
# FRONT MATTER
# JOURNAL STRUCTURE
# PAGE-BY-PAGE OUTLINE
# SUGGESTED PAGE COUNT

Keep it useful and complete, but concise enough for a web result.
For PAGE-BY-PAGE OUTLINE, give page/section names and a short purpose rather than extremely long image prompts.
`;
  }

  if (action === "page-prompts") {
    return shared + `
Create detailed page-generation prompts based on the approved project and existing blueprint.

For each important page include:
- Page title/purpose
- Dimensions/orientation
- Background and palette
- Typography direction
- Exact approved title/text when supplied
- Writing-space guidance
- Character details when relevant
- Christian symbolism when appropriate
- Decorative elements
- Safe margins and print-friendly composition
- A polished image-generation prompt

Avoid mockups, floating pages, hands holding the page, spiral binding, watermarks, meaningless text, misspellings, distorted anatomy, clutter, or decorations covering writing areas.
`;
  }

  if (action === "cover-prompts") {
    return shared + `
Create coordinated FRONT COVER and BACK COVER prompts.

Include:
# FRONT COVER PROMPT
# BACK COVER PROMPT

Preserve the approved title, theme, palette, typography mood, character details, and Christian symbolism.
For the back cover, do not invent Scripture. If no Scripture was approved, create a tasteful coordinated back cover without one.
Keep a barcode-safe area when appropriate.
`;
  }

  if (action === "print-map") {
    return shared + `
Create an exact print map.

Use:
# PRINT MAP

For every page show:
- Page number
- LEFT or RIGHT
- Page title
- Purpose
- Facing-page relationship when relevant

Remember:
- Odd pages are RIGHT.
- Even pages are LEFT.
- Include front matter, dividers, repeats, intentional blanks, closing pages, and final total count.
Verify the final count.
`;
  }

  if (action === "marketing") {
    return shared + `
Create:
# PRODUCT DESCRIPTION
# SEO KEYWORDS
# SALES COPY
# SOCIAL CAPTIONS
# MOCKUP IDEAS

Keep everything aligned with the exact project theme and audience.
`;
  }

  if (action === "revise") {
    return shared + `
Revise the existing blueprint for clarity, cohesion, usefulness, and polished structure.
Do not change the user's approved selections unless needed to resolve a direct contradiction.
`;
  }

  return shared;
}

exports.handler = async (event) => {
  if (event.httpMethod !== "POST") {
    return respond(405, { error: "Method not allowed" });
  }

  try {
    const {
      answers = {},
      action = "blueprint",
      blueprint = ""
    } = JSON.parse(event.body || "{}");

    const key = process.env.OPENAI_API_KEY;

    if (!key) {
      return respond(500, {
        error: "OPENAI_API_KEY is not set in Netlify."
      });
    }

    const selections = projectSelections(answers);

    const input =
      action === "blueprint"
        ? `Create the Gracefully Anchored blueprint from these approved selections:\n\n${selections}`
        : `Create the requested Gracefully Anchored output.

APPROVED PROJECT SELECTIONS:
${selections}

EXISTING BLUEPRINT:
${blueprint || "No existing blueprint was supplied."}

REQUESTED ACTION:
${action}`;

    const response = await fetch(
      "https://api.openai.com/v1/responses",
      {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${key}`,
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          model: "gpt-5.6-luna",
          reasoning: { effort: "none" },
          max_output_tokens:
            action === "page-prompts"
              ? 2200
              : action === "blueprint"
              ? 1800
              : 1800,
          instructions: instructionsFor(action),
          input
        })
      }
    );

    const raw = await response.text();

    let data;

    try {
      data = JSON.parse(raw);
    } catch {
      return respond(500, {
        error: "OpenAI returned an unexpected response."
      });
    }

    if (!response.ok) {
      return respond(response.status, {
        error:
          data?.error?.message ||
          "OpenAI request failed."
      });
    }

    const output = extractText(data);

    if (!output) {
      return respond(500, {
        error: "OpenAI completed the request but returned no blueprint text. Please try again."
      });
    }

    return respond(200, { output });

  } catch (error) {
    return respond(500, {
      error:
        error?.message ||
        "Blueprint generation failed."
    });
  }
};
