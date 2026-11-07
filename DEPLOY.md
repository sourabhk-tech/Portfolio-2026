# Deploying Portfolio 2026

The site is static HTML/CSS/JS with one small serverless function for the
contact form. It deploys on Vercel, which runs both without a build step.

**Publish directory:** the project root (`Portfolio-2026/`)

---

## Deploy on Vercel

### 1. Import the project

1. Push this folder to a GitHub repository (or use the Vercel CLI).
2. Import the repository at [vercel.com/new](https://vercel.com/new).
3. Framework preset: **Other**.
4. Build command: **none**.
5. Output directory: `.` (the project root).
6. Deploy. Vercel serves `404.html` for missing routes and publishes
   `api/contact.js` automatically at `/api/contact`.

No build step is required. Vercel detects the `api/` directory. `vercel.json`
sets the security headers and the one-week asset cache.

### 2. Connect the contact form

The form posts JSON to `/api/contact`. The function validates the message,
blocks the hidden honeypot field, rate-limits repeat submissions per instance,
and then delivers it through one or both of these channels:

| Variable | Required? | Purpose |
|---|---|---|
| `RESEND_API_KEY` | Yes, for email | API key from [resend.com](https://resend.com) |
| `CONTACT_TO_EMAIL` | Yes, for email | Inbox that receives messages, e.g. `sourabhkumbhar7047@gmail.com` |
| `CONTACT_FROM_EMAIL` | Recommended | Verified sender, e.g. `Portfolio <hello@yourdomain.com>` |
| `CONTACT_WEBHOOK_URL` | Optional | HTTPS endpoint that also receives the message as JSON (storage, Zapier, Make, Google Apps Script, Airtable) |

Add them in **Vercel → Project → Settings → Environment Variables**, then
redeploy so the function picks them up.

#### Quick start with Resend

1. Create a free Resend account and an API key.
2. For a quick test, leave `CONTACT_FROM_EMAIL` unset. The function falls back
   to `Portfolio <onboarding@resend.dev>`, which Resend only allows to send to
   the account owner's address. Set `CONTACT_TO_EMAIL` to that same address.
3. For production, verify your domain in Resend and set
   `CONTACT_FROM_EMAIL` to an address on that domain.
4. Submit the form on the deployed site. Check the inbox and the Vercel
   function logs (**Deployments → Functions → contact**).

#### Optional storage / webhook

Set `CONTACT_WEBHOOK_URL` to any endpoint that accepts a JSON `POST`. The
payload is:

```json
{
  "source": "portfolio-contact",
  "name": "Visitor name",
  "email": "visitor@example.com",
  "subject": "Job opportunity",
  "message": "The message",
  "page": "https://your-domain/contact.html",
  "submittedAt": "2026-01-01T12:00:00.000Z"
}
```

If both Resend and the webhook are configured, both are attempted. A message
counts as delivered if at least one succeeds. If neither is configured, the
function returns `503` and the page shows the direct-email fallback.

### 3. Test the endpoint locally (optional)

Vercel CLI can run the function locally:

```bash
npm i -g vercel
vercel dev
```

Set the environment variables in `.env.local` first (copy `.env.example`).
Then open the local URL and submit the form.

### 4. Before going live

- [ ] Confirm the production domain.
- [ ] Set the Resend/webhook environment variables and redeploy.
- [ ] Send a real test message and confirm it arrives.
- [ ] Replace relative canonical URLs and OG image paths with absolute URLs.
- [ ] Generate `sitemap.xml` with the final domain and uncomment the
      `Sitemap:` line in `robots.txt`.
- [ ] Re-run the accessibility, link, and responsive checks.

---

## Local preview

```bash
python -m http.server 8123
```

Open <http://127.0.0.1:8123/>. This previews the static site only; the contact
endpoint is not available unless you run `vercel dev`.

To preview the API locally:

```bash
vercel dev
```

---

## Troubleshooting the form

| Symptom | Check |
|---|---|
| “The contact form is not configured yet.” | `RESEND_API_KEY` and/or `CONTACT_WEBHOOK_URL` are missing in Vercel; redeploy after adding them. |
| “The message could not be delivered.” | Check the Vercel function logs. A Resend 403 usually means the sender domain is not verified. |
| Message arrives but replies go nowhere | Set `CONTACT_FROM_EMAIL` to a verified sender; the function sets `reply_to` to the visitor's address. |
| Form says “not available on this preview” | You are on a static host or `python -m http.server`; use `vercel dev` or the deployed Vercel URL. |
| Too many messages | The per-instance rate limit is 6 submissions per 10 minutes. Wait and retry. |
