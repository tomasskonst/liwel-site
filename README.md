# Liwel website

A static site with one serverless function. No build step.

```
index.html        homepage
waitlist.html     waitlist page (form + live 3D jar)
privacy.html      privacy policy (fill in the [BRACKETS])
terms.html        terms of use (fill in the [BRACKETS])
api/waitlist.js   Vercel function that adds signups to Brevo
assets/           styles, fonts, images, three.js, jar and page scripts
vercel.json       clean URLs (/waitlist) and asset caching
```

## Launch on Vercel

1. Create a free account at vercel.com.
2. Either drag this whole folder onto the Vercel dashboard ("Add New > Project > Deploy from folder"),
   or push the folder to a GitHub repository and import it in Vercel. Framework preset: **Other**. No build command.
3. Set the environment variables below, then redeploy once (Deployments > ... > Redeploy).
4. Add your domain in Vercel > Project > Settings > Domains.

## Collect waitlist signups (Brevo)

Brevo is EU-based (France), has a free plan, and can send the launch email to the list later.

1. Create an account at brevo.com.
2. Contacts > Lists > create a list, e.g. "Liwel waitlist". Note its ID number.
3. Optional: Contacts > Settings > Contact attributes > add a text attribute `COUNTRY`.
4. SMTP & API > API keys > generate a key.
5. In Vercel > Project > Settings > Environment Variables add:
   - `BREVO_API_KEY` = your key
   - `BREVO_LIST_ID` = the list ID
   - `BREVO_COUNTRY_ATTRIBUTE` = `COUNTRY` (only if you did step 3)
6. Redeploy, open /waitlist, sign up with your own email and check the contact appears in the list.

Until the variables are set, the form shows "Something went wrong. Try again in a moment."

## Before you go live

- Fill in every `[BRACKET]` in privacy.html and terms.html (company name, registration number, address,
  contact email, retention period, governing law). Have them checked by a lawyer.
- Check the promises in the copy match your plans: "Cancel any time", "Made in Europe", "Under a month",
  "One email on the day Liwel launches", "No payment, no commitment".

## Notes

- Fonts (BBH Hegarty, Geist, Geist Mono) are self-hosted under the SIL Open Font License, so no requests go to Google.
- No cookies or analytics are used. If you add analytics later, update the privacy policy and add a consent banner if needed.
- Opening index.html straight from your disk works for most things, but the 3D jar and the form need a web server.
  Locally you can run `npx serve` in this folder, or use `vercel dev` to test the form too.
