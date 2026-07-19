# PostHog Setup Guide for Next.js (App Router)

This guide serves as a reference for integrating PostHog Analytics into any Next.js App Router project.

## 1. Install PostHog

Install the PostHog JavaScript SDK and the PostHog Node SDK (if doing server-side analytics).

```bash
npm install posthog-js
```

## 2. Configure Environment Variables

Add your PostHog Project API Key and Host URL to your `.env.local` file (and make sure they are set on your production server).

```env
NEXT_PUBLIC_POSTHOG_KEY=phc_YourProjectAPIKeyHere
NEXT_PUBLIC_POSTHOG_HOST=https://us.i.posthog.com # Or https://eu.i.posthog.com for EU
```

## 3. Create a PostHog Provider Component

Create a client component to initialize PostHog and provide it to your application. This is typically placed in `src/providers/PostHogProvider.tsx`.

```tsx
// src/providers/PostHogProvider.tsx
'use client'

import posthog from 'posthog-js'
import { PostHogProvider } from 'posthog-js/react'
import { useEffect } from 'react'

export function CSPostHogProvider({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    posthog.init(process.env.NEXT_PUBLIC_POSTHOG_KEY as string, {
      api_host: process.env.NEXT_PUBLIC_POSTHOG_HOST,
      person_profiles: 'identified_only', // or 'always' to create profiles for anonymous users as well
      capture_pageview: false // Disable automatic pageview capture, as we capture manually
    })
  }, [])

  return <PostHogProvider client={posthog}>{children}</PostHogProvider>
}
```

## 4. Track Page Views (Next.js App Router)

Because Next.js App Router uses soft navigation, you need to track page views manually using a dedicated component.

```tsx
// src/components/PostHogPageView.tsx
'use client'

import { usePathname, useSearchParams } from "next/navigation";
import { useEffect, Suspense } from "react";
import { usePostHog } from 'posthog-js/react';

function PostHogPageViewImpl() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const posthog = usePostHog();

  useEffect(() => {
    if (pathname && posthog) {
      let url = window.origin + pathname;
      if (searchParams.toString()) {
        url = url + `?${searchParams.toString()}`;
      }
      posthog.capture('$pageview', { '$current_url': url });
    }
  }, [pathname, searchParams, posthog]);
  
  return null;
}

export default function PostHogPageView() {
  return (
    <Suspense fallback={null}>
      <PostHogPageViewImpl />
    </Suspense>
  )
}
```

## 5. Wrap Your Application

Wrap your root layout with the provider and include the page view tracker.

```tsx
// src/app/layout.tsx
import { CSPostHogProvider } from '@/providers/PostHogProvider'
import PostHogPageView from '@/components/PostHogPageView'

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <CSPostHogProvider>
        <body>
          <PostHogPageView />
          {children}
        </body>
      </CSPostHogProvider>
    </html>
  )
}
```

## 6. Tracking Custom Events

To track custom events (like clicking a specific button), use the `usePostHog` hook inside any client component.

```tsx
'use client'
import { usePostHog } from 'posthog-js/react'

export default function BookCallButton() {
  const posthog = usePostHog()

  const handleClick = () => {
    // Send a custom event to PostHog
    posthog.capture('book_call_clicked', {
      location: 'hero_section'
    })
  }

  return (
    <button onClick={handleClick}>Book a Call</button>
  )
}
```
