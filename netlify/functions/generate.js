exports.handler = async (event) => {
  if (event.httpMethod !== "POST") {
    return {
      statusCode: 405,
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        error: "Method not allowed"
      })
    };
  }

  try {
    const {
      answers,
      action = "blueprint",
      blueprint = ""
    } = JSON.parse(event.body || "{}");

    if (!process.env.OPENAI_API_KEY) {
      return {
        statusCode: 500,
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          error: "OPENAI_API_KEY is not set in Netlify."
        })
      };
    }

    const project = Object.entries(answers || {})
      .map(([key, value]) => `- ${key}: ${value}`)
      .join("\n");

    let instructions = "";

    if (action === "blueprint") {
      instructions = `
You are Gracefully Anchored Journal Studio.

Create a concise master blueprint for the user's approved Christian journal, devotional, workbook, or coordinated cover project.

Do not create the entire finished product yet.

Use the approved selections exactly.

If "Surprise Me" was selected, choose the strongest fit based on the project.

Do not invent Bible verses or Bible references.

For a complete journal, devotional, or workbook, return:

# PROJECT OVERVIEW
- Title
- Optional subtitle
- Product type
- Theme
- Audience
- Purpose

# DESIGN PROFILE
- Size
- Style
- Color direction
- Typography
- Visual style
- Character direction if applicable
- Christian elements
- Overall mood

# FRONT MATTER
List recommended or selected opening pages.

# JOURNAL STRUCTURE
Create a concise section-by-section outline.

# PAGE-BY-PAGE OUTLINE
List page titles and their purpose only.

# SUGGESTED PAGE COUNT
Give an estimated interior page count.

Keep this response concise and practical.
`;
    }

    else if (action === "page-prompts") {
      instructions = `
You are Gracefully Anchored Journal Studio.

Using the approved project selections and existing blueprint, create detailed page prompts.

Do not redesign the project.

Maintain the approved:
- title
- theme
- audience
- dimensions
- visual style
- colors
- typography
- Christian elements
- character direction

For each page include:

# PAGE TITLE

Page Purpose:
Dimensions:
Orientation:
Background:
Color Palette:
Typography:
Exact Text Requirements:
Writing Space:
Visual Elements:
Character Placement if applicable:
Christian Symbolism:
Decorative Elements:
Safe Margins:

Then provide:

## IMAGE GENERATION PROMPT

Make each page visually coordinated but not identical.

Keep writing-heavy pages spacious.

Do not invent Scripture.

Include:
No floating page.
No notebook mockup.
No spiral binding.
No hands holding the page.
No desk preview.
No poster presentation.
No magazine spread.
No watermark.
No random text.
No decorations covering important text.
No clutter over writing areas.
`;
    }

    else if (action === "cover-prompts") {
      instructions = `
You are Gracefully Anchored Journal Studio.

Using the approved project selections and existing blueprint, create coordinated FRONT and BACK cover prompts.

Maintain the exact approved title, theme, audience, colors, fonts, style, and character direction.

Return:

# FRONT COVER PROMPT
Include:
- dimensions
- orientation
- title placement
- subtitle placement
- typography
- palette
- focal imagery
- character if applicable
- Christian symbolism
- decorative elements
- safe margins
- print-friendly composition

# BACK COVER PROMPT
Coordinate visually with the front.

Include:
- matching palette
- matching decorative language
- space for back-cover text
- Scripture placement if a Scripture was approved
- barcode-safe area

Do not invent Scripture wording.
`;
    }

    else if (action === "print-map") {
      instructions = `
You are Gracefully Anchored Journal Studio.

Using the approved project selections and existing blueprint, create a complete print map.

Include:

# PRINT MAP

For every page show:
- Page number
- LEFT or RIGHT
- Page title
- Page purpose
- Facing-page relationship if relevant

Rules:
- Odd-numbered pages are normally RIGHT.
- Even-numbered pages are normally LEFT.
- Include front matter.
- Include section dividers.
- Include repeating pages.
- Include intentional blank pages if needed.
- Include closing pages.
- Verify the final page count.

End with:

TOTAL INTERIOR PAGE COUNT:
`;
    }

    else if (action === "marketing") {
      instructions = `
You are Gracefully Anchored Journal Studio.

Using the approved project selections and existing blueprint, create coordinated marketing extras.

Return:

# MOCKUP PROMPTS
Create 3 professional product mockup prompts.

# SALES PAGE
Include:
- headline
- short introduction
- benefits
- product details
- ideal audience
- call to action

# SEO DESCRIPTION
Create one concise SEO-friendly product description.

# KEYWORDS
Provide relevant keywords.

# SOCIAL MEDIA
Create promotional captions for:
- Facebook
- Instagram
- Pinterest
- TikTok

Keep everything consistent with the journal title, theme, audience, colors, style, and Christian focus.
`;
    }

    else if (action === "revise") {
      instructions = `
You are Gracefully Anchored Journal Studio.

Review the existing blueprint and improve it without changing the user's approved project selections.

Improve:
- clarity
- organization
- page flow
- consistency
- usefulness
- Christian tone
- design cohesion

Return a cleaner revised blueprint.

Do not make unnecessary changes to the approved title, theme, audience, style, or dimensions.
`;
    }

    else {
      instructions = `
You are Gracefully Anchored Journal Studio.

Continue developing the approved project using the existing blueprint and user selections.

Stay consistent with all approved choices.
`;
    }

    const context = `
APPROVED PROJECT SELECTIONS:

${project}

EXISTING BLUEPRINT:

${blueprint || "No previous blueprint supplied."}
`;

    const response = await fetch(
      "https://api.openai.com/v1/responses",
      {
        method: "POST",

        headers: {
          "Authorization":
            `Bearer ${process.env.OPENAI_API_KEY}`,

          "Content-Type":
            "application/json"
        },

        body: JSON.stringify({
          model: "gpt-5.6-luna",

          reasoning: {
            effort: "none"
          },

          max_output_tokens:
  action === "page-prompts"
    ? 2200
    : 1800,
          instructions:
            instructions,

          input:
            context
        })
      }
    );

    const raw =
      await response.text();

    let data;

    try {
      data = JSON.parse(raw);
    }

    catch (error) {
      return {
        statusCode: 500,

        headers: {
          "Content-Type":
            "application/json"
        },

        body: JSON.stringify({
          error:
            "OpenAI returned an unexpected response."
        })
      };
    }

    if (!response.ok) {
      return {
        statusCode:
          response.status,

        headers: {
          "Content-Type":
            "application/json"
        },

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

    let output =
      data.output_text || "";

    if (
      !output &&
      Array.isArray(data.output)
    ) {
      output =
        data.output
          .flatMap(
            item =>
              item.content || []
          )
          .map(
            item =>
              item.text || ""
          )
          .join("\n");
    }

    return {
      statusCode: 200,

      headers: {
        "Content-Type":
          "application/json"
      },

      body:
        JSON.stringify({
          output:
            output ||
            "No content was returned."
        })
    };
  }

  catch (error) {
    return {
      statusCode: 500,

      headers: {
        "Content-Type":
          "application/json"
      },

      body:
        JSON.stringify({
          error:
            error &&
            error.message
              ? error.message
              : "Generation failed."
        })
    };
  }
};
