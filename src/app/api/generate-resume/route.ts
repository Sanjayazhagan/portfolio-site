import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

// Free models to try in order of preference
const FREE_MODELS = [
  "google/gemma-4-31b-it:free",
  "google/gemma-4-26b-a4b-it:free",
  "nvidia/nemotron-3-super-120b-a12b:free",
  "nvidia/nemotron-3-nano-30b-a3b:free",
  "nvidia/nemotron-nano-9b-v2:free",
  "openai/gpt-oss-20b:free",
  "poolside/laguna-m.1:free",
];

async function callOpenRouter(
  apiKey: string,
  model: string,
  prompt: string
): Promise<{ success: true; content: string } | { success: false; error: string }> {
  try {
    const res = await fetch("https://openrouter.ai/api/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
        "HTTP-Referer": "https://sanjayazhagan.tech",
        "X-Title": "Sanjay Portfolio AI Resume Builder",
      },
      body: JSON.stringify({
        model,
        messages: [{ role: "user", content: prompt }],
      }),
    });

    if (!res.ok) {
      const errData = await res.json().catch(() => ({}));
      const errMsg = errData?.error?.message || `HTTP ${res.status}`;
      console.error(`Model ${model} failed:`, errMsg);
      return { success: false, error: errMsg };
    }

    const data = await res.json();
    const content = data?.choices?.[0]?.message?.content;
    if (!content) {
      return { success: false, error: "Empty response from model" };
    }
    return { success: true, content };
  } catch (err: any) {
    return { success: false, error: err.message || "Network error" };
  }
}

export async function POST(req: Request) {
  try {
    const { jobDescription } = await req.json();

    if (!jobDescription) {
      return NextResponse.json({ error: "Job description is required" }, { status: 400 });
    }

    const openRouterKey = process.env.OPENROUTER_API_KEY;
    if (!openRouterKey) {
      return NextResponse.json({ error: "Server is missing OPENROUTER_API_KEY" }, { status: 500 });
    }

    // Fetch ALL data from database — nothing is hardcoded
    const [projects, experiences, pillars, users] = await Promise.all([
      prisma.project.findMany(),
      prisma.experience.findMany(),
      prisma.pillar.findMany(),
      prisma.user.findMany({ select: { email: true } }),
    ]);

    const userEmail = users[0]?.email || "email@example.com";

    // Build a full context object from the database
    const portfolioContext = {
      projects: projects.map((p) => ({
        title: p.title,
        description: p.description,
        pillars: p.pillars,
        date: p.date,
        github: p.github,
        linkedin: p.linkedin,
        live: p.live,
        kaggle: p.kaggle,
      })),
      experience: experiences.map((e) => ({
        role: e.role,
        company: e.company,
        period: e.period,
        description: e.description,
      })),
      pillars: pillars.map((p) => ({
        id: p.id,
        title: p.title,
        summary: p.summary,
      })),
      email: userEmail,
    };

    // Construct the prompt — everything comes from the database
    const prompt = `You are an expert resume writer. I need a tailored, ATS-friendly resume.

Here is the job description I am targeting:
"""
${jobDescription}
"""

Here is my complete portfolio data pulled from my database:
${JSON.stringify(portfolioContext, null, 2)}

INSTRUCTIONS:
1. My name can be inferred from my email: "${userEmail}". Format it properly (capitalize first/last name).
2. Select the most relevant projects and experiences that match the job description.
3. Use my pillar areas (${pillars.map((p) => p.title).join(", ")}) to understand my strengths and specializations.
4. Tailor all bullet points to highlight keywords, technologies, and skills from the job description.
5. Include any relevant links (github, live, kaggle, linkedin) from the projects you select.
6. Output ONLY valid JSON matching this exact schema (no markdown, no explanation, just raw JSON):

{
  "name": "Full Name",
  "email": "${userEmail}",
  "summary": "2-3 sentence professional summary tailored to the job",
  "skills": ["skill1", "skill2", "skill3"],
  "experience": [
    {
      "role": "Job Title",
      "company": "Company Name", 
      "period": "Date Range",
      "bullets": ["Achievement 1 with metrics if possible", "Achievement 2", "Achievement 3"]
    }
  ],
  "projects": [
    {
      "title": "Project Name",
      "bullets": ["What it does tailored to job", "Key technical detail"],
      "links": { "github": "url or null", "live": "url or null", "kaggle": "url or null" }
    }
  ]
}

Output ONLY the JSON object. No markdown fences. No explanation before or after.`;

    // Try free models in sequence until one works
    let aiContent: string | null = null;
    let lastError = "";
    let usedModel = "";

    for (const model of FREE_MODELS) {
      console.log(`Trying model: ${model}`);
      const result = await callOpenRouter(openRouterKey, model, prompt);
      if (result.success) {
        aiContent = result.content;
        usedModel = model;
        console.log(`Success with model: ${model}`);
        break;
      }
      lastError = result.error;
      console.log(`Failed ${model}: ${result.error}, trying next...`);
    }

    if (!aiContent) {
      return NextResponse.json(
        {
          error: `All free models failed. Last error: ${lastError}. Try again in a minute (free models have rate limits).`,
        },
        { status: 500 }
      );
    }

    // Clean up: strip markdown fences
    aiContent = aiContent.replace(/```json/gi, "").replace(/```/g, "").trim();

    // Parse JSON
    let resumeData;
    try {
      resumeData = JSON.parse(aiContent);
    } catch (e) {
      console.error("Failed to parse AI JSON:", aiContent.substring(0, 500));
      return NextResponse.json(
        { error: "The AI returned malformed data. Please try again." },
        { status: 500 }
      );
    }

    console.log(`Resume JSON generated via ${usedModel}.`);

    return NextResponse.json({ resume: resumeData });
  } catch (error: any) {
    console.error("API Error:", error);
    return NextResponse.json({ error: error.message || "Internal server error" }, { status: 500 });
  }
}
