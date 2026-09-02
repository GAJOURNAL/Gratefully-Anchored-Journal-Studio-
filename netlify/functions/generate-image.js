function json(statusCode, bodyObj) {
  return {
    statusCode,
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(bodyObj)
  };
}

function answersToList(answers) {
  return Object.entries(answers || {})
    .filter(([key]) => !key.endsWith("Page"))
    .map(([key, value]) => `- ${key}: ${value}`)
    .join("\n");
}

function sourceLabel(sourceAction) {
  if (sourceAction === "cover-prompts") return "Generated Cover Preview";
  if (sourceAction === "page-prompts") return "Generated Page Preview";
  if (sourceAction === "revise") return "Generated Revised Preview";
  return "Generated Project Preview";
}

function buildDirectImagePrompt(answers, sourceText, sourceAction) {
  const project = answersToList(answers);

  const sourceRule =
    sourceAction === "cover-prompts"
      ? "Create ONE front-cover image preview. Prioritize the front cover."
      : sourceAction === "page-prompts"
      ? "Create ONE representative interior journal-page image preview. Choose the strongest single page concept from the source."
      : "Create ONE representative Gracefully Anchored journal preview image, preferably a front cover or hero interior page.";

  const trimmedSource = String(sourceText || "").slice(0, 6500);

  return `
Create a polished Gracefully Anchored Christian journal design image.

${sourceRule}

APPROVED PROJECT SELECTIONS:
${project}

SOURCE DESIGN CONTENT:
${trimmedSource}

IMAGE RULES:
- Portrait composition.
- Preserve the approved title, theme, color direction, typography mood, Christian symbolism, character details, outfit colors, accessories, framing, lighting, and overall visual style when available.
- If a female character is included, depict one original elegant woman matching the approved complexion, hair, clothing, accessories, mood, pose, and setting.
- Keep anatomy natural and hands well formed.
- Premium feminine Christian stationery / journal design quality.
- Balanced composition with safe margins.
- Keep writing areas spacious on interior-page previews.
- Use refined serif and delicate script typography mood where appropriate.
- If text appears, include only the exact main title and a short subtitle or short phrase when clearly available. Do not invent Bible verses.
- No mockup scene, no hands holding the page, no spiral binding, no watermark, no barcode, no logo, no meaningless text, no random letters, no clutter.
- Render a single finished design, not a collage.
`.trim();
}

exports.handler = async (event) => {
  if (event.httpMethod !== "POST") {
    return json(405, { error: "Method not allowed" });
  }

  try {
    const {
      answers = {},
      sourceText = "",
      blueprint = "",
      sourceAction = "blueprint"
    } = JSON.parse(event.body || "{}");

    const key = process.env.OPENAI_API_KEY;

    if (!key) {
      return json(500, {
        error: "OPENAI_API_KEY is not set in Netlify."
      });
    }

    const prompt = buildDirectImagePrompt(
      answers,
      sourceText || blueprint,
      sourceAction
    );

    const response = await fetch(
      "https://api.openai.com/v1/images/generations",
      {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${key}`,
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          model: "gpt-image-1",
          prompt,
          size: "1024x1536",
          quality: "low",
          output_format: "jpeg",
          output_compression: 70
        })
      }
    );

    const raw = await response.text();

    let data;

    try {
      data = JSON.parse(raw);
    } catch {
      return json(500, {
        error: "The image service returned an unexpected response."
      });
    }

    if (!response.ok) {
      return json(response.status, {
        error:
          data?.error?.message ||
          "Image generation failed."
      });
    }

    const imageBase64 = data?.data?.[0]?.b64_json;

    if (!imageBase64) {
      return json(500, {
        error: "No image data was returned."
      });
    }

    return json(200, {
      image_base64: imageBase64,
      mime_type: "image/jpeg",
      image_prompt: prompt,
      source_label: sourceLabel(sourceAction)
    });

  } catch (error) {
    return json(500, {
      error:
        error?.message ||
        "Unexpected image generation error."
    });
  }
};
