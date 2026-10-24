import type { Metadata } from "next";
import Link from "next/link";
import { CONTACT_EMAIL, LEGAL_UPDATED } from "@/lib/site";

export const metadata: Metadata = {
  title: "Terms of use",
  description: "The terms for using sanjayazhagan.tech and its resume generator.",
  alternates: { canonical: "/terms" },
};

export default function TermsPage() {
  return (
    <article className="prose prose-invert prose-slate mx-auto max-w-3xl py-16 prose-headings:tracking-tight prose-a:text-cyan-300">
      <h1>Terms of use</h1>
      <p className="text-sm text-slate-400">Last updated {LEGAL_UPDATED}</p>
      <p>By using sanjayazhagan.tech you agree to these terms.</p>

      <h2>The content</h2>
      <p>
        Everything on this site, including text, project write-ups, images and design, is &copy; Sanjay Azhagan unless
        marked otherwise. You are welcome to link to it and to quote short excerpts with credit. Please don&apos;t
        republish it wholesale or present it as your own. Code shown on the site is for illustration; open-source
        projects linked from here are covered by their own licenses.
      </p>

      <h2>The resume generator</h2>
      <p>
        The resume generator uses AI. Its output is produced automatically, may contain mistakes, and is not a statement
        or guarantee by me, so please confirm anything that matters with me directly. Use it for its intended purpose:
        don&apos;t automate requests, try to get around its limits, or submit abusive content. Requests are rate-limited
        and may be refused.
      </p>

      <h2>Booking and other services</h2>
      <p>
        Scheduling is provided by Cal.com, and links may lead to other sites such as GitHub. Those services have their
        own terms, and I am not responsible for their content or availability.
      </p>

      <h2>Acceptable use</h2>
      <p>
        Don&apos;t try to disrupt the site, access its admin area, test it for vulnerabilities without permission, or
        scrape it in a way that affects other visitors. If you find a security issue, please report it by email.
      </p>

      <h2>No warranty</h2>
      <p>
        The site is provided &ldquo;as is&rdquo;. I try to keep it accurate and available, but I can&apos;t guarantee it
        is free of errors or always online.
      </p>

      <h2>Limitation of liability</h2>
      <p>
        To the extent the law allows, I am not liable for any loss arising from your use of the site or of content it
        generates.
      </p>

      <h2>Changes</h2>
      <p>
        These terms may be updated; the date at the top shows the current version, and continuing to use the site means
        you accept it. How your data is handled is described in the <Link href="/privacy">privacy policy</Link>.
      </p>

      <h2>Contact</h2>
      <p>
        <a href={`mailto:${CONTACT_EMAIL}`}>{CONTACT_EMAIL}</a>
      </p>
    </article>
  );
}
