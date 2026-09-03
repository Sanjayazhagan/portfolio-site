# Troubleshooting Log

## The "Fake" Certificate / Network Blocking Issue
**Date:** August 2026

### The Problem
When trying to access the portfolio site (`sanjayazhagan.tech`) from the college campus network, the browser threw a `NET::ERR_CERT_AUTHORITY_INVALID` error (Your connection is not private). The browser warned that the website sent back unusual and incorrect credentials.

### Initial Investigation
1. **Certbot Verification:** We SSH'd into the Azure VM and ran `sudo certbot renew`, which confirmed the Let's Encrypt certificate was perfectly valid until October 2026.
2. **Nginx Verification:** We forcefully re-installed the certificate using `sudo certbot install --cert-name sanjayazhagan.tech --nginx` and restarted Nginx (`sudo systemctl restart nginx`). However, the error persisted on the college Wi-Fi.
3. **DNS Check:** We verified the Azure VM's Public IP address against the DNS `A` record, and they matched perfectly (`40.81.20.114`). The IP hadn't changed.

### The True Cause
We ran a `curl -kv https://sanjayazhagan.tech` diagnostic on the domain which revealed the true culprit:

```text
< HTTP/1.1 307 Temporary Redirect
< Location: https://10.0.1.1:8090/ips/block/webcat?cat=40&pl=1&lu=0&url=...
```

The college's enterprise firewall (FortiGuard / Fortinet) was intercepting the connection to serve a "Website Blocked" page. Because it intercepted the secure HTTPS connection, the firewall injected its own self-signed SSL certificate, causing the browser to throw the `ERR_CERT_AUTHORITY_INVALID` error. 

**Why was it blocked?**
We checked the domain against the **FortiGuard Web Filter Lookup** tool. Fortinet's automated systems had categorized `sanjayazhagan.tech` as a **"Newly Registered Domain"** with a "Suspicious" risk level simply because the domain was brand new. The college firewall automatically blocks this category to prevent students from accessing fresh phishing/malware domains.

### The Solution
Instead of relying on the college's Computer Centre to manually whitelist the site, we tackled the root cause at the global database level:
1. Navigated to the [FortiGuard Web Filter Lookup](https://www.fortiguard.com/webfilter).
2. Searched for `https://sanjayazhagan.tech`.
3. Clicked **"Request a Review"**.
4. Submitted a request to re-categorize the site to **"Personal Websites"** or **"Education"**, noting that it is a student portfolio.

Once Fortinet reviews and approves the categorization update, the "Suspicious / Newly Registered Domain" label will be removed globally, and the college firewall will automatically unblock the site.
