import { NextResponse } from "next/server";
import { GoogleGenerativeAI } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);

export async function POST(req: Request) {
  try {
    const { topic } = await req.json();
    if (!topic) {
      return NextResponse.json({ error: "Missing topic" }, { status: 400 });
    }

    const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

    const prompt = `
Create a learning roadmap for the topic: "${topic}".

Return only JSON (no explanations or markdown). The JSON should have this structure:

{
  "title": "Figma Roadmap",
  "nodes": [
    {
      "id": "1",
      "label": "Getting Started With Figma",
      "level": "basic",
      "children": [
        {
          "id": "1.1",
          "label": "Understanding Figma Interface",
          "level": "basic"
        },
        {
          "id": "1.2",
          "label": "Creating Your First Design",
          "level": "basic"
        }
      ]
    },
    {
      "id": "2",
      "label": "Building Reusable Components",
      "level": "intermediate",
      "children": [
        {
          "id": "2.1",
          "label": "Design System Foundations",
          "level": "intermediate"
        }
      ]
    },
    {
      "id": "3",
      "label": "Advanced Prototyping",
      "level": "expert"
    }
  ]
}

Rules:
- Each node must include "id", "label", and "level".
- Levels can be one of: "basic", "intermediate", "expert".
- Keep around 3–5 top-level nodes.
- Add children (subtopics) under relevant nodes.
- Return ONLY the JSON — no code blocks or text.
`;


    const result = await model.generateContent(prompt);
    const text = result.response.text();

    // Try to safely parse JSON from model output
    const jsonStart = text.indexOf("{");
    const jsonEnd = text.lastIndexOf("}");
    const jsonString = text.slice(jsonStart, jsonEnd + 1);

    const roadmap = JSON.parse(jsonString);

    return NextResponse.json({ roadmap });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Failed to generate roadmap" }, { status: 500 });
  }
}
