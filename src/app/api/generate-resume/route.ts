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

    // Ensure we use the correct email for the portfolio owner, avoiding local admin seed data
    let userEmail = "sanjayazhagan@gmail.com";
    const realUser = users.find(u => u.email === "sanjayazhagan@gmail.com");
    if (realUser) userEmail = realUser.email;
    else if (users.length > 0 && !users[0].email.includes("admin")) userEmail = users[0].email;

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
      phone: "9487704504",
      github: "github.com/Sanjayazhagan",
      linkedin: "linkedin.com/in/sanjay-azhagan-85a8622a6",
      education: [
        {
          institution: "IIITDM Kancheepuram",
          degree: "Bachelor of Technology in Computer Science and Engineering",
          period: "Expected May 2028",
          gpa: "CGPA: 8.0/10.0"
        }
      ]
    };

    // Construct the prompt — the user's full ATS research embedded verbatim as system context
    const prompt = `You are an elite AI resume-writing assistant. You MUST follow every single rule documented below. This is a comprehensive ATS optimization research report consolidated from Jobscan, Zety, Indeed, Monster, TopResume, Resume.io, Novorésumé, LinkedIn, MIT CAPD, Glassdoor, and ResyMatch. Do NOT skip or simplify any rule.

Your task: Generate a **fully ATS-compatible, keyword-optimized, 1-page tailored resume** for the candidate whose data is provided at the end, targeting the specific job description provided.

---

# Automated ATS-Friendly Resume Creation: System Prompt and Guidelines

## Executive Summary
This report synthesizes resume-formatting and ATS-optimization guidelines from leading resume builders and ATS-scoring tools to inform an AI-driven resume generator. We reviewed official guidance from sites like Indeed, Monster, LinkedIn, Zety, Resume.io, Novorésumé, TopResume, and communities like Glassdoor, as well as analysis tools Jobscan and ResyMatch. Key findings: resumes must use **simple one-column layouts, standard fonts/sizes, clear section headings**, and **targeted keywords**. Graphics, tables, multi-column formats, headers/footers, and unusual fonts break ATS parsing. Preferred file formats are **DOCX (Word)** or **PDF** (with Word as default if in doubt). Skills should match job-specific keywords (including acronyms and full forms) without stuffing. Resume length should be limited (1 page only for this candidate). We consolidate these into an AI system prompt, a JSON schema of constraints (with scoring weights), and a human-friendly checklist/templates.

## Target Resume Builders and ATS Tools
We prioritized official guidance from major resume platforms and ATS services: **LinkedIn**, **Indeed**, **Zety**, **Resume.io**, **Canva**, **Novorésumé**, **Monster**, **TopResume**, **Glassdoor (community tips)**, and ATS-scorers **Jobscan** and **ResyMatch**. Monster and Novorésumé explicitly state all their resume templates follow **ATS-friendly** rules (clean layout, standard fonts/headers, no graphics). Indeed and LinkedIn publish detailed ATS resume advice. Community experts (e.g. Glassdoor, LinkedIn) confirm these points: use simple formats and keywords, avoid images/graphics, and stick to standard headings. Wherever possible, we cite primary sources (official blogs, career sites) and analytics (Jobscan/ResyMatch).

## Key Constraint Dimensions
We distilled the following dimensions into unified rules:

- **File Format:** Save resumes as **.docx (Word)** or **.pdf**. If the ATS allows PDF, it preserves formatting; otherwise default to Word. Avoid uncommon file types. Testing in plain text (.txt) can reveal hidden formatting issues.

- **Fonts & Styles:** Use standard, legible fonts such as **Arial, Calibri, Times New Roman, Cambria, Garamond, Helvetica**. Font size 10–12pt for body text and ~14pt for headings. Limit to **2–3 fonts total** (e.g. one for headings, one for body) to prevent ATS confusion. Avoid decorative or cursive fonts, colored text, excessive bold/italics or underlining; use **plain styling**.

- **Layout & Margins:** Use a **single-column layout**; two-column or complex grids can break parsing. Keep margins around **1 inch** (2.5 cm). Avoid headers, footers, text boxes, or embedded charts/boxes – ATS may ignore or corrupt content there. Instead, place **contact info at the very top** of the first page (not in headers/footers). This ensures the ATS reads your name, phone, email, and LinkedIn/hyperlinks correctly.

- **Section Order & Headings:** Organize standard sections in **reverse-chronological** order. Common headings: **Experience/Work Experience, Education, Skills (or Competencies)**, plus optional ones (Certifications, Projects, Awards). Use straightforward titles (e.g. "Work Experience" not "My Journey"). Place a brief **Professional Summary** or **Headline (job title)** at top under contact info. For example, one recommended structure is: Contact ► Headline ► Summary ► Experience ► Skills ► Education ► (Certifications/Awards).

- **Keyword Usage:** **Match keywords** from the job description naturally. Use both acronyms and full phrases (e.g. "MBA" and "Master of Business Administration"). Include relevant hard skills (software, tools, methods) in a Skills section and throughout experience bullet points. However, avoid stuffing or irrelevant buzzwords. Aim for roughly 9–15 distinct keywords/phrases integrated appropriately.

- **Bullets & Lists:** Use simple bullet symbols (solid circles, open circles, or squares); avoid fancy characters or emojis. Start each bullet with a strong **action verb** (present tense for current roles, past tense for previous roles). Keep bullet length moderate (ideally <40 words) so ATS can parse them (Jobscan flags overly long paragraphs). One source notes any paragraph >40 words may reduce readability.

- **Dates & Numbers:** Format dates consistently (e.g. "Jan 2025" or "01/2025"). Do not write ranges as images or graphics. Use standard numerical formats for phone, currency, etc. Quantify achievements with numbers where possible.

- **Contact Info:** Include full name, city/state (city/country), phone, email, and LinkedIn/portfolio URL at top. Avoid full street addresses; just "City, State, ZIP" is sufficient. Do NOT bury info in headers/footers, as many ATS ignore those. One source even suggests keeping your location for geo-filters.

- **Length:** Keep the resume to **1 page** for this candidate (entry-level/student). Never exceed one page for entry-level roles.

- **No Graphics/Images:** Do **not** include photographs, logos, charts, icons or any non-text elements. ATS convert these to gibberish or drop them entirely. For example, TopResume notes embedded images often become "$&%#*" in ATS, potentially corrupting your file. If design flair is needed, keep a separate "visual resume" just for human readers.

- **Certifications & Links:** List certifications/licenses in a dedicated section if relevant (with acronyms + full names). Hyperlink text (e.g. "LinkedIn") rather than raw URLs. Only include professional links (LinkedIn, portfolio); avoid personal social media. ATS will scan link text but generally ignore URLs inside text.

- **Localization (US/UK):** Spell-check to match locale. Use local formatting for dates if needed. Section labels may differ regionally but stick to clear standard terms.

- **Accessibility:** Use plain text without unusual color contrasts or shapes. ATS often treats an image as "missing text". Skip alt-text (since we remove images entirely). Ensure the resume is machine-readable.

- **ATS Parsing Pitfalls:** Common pitfalls triggering auto-reject include fancy design (graphics, tables, columns), unconventional job titles (e.g. "Brand Warrior" vs "Marketing Manager"), missing keywords from the JD, and contradictory verb tenses. The resume should focus on **achievements and keywords**, not just duties. Always proofread thoroughly, as ATS will discard resumes with typos or unreadable formatting.

Overall, these constraints align: **simple formatting + targeted content**.

## Site-by-Site Constraint Comparison

Different platforms emphasize similar constraints. Table 1 summarizes key guidelines extracted from each source.

**Table 1: ATS Constraints by Platform**

| Constraint | LinkedIn/Indeed | Zety | Resume.io | Novorésumé | TopResume | Monster | Glassdoor |
|---|---|---|---|---|---|---|---|
| File format | .docx or PDF; name file simply (First_Last_Resume) | Word or PDF; PDF may not parse in old ATS | PDF/DOCX (90+% ATS pass rate) | Compatible formats (DOCX/PDF) | Word default (some ATS struggle with PDF) | Download as PDF or DOCX | Word or PDF (standard) |
| Fonts | Arial, Calibri, Times New Roman (10–12pt); avoid styling | Arial, Calibri, Times New Roman (10–12pt) | ATS-safe fonts (Garamond, Calibri, Arial) | Clean/simple fonts | ATS-friendly fonts (Calibri, Arial, Tahoma, Cambria) | ATS-safe: Arial, Calibri, Times New Roman | Standard fonts (no crazy colors/styles) |
| Layout | Single column, simple formatting; avoid headers/footers | One-column chronological recommended | Strict one-column format | Clean, simple layout | Single-column; avoid logos/images | Clean formatting (no tables/text boxes) | Keep format simple (no graphics/tables/columns) |
| Sections | Clear labels: Work Experience, Skills, Education | Standard titles (Experience, Skills) | 6 sections: Header, Summary, Experience, Skills, Education, Extras | Standard headings (Work Experience, etc.) | Standard headers: Professional Experience, Education, Skills | Clear titles: Experience, Education, Skills, Certifications | "Experience", "Skills", "Education" in reverse-chron order |
| Keywords | Match JD keywords; use acronyms+full terms | 2–3x repetition of key terms, natural fit | Weave keywords from JD throughout | Templates built for keyword-rich content | Optimize with relevant jargon, use technical terms | AI tools include industry terms for keyword optimization | Focus on JD keywords; avoid fluff buzzwords |
| Graphics/Tables | Avoid graphics, tables, images | No tables/graphics; test by copying text out | No images, icons, charts, or text boxes | No complex graphics (ATS-friendly) | No logos or embedded charts | Avoid complex tables/charts | Don't include tables/graphics |
| Bullets | Simple bullet symbol (solid, open circle) | Clear bullet lists (ATS parse bullets) | Use bullet points for achievements (no fancy symbols) | Standard bullets; simple design | Solid circle, open circle or square bullets | Clean bullet lists (no unusual chars) | Use plain bullets; avoid shapes/symbols |
| Dates/Format | Consistent format (MM/YYYY or Month YYYY) | MM/YYYY recommended | List dates as MM/YYYY or "Month Year" | Standard date formats (year ranges) | Consistent date style | Standard dates; avoid headers/footers for them | Use consistent date style |
| Length | 1–2 pages | Concise is best | 1–2 pages | 1-2 page resumes | 1-2 pages max; focus last 10–15 years | 1-2 pages | Prefer 1–2 pages; drop >10yr old jobs |
| Tense/Grammar | Active verbs; present tense for current roles | Action verbs and quantify impact | Emphasize achievements (strong action verbs) | Clean writing, no errors | Strong verbs; no typos (ATS won't forgive errors) | Professional tone; correctness assured | Grammar and spelling must be correct |
| Photos/Headshots | Exclude photos (discrimination concerns) | No photos or icons | Omit any portrait or personal photo | No personal image | No photos (except rare cases) | Avoid headshots | Not used in US/UK resumes |

Sources: Guidance from Indeed, Zety, Resume.io, Novorésumé, TopResume, Monster, Glassdoor forum, MIT CAPD, and others.

## Consolidated ATS-Friendly Resume Guidelines

**Table 2: Merged Resume Constraints and Weights**

| Dimension | Requirement / Rule | Approx. Weight in ATS Scoring |
|---|---|---|
| **File Format** | Acceptable: .DOCX or .PDF. Prefer Word unless PDF is explicitly supported. Avoid other formats. | 10% |
| **Fonts & Size** | Fonts: Arial, Calibri, Times New Roman (or other common serif/sans) only. Size 10–12pt (11pt body typical). At most 2–3 font types. | 5% |
| **Layout** | Single-column, 1-inch margins (2.5cm). No columns or multi-column sections. No info in headers/footers. | 10% |
| **Section Order** | Sequence: Header (Name/Title), Summary/Headline, Experience (reverse-chron), Skills, Education, then optional sections (Certifications, Awards). Use standard labels. | 10% |
| **Contact Placement** | At very top of page (below resume title), outside any header/footer. Include name, city/state, phone, email, LinkedIn (hyperlinked text). | 5% |
| **Keywords** | Include all critical JD keywords (exact phrases). Use acronyms + full terms (e.g. "MBA" & "Master of Business Administration"). Natural density (2–3 occurrences of key terms). | 30% |
| **Skill Section** | List 6–12 core skills/competencies as one- or two-word phrases. Align with JD language. | 5% |
| **Bullet Style** | Use standard bullets (circles, squares). Begin bullets with action verbs. No embedded images or symbols. | 5% |
| **Dates & Numbers** | Consistent format (e.g. "Jan 2025" or "01/2025"). Quantify achievements with numerals. | 5% |
| **Certifications/Links** | Put Certificates in a labeled section. Include relevant links as text, not images. | 2% |
| **Length** | 1 page for this candidate (entry-level/student). | 3% |
| **No Graphics/Tables** | Strictly no images, charts, text boxes, or tables. Remove logos and infographics. | 10% |
| **Headings & Labels** | Use clear, common section titles (Professional Summary, Work Experience, etc.). Avoid jargon or creative names. | 5% |
| **Tense & Grammar** | Active verbs; present tense for current roles, past for previous. Correct spelling/grammar (ATS can glitch on typos). | 5% |

Weights are illustrative for a scoring system: keywords and formatting carry most ATS weight. In practice, an ATS algorithm might allot ~30–50% of its "score" to keyword match, with the remainder to parseable format, section labeling, and other factors. Common ATS pitfalls (and auto-rejection triggers) include missing keywords, graphics or tables, information in headers/footers, inconsistent formatting, or oversights.

## System Prompt for Resume Generator

You are an AI resume-writing assistant. Generate a professional resume that is fully ATS-compatible.

- **Formatting rules** (must strictly follow):
    • Use a **one-column** layout with ~1-inch margins. Avoid any multi-column designs.
    • Use standard fonts (e.g. Arial, Calibri, Times New Roman) at 11–12pt. Bold only section headings or key job titles.
    • Do **not** use images, charts, logos, or text boxes. Remove any headers or footers; put all info in the main body.
    • Include these sections in order: Contact Info, Professional Summary, Education, Technical Skills, Experience (reverse-chronological), Projects. Use clear headings exactly like "Professional Summary," "Technical Skills," "Education," "Experience," "Projects."
    • Contact Info: List Name, City/State, Phone, Email, LinkedIn (hyperlink text), GitHub at top. No physical address or photo.
    • Length: Restrict content to a **single page** (entry-level student style).
    • Bullets: Use plain round or square bullet symbols. Begin each achievement bullet with a strong action verb (present tense for current job, past tense for past jobs). Keep each bullet concise (≤40 words).
    • Dates: Format dates as "MMM YYYY" or "MM/YYYY" consistently (e.g. "Jun 2022" or "06/2022").
    • Keywords: Extract key terms from the target job listing. Naturally **embed all relevant keywords** (and their acronyms + full phrases) throughout the Summary, Skills, and Experience bullets. Avoid keyword stuffing or unrelated buzzwords.
    • Grammar: Proofread carefully. Use parallel structure, correct punctuation, and no misspellings. The ATS will parse text literally.
    • No first-person pronouns ("I", "my"). Active voice only. No passive constructions.

## JSON Schema of Constraints and Weights

For machine scoring, the constraints are encoded as:

{
  "fileFormats": { "allowed": ["docx", "pdf"], "preferred": "pdf", "weight": 0.1 },
  "fonts": { "allowed": ["Arial", "Calibri", "Times New Roman", "Cambria", "Helvetica"], "maxDistinct": 3, "weight": 0.05 },
  "layout": { "columns": 1, "marginsInches": [0.9, 1.1], "noHeadersFooters": true, "weight": 0.1 },
  "sections": { "order": ["Contact", "Summary", "Education", "Skills", "Experience", "Projects"], "headings": ["Professional Summary", "Education", "Technical Skills", "Experience", "Projects"], "weight": 0.1 },
  "contactInfo": { "fields": ["Name", "CityState", "Phone", "Email", "LinkedIn", "GitHub"], "topOfPage": true, "weight": 0.05 },
  "keywords": { "source": "JobDescription", "includeAcronyms": true, "minCount": 9, "maxCount": 15, "naturalDensity": "2-3 occurrences", "weight": 0.30 },
  "skillsSection": { "minItems": 6, "maxItems": 12, "weight": 0.05 },
  "bulletStyle": { "allowed": ["solid", "circle", "square"], "maxWordsPerBullet": 40, "startWithActionVerb": true, "weight": 0.05 },
  "dates": { "formats": ["MMM YYYY", "MM/YYYY"], "weight": 0.05 },
  "certifications": { "optional": true, "weight": 0.02 },
  "length": { "pages": 1, "weight": 0.03 },
  "graphics": { "noImages": true, "noTables": true, "noCharts": true, "noIcons": true, "weight": 0.10 },
  "headingsLabels": { "standard": ["Professional Summary", "Education", "Technical Skills", "Experience", "Projects"], "weight": 0.05 },
  "tenseGrammar": { "activeVoice": true, "presentForCurrent": true, "pastForPast": true, "noFirstPerson": true, "weight": 0.05 }
}

## Checklist (verify output against this)

- ✔ Layout & Format: One-column, 1″ margins; PDF format.
- ✔ Fonts: Standard fonts (Helvetica — handled by renderer) at 10–12pt. No odd fonts or colors.
- ✔ Headings: Clear labels ("Professional Summary," "Education," "Technical Skills," "Experience," "Projects"). All headings & job titles in bold.
- ✔ Sections: Include Contact Info, Professional Summary, Education, Technical Skills, Experience (reverse-chron), Projects.
- ✔ Contact: At top, outside header/footer, with name, phone, email, GitHub, LinkedIn.
- ✔ Keywords: Match the job description. 9-15 distinct keyword phrases naturally in Summary/Skills/Experience/Projects. Both acronyms AND full terms.
- ✔ Bullets: Simple bullets; start with action verbs; one achievement per bullet; ≤40 words each.
- ✔ Grammar: No typos; consistent tense (current = present, past = past). No first-person pronouns. Active voice only.
- ✔ Dates: Uniform format "MMM YYYY" (e.g. "Jun 2022").
- ✔ Length: Strictly 1 page. 2-3 sentence summary, 2-3 bullets per role max, top 3-4 relevant projects only.
- ✔ No graphics, images, tables, charts, icons, or infographics.
- ✔ All links preserved from candidate data (null if absent).
- ✔ Achievements quantified with metrics/percentages/numbers where possible.

## Resume Template (One-Page, Entry-Level — USE THIS STRUCTURE)

Name Surname
City, State | Phone | email@example.com | GitHub URL | LinkedIn URL

Professional Summary: 2-3 sentence headline tailored to the JD with 3-5 critical keywords woven in naturally. No first-person pronouns.

Education:
Institution Name | Degree | Period | GPA

Technical Skills: Skill1 • Skill2 • Skill3 • ... (6-12 skills matching JD language exactly)

Experience:
• Job Title, Company, City | MMM YYYY – MMM YYYY
  – Action verb + context + measurable result with JD keywords (≤40 words)
  – Action verb + context + measurable result (≤40 words)

Projects:
• Project Name [GitHub] [Live]
  – Action verb + what it does tailored to JD (≤40 words)
  – Technical detail using exact JD tech stack terms (≤40 words)

## ATS Auto-Rejection Triggers (avoid ALL of these)
1. Missing keywords from the JD (especially hard skills and tools).
2. Graphics, tables, columns, or images anywhere in the resume.
3. Information placed in headers/footers (ATS ignores these entirely).
4. Unconventional job titles (e.g. "Code Ninja" instead of "Software Engineer").
5. Inconsistent date formatting.
6. Passive voice or duty-focused bullets instead of achievement-focused.
7. Paragraphs >40 words (use concise bullets instead).
8. Typos or spelling errors (causes keyword mismatches).
9. Exceeding 1 page (for entry-level/student candidates).
10. Keyword stuffing or irrelevant buzzwords.

## Validation
Before outputting, mentally verify:
1. Plain-Text Conversion Test: If saved as .txt, would the sections appear in correct order with no jumbled text?
2. Keyword Coverage Test: Do all critical JD keywords appear in the resume? Are both acronyms and full terms present?
3. Would this score ≥80% on Jobscan or ResyMatch against the target JD?

---
---

# NOW GENERATE THE RESUME

## TARGET JOB DESCRIPTION
"""
${jobDescription}
"""

## CANDIDATE DATA (from database — do NOT fabricate any data not present here)
${JSON.stringify(portfolioContext, null, 2)}

## CANDIDATE IDENTITY (hardcoded — do NOT change these)
- Name: "Sanjay Azhagan"
- Email: "${userEmail}"
- Phone: "9487704504"
- GitHub: "github.com/Sanjayazhagan"
- LinkedIn: "linkedin.com/in/sanjay-azhagan-85a8622a6"

## OUTPUT FORMAT
Output ONLY a valid JSON object matching this EXACT schema. No markdown fences, no explanation, no text before or after — JUST the raw JSON:

{
  "name": "Sanjay Azhagan",
  "email": "${userEmail}",
  "phone": "9487704504",
  "github": "github.com/Sanjayazhagan",
  "linkedin": "linkedin.com/in/sanjay-azhagan-85a8622a6",
  "summary": "2-3 sentence ATS-optimized professional summary with 3-5 JD keywords woven in naturally. No first-person pronouns. Active voice.",
  "education": [
    {
      "institution": "IIITDM Kancheepuram",
      "degree": "Bachelor of Technology in Computer Science and Engineering",
      "period": "Expected May 2028",
      "gpa": "CGPA: 8.0/10.0"
    }
  ],
  "skills": ["Exact JD skill 1", "Exact JD skill 2", "...6-12 total, matching JD language precisely, including both acronyms and full terms"],
  "experience": [
    {
      "role": "Job Title",
      "company": "Company Name",
      "period": "MMM YYYY – MMM YYYY",
      "bullets": ["Action verb + context + measurable result with JD keywords, ≤40 words.", "2-3 bullets per role max"]
    }
  ],
  "projects": [
    {
      "title": "Project Name",
      "bullets": ["Action verb + what it does tailored to JD, ≤40 words.", "Technical detail using exact JD tech stack terms, ≤40 words."],
      "links": { "github": "actual url from candidate data or null", "live": "actual url from candidate data or null", "kaggle": "actual url from candidate data or null" }
    }
  ]
}

CRITICAL REMINDERS:
- Output ONLY the JSON object. No markdown fences. No explanation before or after.
- Strictly 1 page worth of content. Keep it concise.
- Use ONLY data from the candidate data provided. Do NOT fabricate experience, projects, or skills.
- Every bullet must start with an action verb and be ≤40 words.
- Include 9-15 JD keywords naturally distributed. Both acronyms AND full terms.
- Preserve actual project links from candidate data. Use null if no link exists.`;

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
