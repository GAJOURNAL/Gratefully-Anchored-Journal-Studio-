exports.handler = async (event) => {
  if (event.httpMethod !== "POST") {
    return { statusCode: 405, body: JSON.stringify({ error: "Method not allowed" }) };
  }
  try {
    const { answers } = JSON.parse(event.body || "{}");
    const key = process.env.OPENAI_API_KEY;
    if (!key) return { statusCode: 500, body: JSON.stringify({ error: "OPENAI_API_KEY is not set in Netlify." }) };

    const instructions = `You are Gracefully Anchored Journal Studio, a guided Christian journal design assistant.
Create cohesive Christian journals, devotionals, workbooks, and coordinated front/back covers.
Do not ask more questions. Use the user's approved selections.
If Surprise Me was selected, choose the best fit from the other choices.
Keep content warm, faith-centered, elegant, practical, and print-friendly.
Do not invent Bible verses or references.
Coordinate colors, fonts, visual style, decorations, Christian elements, writing space, and page composition.
Keep writing-heavy pages spacious.
For cover projects, create coordinated FRONT COVER PROMPT and BACK COVER PROMPT.
For complete journal/devotional/workbook projects, include project overview, design profile, page-by-page structure, detailed page prompts, front matter when appropriate, and next steps.`;

    const project = Object.entries(answers || {}).map(([k,v]) => `- ${k}: ${v}`).join("\n");

    const r = await fetch("https://api.openai.com/v1/responses", {
      method: "POST",
      headers: { "Authorization": `Bearer ${key}`, "Content-Type": "application/json" },
      body: JSON.stringify({
        model: "gpt-5.6",
        instructions,
        input: `Create the Gracefully Anchored project from these selections:\n${project}`
      })
    });

    const data = await r.json();
    if (!r.ok) return { statusCode: r.status, body: JSON.stringify({ error: data?.error?.message || "OpenAI request failed" }) };
    const text = data.output_text || (data.output || []).flatMap(x => x.content || []).map(x => x.text || "").join("\n");
    return { statusCode: 200, body: JSON.stringify({ output: text }) };
  } catch (e) {
    return { statusCode: 500, body: JSON.stringify({ error: e.message }) };
  }
};
