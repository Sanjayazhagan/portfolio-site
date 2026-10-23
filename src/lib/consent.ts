// Analytics consent, stored in the visitor's browser. `null` means they haven't decided yet.
export type Consent = "granted" | "denied" | null;

const KEY = "consent.analytics.v1";
const EVENT = "consentchange";

export function readConsent(): Consent {
  if (typeof window === "undefined") return null;
  try {
    const v = window.localStorage.getItem(KEY);
    if (v === "granted" || v === "denied") return v;
  } catch {
    // storage blocked (private mode, strict settings): fall through
  }
  // Global Privacy Control is an explicit opt-out signal, so treat it as a decline.
  if ((navigator as Navigator & { globalPrivacyControl?: boolean }).globalPrivacyControl) return "denied";
  return null;
}

function notify() {
  window.dispatchEvent(new Event(EVENT));
}

export function writeConsent(value: "granted" | "denied") {
  try {
    window.localStorage.setItem(KEY, value);
  } catch {
    // can't persist; the choice still applies for this page view
  }
  notify();
}

/** Forget the choice so the banner asks again (the footer's "Cookie settings"). */
export function resetConsent() {
  try {
    window.localStorage.removeItem(KEY);
  } catch {
    // ignore
  }
  notify();
}

export function subscribeToConsent(onChange: () => void) {
  window.addEventListener(EVENT, onChange);
  window.addEventListener("storage", onChange); // other tabs
  return () => {
    window.removeEventListener(EVENT, onChange);
    window.removeEventListener("storage", onChange);
  };
}
