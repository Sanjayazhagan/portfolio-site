import type { Metadata } from "next";
import Link from "next/link";
import { CONTACT_EMAIL, LEGAL_UPDATED } from "@/lib/site";

export const metadata: Metadata = {
  title: "Privacy policy",
  description: "What data sanjayazhagan.tech collects, why, and the choices you have.",
  alternates: { canonical: "/privacy" },
};

export default function PrivacyPage() {
  return (
    <article className="prose prose-invert prose-slate mx-auto max-w-3xl py-16 prose-headings:tracking-tight prose-a:text-cyan-300 prose-code:text-cyan-200">
      <h1>Privacy policy</h1>
      <p className="text-sm text-slate-400">Last updated {LEGAL_UPDATED}</p>
      <p>
        This is the personal portfolio of Sanjay Azhagan at sanjayazhagan.tech. This page explains what data the
        site handles and why. In short: there are no ads, nothing is sold, and analytics only run if you allow them.
      </p>

      <h2>What is collected, and when</h2>

      <h3>Analytics (only if you allow it)</h3>
      <p>
        If you choose &ldquo;Allow analytics&rdquo;, the site loads PostHog to measure which pages and projects people
        look at. It records the pages you visit, clicks on project links and buttons such as &ldquo;Book a call&rdquo;
        and &ldquo;Resume&rdquo;, basic device and browser details, and an approximate location derived from your IP
        address. PostHog keeps an anonymous identifier in a cookie and in your browser&apos;s local storage (names
        starting with <code>ph_</code>). Requests pass through this site (<code>/ingest</code>) to PostHog&apos;s
        servers in the United States. You are not identified by name.
      </p>
      <p>
        If you choose &ldquo;No thanks&rdquo;, or your browser sends a Global Privacy Control signal, PostHog is not
        loaded and no analytics cookie is set.
      </p>

      <h3>Resume generator</h3>
      <p>
        If you use &ldquo;Resume&rdquo;, the text you type about the role is sent from this site&apos;s server to
        OpenRouter, which passes it to an AI model provider to produce a tailored resume. This site does not store what
        you type; OpenRouter and the model provider process it under their own terms. Please don&apos;t put personal or
        confidential information in that box.
      </p>

      <h3>Booking a call</h3>
      <p>
        &ldquo;Book a call&rdquo; opens a scheduling widget from Cal.com. It loads only when you open it. Anything you
        enter there, such as your name and email, goes to Cal.com, is handled under Cal.com&apos;s privacy policy, and
        is shared with me so I can attend the call.
      </p>

      <h3>Server logs</h3>
      <p>
        Like most websites, the server and its hosting provider may keep standard request logs (IP address, time, page
        requested, browser) for security and troubleshooting.
      </p>

      <h3>Stored in your browser</h3>
      <ul>
        <li>
          Your analytics choice, in local storage (<code>consent.analytics.v1</code>).
        </li>
        <li>For the site owner only: a sign-in session cookie for the admin area. Visitors never receive it.</li>
      </ul>

      <h2>What this site does not do</h2>
      <p>No advertising or ad trackers, no selling or renting of data, and no tracking you across other websites.</p>

      <h2>Your choices</h2>
      <ul>
        <li>
          Change your mind at any time with &ldquo;Cookie settings&rdquo; in the footer. Declining stops analytics and
          removes PostHog&apos;s cookies from your browser.
        </li>
        <li>
          To ask what analytics data exists about you, or to have it deleted, email{" "}
          <a href={`mailto:${CONTACT_EMAIL}`}>{CONTACT_EMAIL}</a>. Analytics are anonymous, so include roughly when and
          which pages you visited.
        </li>
      </ul>

      <h2>How long data is kept</h2>
      <p>Analytics data is kept only as long as it is useful for understanding how the site is used.</p>

      <h2>Changes</h2>
      <p>
        If this policy changes, the date at the top changes too. See also the <Link href="/terms">terms of use</Link>.
      </p>

      <h2>Contact</h2>
      <p>
        <a href={`mailto:${CONTACT_EMAIL}`}>{CONTACT_EMAIL}</a>
      </p>
    </article>
  );
}
