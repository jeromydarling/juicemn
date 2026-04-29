# juicemn.com — MN Juneteenth Jamboree

Static site for **J.U.I.C.E. — Juneteenth Urban Initiative Creating Economic-Empowerment**, presenter of Minnesota's largest Juneteenth celebration on West Broadway in North Minneapolis.

## Pages

| Page | File | Purpose |
|------|------|---------|
| Home | `index.html` | Event hero (flyer-inspired), mission pillars, Michelle Gibson tribute, sponsor preview |
| History | `history.html` | The story of Juneteenth — Galveston 1865 → West Broadway 2026 |
| Map | `map.html` | Interactive map of key Juneteenth locations and dates |
| Sponsor | `sponsor.html` | Five sponsorship tiers + Stripe-stubbed checkout |

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

Currently **stubbed**. To wire real Stripe Checkout:

1. Create a small backend endpoint that creates a [Checkout Session](https://stripe.com/docs/api/checkout/sessions/create) and returns `{ url }`.
2. In `assets/js/sponsor.js` (or before it on the page), set:

   ```html
   <script>
     window.STRIPE_PUBLISHABLE_KEY = "pk_live_xxx";
     window.STRIPE_CHECKOUT_ENDPOINT = "https://your-api.example.com/create-checkout-session";
   </script>
   ```

3. The existing form will POST sponsor info to that endpoint and redirect to the Stripe-hosted checkout page. Tier amounts are defined in the `TIERS` map in `sponsor.js`.

Until then, submitting the sponsor form records interest, alerts the user, and shows a confirmation toast. Todd follows up by phone/email.

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
