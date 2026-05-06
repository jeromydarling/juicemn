# juicemn.com — MN Juneteenth Jamboree

Static site for **J.U.I.C.E. — Juneteenth Urban Initiative Creating Economic-Empowerment**, presenter of Minnesota's largest Juneteenth celebration on West Broadway in North Minneapolis.

## Pages

| Page | File | Purpose |
|------|------|---------|
| Home | `index.html` | Event hero (flyer-inspired), mission pillars, Michelle Gibson tribute, sponsor preview |
| History | `history.html` | The story of Juneteenth — Galveston 1865 → West Broadway 2026 |
| Map | `map.html` | Interactive map of key Juneteenth locations and dates |
| Sponsor | `sponsor.html` | Five sponsorship tiers, redirecting to Stripe Payment Links |
| Thank you | `thank-you.html` | Post-payment confirmation with onboarding checklist |

## Run locally

```bash
python3 -m http.server 8000
# open http://localhost:8000
```

## Deploy — GitHub Pages (via Actions)

This repo deploys with the modern **GitHub Actions** Pages flow (not the legacy "Deploy from a branch" option). Workflow: `.github/workflows/pages.yml`.

One-time setup:

1. Repo → **Settings → Pages → Build and deployment → Source:** `GitHub Actions`.
2. Push to `main` (or run the **Deploy to GitHub Pages** workflow manually from the Actions tab).
3. Site is live at `https://<owner>.github.io/juicemn/` in ~1 minute. The Actions log will show the URL.
4. For the custom domain `juicemn.com`, add a `CNAME` file containing `juicemn.com` and point apex DNS to GitHub Pages (`185.199.108.153`, `.109.153`, `.110.153`, `.111.153`). Then set the custom domain in **Settings → Pages**.

The included `.nojekyll` keeps Pages from running Jekyll on the site.

## Admin (inline edit) lock

The little 🔒 **Admin** button in the footer opens a password prompt. The default password is **`juneteenth1865`** — change it by replacing `ADMIN_HASH` in `assets/js/app.js` with the SHA-256 of your new password:

```bash
echo -n "yourNewPassword" | shasum -a 256
```

Once unlocked, every block of text marked `data-editable="..."` becomes editable in place. Edits live in the admin's browser (`localStorage`); use **Export edits** in the admin bar to download a JSON of changes for an admin to commit to the source HTML.

> Note: this is a client-side convenience for an admin to draft copy live, not a security boundary. The HTML is public.

## Stripe (sponsorship payments)

Sponsorship runs on **Stripe Payment Links** — no backend required. A one-shot
GitHub Actions workflow creates the five Products, Prices, and Payment Links
in your Stripe account and writes the URLs to `assets/data/payment-links.json`.
The site loads that JSON and redirects each tier button to its Payment Link.

### One-time setup

1. **Create a restricted key** in Stripe Dashboard → Developers → API keys →
   "+ Create restricted key". Name it `juicemn-claude-setup`. Permissions:

   | Resource       | Permission |
   |----------------|------------|
   | Products       | Write      |
   | Prices         | Write      |
   | Payment Links  | Write      |

   Use a **test-mode** key (`rk_test_…`) for the first run.

2. **Add it as a repo secret**: Repo → Settings → Secrets and variables →
   Actions → New repository secret → name `JUICE_STRIPE_KEY`, paste the key.

3. **Run the workflow**: Actions → "Set up Stripe (Products + Payment Links)" →
   Run workflow. The script is idempotent (matches on
   `metadata.tier`), so re-running it is safe.

4. The workflow commits the resulting Payment Link URLs back to
   `assets/data/payment-links.json` and the Pages workflow deploys.

5. Test the full flow with Stripe's test card `4242 4242 4242 4242`. Verify
   the success redirect lands on `/thank-you.html`.

6. When ready for production, replace the secret with a **live-mode** restricted
   key (`rk_live_…`) and re-run the workflow.

### Stripe Dashboard checklist (one-time)

- [ ] Settings → Branding → upload logo, set accent color `#e3261c`
- [ ] Settings → Public business information → name, support email, phone
- [ ] Settings → Customer emails → ✅ Successful payments, ✅ Refunds
- [ ] Personal settings → Notifications → ✅ Successful payments
- [ ] Settings → Payments → Statement descriptors → `JUICE MN JUNETEENTH`

### Per-Payment-Link config (already set by the script)

- After-payment redirect → `https://juicemn.com/thank-you.html`
- Custom field: **Company / Organization** (required)
- Custom field: **Anything we should know** (optional)
- Phone collection: enabled
- Ally tier: customer-chosen amount, $1,500 – $5,000

### Fallback

If `assets/data/payment-links.json` is empty (workflow not yet run), the
sponsor buttons fall back to an in-page interest form that records contact
info and prompts a phone/email follow-up from Todd.

## Design system

- **Colors:** Pan-African red `#e3261c`, gold `#f2b63c` / `#ffd23f`, green `#2e7d32`, on deep black `#0a0907`. Cream text `#f7eedd`.
- **Type:** *Bowlby One SC* (display, matches the flyer's chunky weight), *Alfa Slab One* (slab accent), *Inter* (body).
- **Imagery:** the hero uses the family-portrait artwork from the JUICE Flyer (`assets/images/hero-portraits.png`).

## Source materials

The original PDFs from JUICE are kept at the repo root for reference:
- `JUICE Flyer.pdf`
- `JUICE Flyer & Sponsorship 1.pdf`
- `JUICE Flyer & Sponsorship 2.pdf`
- `2026 Juneteenth - 1 Pager.pdf`

## Contact

Todd Gramenz · Executive Director
J.U.I.C.E. — Juneteenth Urban Initiative Creating Economic-Empowerment
(651) 800-5130 · MNJunteenth@gmail.com
