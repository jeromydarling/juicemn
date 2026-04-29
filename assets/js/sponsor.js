/* JUICE — Sponsor checkout (Stripe-stubbed)
   Wires up the per-tier "Become Sponsor" buttons to a checkout modal.
   When a real Stripe publishable key + Checkout Session backend is wired in,
   replace the body of `startCheckout` with a Stripe.js redirectToCheckout call.
*/

const TIERS = {
  presenting: {
    name: "Presenting Sponsor",
    price: "$100,000",
    amount: 10000000, // cents
    blurb: "Maximum visibility. Exclusive leadership."
  },
  freedom: {
    name: "Freedom Sponsor",
    price: "$50,000",
    amount: 5000000,
    blurb: "High-impact visibility. Strong community presence."
  },
  legacy: {
    name: "Legacy Sponsor",
    price: "$25,000",
    amount: 2500000,
    blurb: "Solid brand exposure. Strong local presence."
  },
  community: {
    name: "Community Sponsor",
    price: "$10,000",
    amount: 1000000,
    blurb: "Local support. Community recognition."
  },
  ally: {
    name: "Ally Sponsor",
    price: "$1,500 – $5,000",
    amount: 150000,
    blurb: "Foundational support. Mission alignment."
  }
};

// ---- Replace these once you have Stripe keys ----
window.STRIPE_PUBLISHABLE_KEY = window.STRIPE_PUBLISHABLE_KEY || ""; // pk_live_... or pk_test_...
window.STRIPE_CHECKOUT_ENDPOINT = window.STRIPE_CHECKOUT_ENDPOINT || ""; // your backend that creates a Checkout Session

function showToast(msg) {
  const t = document.querySelector(".toast");
  if (!t) return;
  t.textContent = msg;
  t.classList.add("show");
  setTimeout(() => t.classList.remove("show"), 2200);
}

function openCheckout(tierKey) {
  const tier = TIERS[tierKey];
  if (!tier) return;
  const modal = document.querySelector(".checkout-modal");
  modal.querySelector(".tier-name").textContent = tier.name;
  modal.querySelector(".price").textContent = tier.price;
  modal.querySelector(".tier-blurb").textContent = tier.blurb;
  modal.dataset.tier = tierKey;
  modal.classList.add("open");
  setTimeout(() => modal.querySelector('input[name="company"]').focus(), 50);
}

function closeCheckout() {
  document.querySelector(".checkout-modal").classList.remove("open");
}

async function startCheckout(tierKey, formData) {
  // ---- Stripe wiring goes here once keys are available ----
  // Example (when ready):
  //   const res = await fetch(window.STRIPE_CHECKOUT_ENDPOINT, {
  //     method: "POST", headers: { "Content-Type": "application/json" },
  //     body: JSON.stringify({ tier: tierKey, ...formData })
  //   });
  //   const { url } = await res.json();
  //   window.location = url; // Stripe-hosted Checkout
  // ---- End Stripe wiring ----

  if (window.STRIPE_PUBLISHABLE_KEY && window.STRIPE_CHECKOUT_ENDPOINT) {
    try {
      const res = await fetch(window.STRIPE_CHECKOUT_ENDPOINT, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ tier: tierKey, ...formData })
      });
      const { url } = await res.json();
      if (url) { window.location = url; return; }
      throw new Error("No checkout URL returned");
    } catch (e) {
      console.error(e);
      showToast("Checkout error — using offline form");
    }
  }

  // Stub: pretend-process and confirm
  await new Promise(r => setTimeout(r, 800));
  const tier = TIERS[tierKey];
  alert(
    `Thank you, ${formData.contact || formData.company || "friend"}!\n\n` +
    `We've recorded your interest in the ${tier.name} (${tier.price}).\n\n` +
    `Stripe is being wired up — Todd will reach out within 24 hours at ${formData.email || "your email"} ` +
    `to finalize your sponsorship and confirm payment.\n\n— J.U.I.C.E.`
  );
  closeCheckout();
  showToast("Sponsorship interest received");
}

function wire() {
  // Hook every "Become {tier}" button
  document.querySelectorAll("[data-tier]").forEach(btn => {
    btn.addEventListener("click", e => {
      e.preventDefault();
      openCheckout(btn.getAttribute("data-tier"));
    });
  });

  const modal = document.querySelector(".checkout-modal");
  if (!modal) return;

  modal.querySelector(".cancel").addEventListener("click", closeCheckout);
  modal.addEventListener("click", e => { if (e.target === modal) closeCheckout(); });

  modal.querySelector("form").addEventListener("submit", async (e) => {
    e.preventDefault();
    const fd = new FormData(e.target);
    const formData = Object.fromEntries(fd.entries());
    const submitBtn = e.target.querySelector('button[type="submit"]');
    submitBtn.disabled = true;
    submitBtn.textContent = "Processing…";
    await startCheckout(modal.dataset.tier, formData);
    submitBtn.disabled = false;
    submitBtn.textContent = "Continue to payment";
  });
}

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", wire);
} else {
  wire();
}
