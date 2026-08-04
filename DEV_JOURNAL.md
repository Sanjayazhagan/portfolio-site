# Development Journey & Troubleshooting Log

This document serves as a master log for all the major hurdles, technical struggles, and solutions we've encountered while building and deploying this portfolio. 

---

## 1. The "Fake" Certificate / College Network Blocking
**Date:** August 2026

### The Problem
When trying to access the portfolio site (`sanjayazhagan.tech`) from the college campus network, the browser threw a `NET::ERR_CERT_AUTHORITY_INVALID` error (Your connection is not private). The browser warned that the website sent back unusual and incorrect credentials.

### The True Cause
We ran a `curl` diagnostic on the domain which revealed the true culprit: The college's enterprise firewall (FortiGuard / Fortinet) was intercepting the connection to serve a "Website Blocked" page. Because it intercepted the secure HTTPS connection, the firewall injected its own self-signed SSL certificate, causing the browser to throw the `ERR_CERT_AUTHORITY_INVALID` error. 

Fortinet's automated systems had categorized `sanjayazhagan.tech` as a **"Newly Registered Domain"** with a "Suspicious" risk level simply because the domain was brand new.

### The Solution
Instead of relying on the college's Computer Centre to manually whitelist the site, we tackled the root cause at the global database level:
1. Navigated to the FortiGuard Web Filter Lookup.
2. Submitted a request to re-categorize the site to **"Personal Websites"**.
Once Fortinet reviewed and approved the categorization update, the "Suspicious" label was removed globally, unblocking the site on campus.

---

## 2. SEO & Metadata Optimization
**Date:** July 2026

### The Problem
When sharing links to the portfolio (e.g., on LinkedIn, Twitter, or iMessage), the link previews were either broken, showing default Next.js text, or not looking aesthetically pleasing. Furthermore, the site needed better visibility on search engines.

### The True Cause
Single-page React/Next.js applications need explicit and dynamic OpenGraph (`og:`) and Twitter card meta tags injected into the HTML `<head>`. Without these, social media scrapers cannot render the rich preview cards (images, descriptions, titles). 

### The Solution
- Implemented Next.js metadata API (or `next-seo`) across the main layout and individual project detail pages.
- Dynamically generated `og:title`, `og:description`, and `og:image` tags based on the specific project being viewed.
- Ensured all pages had proper semantic HTML (`<h1>`, descriptive titles, meta descriptions) to satisfy web crawlers.

---

## 3. ATS-Friendly Resume Generation
**Date:** July 2026

### The Problem
We needed an AI system prompt capable of generating resumes that would actually pass through rigid Applicant Tracking Systems (ATS) without getting rejected for formatting issues.

### The True Cause
Standard AI outputs often include tables, multi-column layouts, graphics, or unusual fonts which completely break ATS parsers (like Jobscan or ResyMatch).

### The Solution
We synthesized formatting guidelines from leading resume builders and engineered a highly strict system prompt for the AI. 
- Forced simple one-column layouts.
- Strictly limited output to 1-2 pages maximum.
- Implemented a JSON schema constraint with scoring weights.
- Ensured skill keywords perfectly matched job descriptions (including full forms and acronyms) without unnatural "keyword stuffing".

---

## 4. Pillar Selection Bug (Backward Compatibility)
**Date:** July 2026

### The Problem
When clicking the "AI" or "Full-Stack" tabs on the hero section, certain projects would disappear completely, even though they were correctly assigned to that pillar in the admin panel.

### The True Cause
A data format mismatch between the frontend and the database. Originally, the database saved Pillar **Titles** (e.g., `"AI"`). Later, the admin panel was updated to save Pillar **IDs** (e.g., `"ai"`). When the frontend filtered projects, it strictly looked for `"AI"`, meaning any project saved with the new `"ai"` ID was ignored and hidden.

### The Solution
Updated both the Admin Panel and the Frontend Grid to support both formats simultaneously. The grid now checks if the array includes either the ID *or* the Title, and the admin panel gracefully migrates the old Title format to the ID format upon the next save.

