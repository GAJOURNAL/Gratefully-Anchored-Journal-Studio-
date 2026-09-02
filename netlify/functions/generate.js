function json(statusCode, bodyObj) {
  return {
    statusCode,
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(bodyObj)
  };
}

function extractOutputText(data) {
  if (typeof data?.output_text === "string" && data.output_text.trim()) {
    return data.output_text.trim();
  }

  const parts = [];
  for (const item of data?.output || []) {
    for (const content of item?.content || []) {
      if (typeof content?.text === "string") {
        parts.push(content.text);
      }
    }
  }

  return parts.join("\n").trim();
}

function answersToList(answers) {
  return Object.entries(answers || {})
    .map(([k, v]) => `- ${k}: ${v}`)
    .join("\n");
}

async function callResponsesAPI(key, { instructions, input, max_output_tokens = 1600 }) {
  const response = await fetch("https://api.openai.com/v1/responses", {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${key}`,
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      model: "gpt-5.6",
      instructions,
      input,
      max_output_tokens
    })
  });

  const raw = await response.text();

  let data;
  try {
    data = JSON.parse(raw);
  } catch {
    return { ok: false, status: 500, error: "OpenAI returned an unexpected response." };
  }

  if (!response.ok) {
    return {
      ok: false,
      status: response.status,
      error: data?.error?.message || "OpenAI request failed."
    };
  }

  return { ok: true, data };
}

function getTextInstructions(action) {
  const sharedRules = `
You are Gracefully Anchored Journal Studio.

Create warm, elegant, Christian journal design outputs based on the user's approved selections.

Rules:
- Do not ask more questions.
- If Surprise Me is selected, choose the strongest fitting option.
- Keep the design cohesive, elegant, faith-centered, and print-friendly.
- Do not invent Bible verses or references.
- Keep writing-heavy pages spacious.
- Coordinate fonts, colors, visual style, Christian elements, and decorative elements.
- If a female character is included, keep her original and consistent.
- Use clear headings and organized sections.
`;

  if (action === "blueprint") {
    return sharedRules + `
Create a concise but useful Christian journal blueprint.
Include:
- Project Overview
- Design Profile
- Suggested Front Matter
- Journal Structure or Page Flow
- Several detailed page ideas/prompts
- Suggested Page Count
`;
  }

  if (action === "page-prompts") {
    return sharedRules + `
Expand the existing blueprint into detailed image/page prompts.
Create clear section headings.
Give multiple well-structured prompts the user could copy into an image generator.
Keep each prompt practical, polished, and spacious.
`;
  }

  if (action === "cover-prompts") {
    return sharedRules + `
Create FRONT COVER PROMPT and BACK COVER PROMPT.
Coordinate the palette, visual style, typography mood, and Christian elements.
If a back-cover Scripture is not given, suggest a tasteful back-cover layout without inventing a verse.
`;
  }

  if (action === "print-map") {
    return sharedRules + `
Create an exact page-by-page print map.
Show page number, left/right placement, facing-page pairs, section dividers, repeated pages, and total page count.
`;
  }

  if (action === "marketing") {
    return sharedRules + `
Create marketing extras with clear headings:
- Sales blurb
- Short product description
- SEO keywords
- Social captions
Keep them aligned with the project theme and audience.
`;
  }

  if (action === "revise") {
    return sharedRules + `
Revise and improve the existing blueprint.
Make it cleaner, more cohesive, and more polished while preserving the approved direction.
`;
  }

  return sharedRules;
}

function buildTextInput(action, answers, blueprint) {
  const project = answersToList(answers);

  if (action === "blueprint") {
    return `Create the Gracefully Anchored blueprint from these selections:\n\n${project}`;
  }

  return `
Use these approved selections and the current blueprint.

APPROVED SELECTIONS:
${project}

CURRENT BLUEPRINT:
${blueprint || "No blueprint provided."}

Create the requested output for action: ${action}
  `.trim();
}

function getImageSourceLabel(sourceAction) {
  if (sourceAction === "cover-prompts") return "Generated Cover Preview";
  if (sourceAction === "page-prompts") return "Generated Page Preview";
  if (sourceAction === "revise") return "Generated Revised Preview";
  return "Generated Project Preview";
}

async function buildImagePrompt(key, answers, sourceText, sourceAction) {
  const instructions = `
You are Gracefully Anchored Image Prompt Studio.

Turn the project context into ONE polished image-generation prompt for a single elegant preview image.

Rules:
- Return only the final image prompt text. No markdown. No headings. No explanations.
- Create one visually rich representative image.
- If the source is a set of page prompts, choose the strongest single page concept.
- If the source is cover prompts, prioritize the front cover.
- If the source is a blueprint, choose the strongest representative preview, usually a front cover or hero interior page.
- Preserve the approved title, visual style, colors, Christian symbolism, character details, and overall mood when available.
- Keep the image aesthetically polished, premium, feminine where appropriate, and print-friendly.
- Prefer portrait composition unless the content clearly suggests otherwise.
- If text is included in the image, render only the main title and short subtitle or short phrase when appropriate. Avoid long body text.
- Avoid mockups, watermarks, fake brands, random letters, and clutter.
- Keep the prompt under 350 words.
`;

  const input = `
SOURCE ACTION:
${sourceAction || "blueprint"}

APPROVED SELECTIONS:
${answersToList(answers)}

SOURCE CONTENT:
${sourceText || "No source content provided."}
  `.trim();

  const promptResponse = await callResponsesAPI(key, {
    instructions,
    input,
    max_output_tokens: 700
  });

  if (!promptResponse.ok) return promptResponse;

  const imagePrompt = extractOutputText(promptResponse.data);

  if (!imagePrompt) {
    return { ok: false, status: 500, error: "The image prompt could not be created." };
  }

  return { ok: true, imagePrompt };
}

function pickImageSize(answers) {
  const size = String(answers?.size || "").toLowerCase();

  if (
    size.includes("8.5 x 11") ||
    size.includes("8 x 10") ||
    size.includes("6 x 9") ||
    size.includes("a4")
  ) {
    return "1024x1536";
  }

  return "1024x1536";
}

async function generateImage(key, prompt, size) {
  const response = await fetch("https://api.openai.com/v1/images/generations", {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${key}`,
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      model: "gpt-image-1",
      prompt,
      size
    })
  });

  const raw = await response.text();

  let data;
  try {
    data = JSON.parse(raw);
  } catch {
    return { ok: false, status: 500, error: "Image generation returned an unexpected response." };
  }

  if (!response.ok) {
    return {
      ok: false,
      status: response.status,
      error: data?.error?.message || "Image generation failed."
    };
  }

  const imageBase64 = data?.data?.[0]?.b64_json;
  if (!imageBase64) {
    return { ok: false, status: 500, error: "No image data was returned." };
  }

  return {
    ok: true,
    imageBase64,
    mimeType: "image/png"
  };
}

exports.handler = async (event) => {
  if (event.httpMethod !== "POST") {
    return json(405, { error: "Method not allowed" });
  }

  try {
    const body = JSON.parse(event.body || "{}");
    const {
      answers = {},
      action = "blueprint",
      blueprint = "",
      sourceText = "",
      sourceAction = "blueprint"
    } = body;

    const key = process.env.OPENAI_API_KEY;
    if (!key) {
      return json(500, { error: "OPENAI_API_KEY is not set in Netlify." });
    }

    if (action === "generate-image") {
      const promptResult = await buildImagePrompt(
        key,
        answers,
        sourceText || blueprint,
        sourceAction
      );

      if (!promptResult.ok) {
        return json(promptResult.status || 500, { error: promptResult.error || "Image prompt creation failed." });
      }

      const size = pickImageSize(answers);
      const imageResult = await generateImage(key, promptResult.imagePrompt, size);

      if (!imageResult.ok) {
        return json(imageResult.status || 500, { error: imageResult.error || "Image generation failed." });
      }

      return json(200, {
        image_base64: imageResult.imageBase64,
        mime_type: imageResult.mimeType,
        image_prompt: promptResult.imagePrompt,
        source_label: getImageSourceLabel(sourceAction)
      });
    }

    const instructions = getTextInstructions(action);
    const input = buildTextInput(action, answers, blueprint);

    const textResult = await callResponsesAPI(key, {
      instructions,
      input,
      max_output_tokens: action === "blueprint" ? 2200 : 2400
    });

    if (!textResult.ok) {
      return json(textResult.status || 500, { error: textResult.error || "OpenAI request failed." });
    }

    const output = extractOutputText(textResult.data);

    return json(200, {
      output: output || "No output returned."
    });
  } catch (error) {
    return json(500, {
      error: error?.message || "Unexpected server error."
    });
  }
};
