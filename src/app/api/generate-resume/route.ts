import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

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

    // Fetch data from database
    const projects = await prisma.project.findMany();
    const experiences = await prisma.experience.findMany();
    
    // Construct the prompt
    const prompt = `
You are an expert resume writer and LaTeX coder. 
I am applying for a job, and I need a tailored resume in raw LaTeX format.

Here is the job description I am targeting:
"""
${jobDescription}
"""

Here is my entire database of Projects:
${JSON.stringify(projects, null, 2)}

Here is my entire database of Experience:
${JSON.stringify(experiences, null, 2)}

INSTRUCTIONS:
1. Select the top 3-4 projects and top experiences that are MOST RELEVANT to the job description.
2. Rewrite the bullet points of my experience and projects to specifically highlight keywords and skills requested in the job description.
3. Output ONLY RAW, VALID LaTeX code. Do NOT output any markdown blocks (\`\`\`). Do NOT say "Here is your code". Just output the LaTeX.
4. Use a very clean, simple, ATS-friendly article structure. Use the basic 'article' class. Do NOT use external packages that might fail to compile on a standard pdflatex engine.
5. Include my name "Sanjay Azhagan", my email "sanjayazhagan@gmail.com", and my portfolio link "https://sanjayazhagan.tech".
6. The structure should be:
   - Header (Name, Contact Info)
   - Professional Summary (Tailored to the job)
   - Experience (Tailored)
   - Projects (Tailored)
   - Skills (Derived from the job and my projects)

Ensure the LaTeX compiles perfectly without errors. Avoid special Unicode characters that break standard pdflatex.

OUTPUT ONLY THE LATEX CODE:
`;

    // Call OpenRouter API
    const aiRes = await fetch("https://openrouter.ai/api/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${openRouterKey}`,
        "Content-Type": "application/json",
        "HTTP-Referer": "https://sanjayazhagan.tech",
        "X-Title": "Sanjay Portfolio AI Resume Builder"
      },
      body: JSON.stringify({
        model: "meta-llama/llama-3.3-70b-instruct:free",
        messages: [{ role: "user", content: prompt }]
      })
    });

    if (!aiRes.ok) {
      const errText = await aiRes.text();
      console.error("OpenRouter Error:", errText);
      return NextResponse.json({ error: "Failed to generate AI response from OpenRouter" }, { status: 500 });
    }

    const aiData = await aiRes.json();
    let latexString = aiData.choices[0].message.content;
    
    // Clean up possible markdown code blocks if the AI disobeyed
    latexString = latexString.replace(/```latex/gi, "").replace(/```/g, "").trim();

    // Call latexonline.cc compiler
    const latexRes = await fetch("https://latexonline.cc/compile", {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded"
      },
      body: new URLSearchParams({
        text: latexString,
        command: "pdflatex"
      })
    });

    if (!latexRes.ok) {
      const errText = await latexRes.text();
      console.error("LaTeX Compile Error:", errText);
      return NextResponse.json({ error: "The AI generated invalid LaTeX code that failed to compile into a PDF. Please try again." }, { status: 500 });
    }

    const pdfBuffer = await latexRes.arrayBuffer();
    const base64Pdf = Buffer.from(pdfBuffer).toString("base64");
    const dataUri = `data:application/pdf;base64,${base64Pdf}`;

    return NextResponse.json({ pdfBase64: dataUri });
  } catch (error: any) {
    console.error("API Error:", error);
    return NextResponse.json({ error: error.message || "Internal server error" }, { status: 500 });
  }
}
