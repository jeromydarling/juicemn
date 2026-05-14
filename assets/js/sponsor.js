/* JUICE — Sponsor checkout
   Once Stripe is set up via the "Set up Stripe" workflow, the file
   assets/data/payment-links.json contains a Payment Link URL per tier.
   Clicking a tier button redirects to its Stripe-hosted checkout page.
   If the JSON is missing (Stripe not yet configured), we fall back to
   the old in-page modal that captures interest and prompts a callback.
*/

const STUB_TIERS = {
  presenting: { name: "Presenting Sponsor",  price: "$100,000",         blurb: "Maximum visibility. Exclusive leadership." },
  freedom:    { name: "Freedom Sponsor",     price: "$50,000",          blurb: "High-impact visibility. Strong community presence." },
  legacy:     { name: "Legacy Sponsor",      price: "$25,000",          blurb: "Solid brand exposure. Strong local presence." },
  community:  { name: "Community Sponsor",   price: "$10,000",          blurb: "Local support. Community recognition." },
  ally:       { name: "Ally Sponsor",        price: "$1,500 – $5,000",  blurb: "Foundational support. Mission alignment." },
  food_vendor:     { name: "Food Vendor Booth",      price: "$300", blurb: "One food vendor booth on June 19, 2026." },
  non_food_vendor: { name: "Non-Food Vendor Booth",  price: "$300", blurb: "One non-food vendor booth on June 19, 2026." },
};

let PAYMENT_LINKS = null; // populated from assets/data/payment-links.json

function showToast(msg) {
  const t = document.querySelector(".toast");
  if (!t) return;
  t.textContent = msg;
  t.classList.add("show");
  setTimeout(() => t.classList.remove("show"), 2200);
}

async function loadPaymentLinks() {
  try {
    const res = await fetch("assets/data/payment-links.json", { cache: "no-cache" });
    if (!res.ok) return null;
    const data = await res.json();
    if (!data || !data.tiers || Object.keys(data.tiers).length === 0) return null;
    return data;
  } catch {
    return null;
  }
}

// ---------------------------------------------------------------------------
// Stub fallback (used only if payment-links.json is missing)
// ---------------------------------------------------------------------------

function openStubCheckout(tierKey) {
  const tier = STUB_TIERS[tierKey];
  if (!tier) return;
  const modal = document.querySelector(".checkout-modal");
  if (!modal) return;
  modal.querySelector(".tier-name").textContent = tier.name;
  modal.querySelector(".price").textContent = tier.price;
  modal.querySelector(".tier-blurb").textContent = tier.blurb;
  modal.dataset.tier = tierKey;
  modal.classList.add("open");
  setTimeout(() => modal.querySelector('input[name="company"]').focus(), 50);
}

function closeStubCheckout() {
  document.querySelector(".checkout-modal")?.classList.remove("open");
}

async function submitStubInterest(tierKey, formData) {
  await new Promise(r => setTimeout(r, 600));
  const tier = STUB_TIERS[tierKey];
  alert(
    `Thank you, ${formData.contact || formData.company || "friend"}!\n\n` +
    `We've recorded your interest in the ${tier.name} (${tier.price}).\n\n` +
    `Stripe is being wired up — Todd will reach out within 24 hours at ${formData.email || "your email"} ` +
    `to finalize your sponsorship.\n\n— J.U.I.C.E.`
  );
  closeStubCheckout();
  showToast("Sponsorship interest received");
}

// ---------------------------------------------------------------------------
// Wire up
// ---------------------------------------------------------------------------

function handleTierClick(e) {
  e.preventDefault();
  const tierKey = e.currentTarget.getAttribute("data-tier");
  if (!tierKey) return;

  if (PAYMENT_LINKS && PAYMENT_LINKS.tiers && PAYMENT_LINKS.tiers[tierKey]?.url) {
    // Real Stripe Payment Link — redirect.
    window.location.href = PAYMENT_LINKS.tiers[tierKey].url;
    return;
  }
  // Stripe not yet configured — fall back to interest modal.
  openStubCheckout(tierKey);
}

function annotateButtons() {
  // If we have real Payment Links, decorate buttons with proper href + target
  // attributes so right-click "open in new tab" works and the URL preview shows.
  if (!PAYMENT_LINKS || !PAYMENT_LINKS.tiers) return;
  document.querySelectorAll("[data-tier]").forEach(btn => {
    const url = PAYMENT_LINKS.tiers[btn.getAttribute("data-tier")]?.url;
    if (url && btn.tagName === "BUTTON") {
      // Convert button → anchor in place to preserve right-click behavior
      const a = document.createElement("a");
      for (const attr of btn.attributes) a.setAttribute(attr.name, attr.value);
      a.href = url;
      a.innerHTML = btn.innerHTML;
      a.classList.add("btn-as-link");
      btn.replaceWith(a);
      a.addEventListener("click", handleTierClick);
    }
  });
}

async function wire() {
  PAYMENT_LINKS = await loadPaymentLinks();

  if (PAYMENT_LINKS) {
    annotateButtons();
    if (PAYMENT_LINKS.mode === "test") {
      console.info("[JUICE] Stripe Payment Links loaded (TEST mode).");
    }
  } else {
    // No links yet — wire stub modal
    document.querySelectorAll("[data-tier]").forEach(btn => {
      btn.addEventListener("click", handleTierClick);
    });
    const modal = document.querySelector(".checkout-modal");
    if (modal) {
      modal.querySelector(".cancel")?.addEventListener("click", closeStubCheckout);
      modal.addEventListener("click", e => { if (e.target === modal) closeStubCheckout(); });
      modal.querySelector("form")?.addEventListener("submit", async e => {
        e.preventDefault();
        const fd = Object.fromEntries(new FormData(e.target).entries());
        const submitBtn = e.target.querySelector('button[type="submit"]');
        submitBtn.disabled = true;
        submitBtn.textContent = "Processing…";
        await submitStubInterest(modal.dataset.tier, fd);
        submitBtn.disabled = false;
        submitBtn.textContent = "Continue to payment";
      });
    }
  }
}

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", wire);
} else {
  wire();
}
