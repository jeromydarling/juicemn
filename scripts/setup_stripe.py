#!/usr/bin/env python3
"""
JUICE — One-shot Stripe setup.

Reads the Stripe restricted key from STRIPE_API_KEY, then creates
(idempotently) the Products, Prices, and Payment Links for the five
sponsorship tiers. Writes assets/data/payment-links.json with the
resulting URLs so the site can use them.

Idempotent on Stripe metadata.tier — re-running won't duplicate.
"""
import json
import os
import sys

import stripe

# ---------------------------------------------------------------------------
# Config
# ---------------------------------------------------------------------------

REDIRECT_URL = "https://juicemn.com/thank-you.html"

TIERS = [
    {
        "key": "presenting",
        "name": "Presenting Sponsor — MN Juneteenth Jamboree 2026",
        "tagline": "Maximum visibility. Exclusive leadership. Top placement on all marketing, event t-shirts, stage banners, and day-of announcements.",
        "amount": 100_000_00,  # $100,000 in cents
    },
    {
        "key": "freedom",
        "name": "Freedom Sponsor — MN Juneteenth Jamboree 2026",
        "tagline": "High-impact visibility. Strong community presence. Prominent logo on all marketing, social, stage recognition, event t-shirts, premium booth.",
        "amount": 50_000_00,
    },
    {
        "key": "legacy",
        "name": "Legacy Sponsor — MN Juneteenth Jamboree 2026",
        "tagline": "Solid brand exposure. Logo on select promotional materials, social mentions, stage acknowledgment, shared vendor space, program ads.",
        "amount": 25_000_00,
    },
    {
        "key": "community",
        "name": "Community Sponsor — MN Juneteenth Jamboree 2026",
        "tagline": "Local support. Name and logo on digital materials, event signage, group program acknowledgments, booth space option, social recognition.",
        "amount": 10_000_00,
    },
    {
        "key": "ally",
        "name": "Ally Sponsor — MN Juneteenth Jamboree 2026",
        "tagline": "Foundational support. Mission alignment. Choose any amount between $1,500 and $5,000.",
        # Pay-what-you-want between $1,500 and $5,000, default $2,500
        "custom_amount": {
            "minimum": 1_500_00,
            "maximum": 5_000_00,
            "preset": 2_500_00,
        },
    },
]

CUSTOM_FIELDS = [
    {
        "key": "company",
        "label": {"type": "custom", "custom": "Company / Organization"},
        "type": "text",
        "optional": False,
    },
    {
        "key": "notes",
        "label": {"type": "custom", "custom": "Anything we should know"},
        "type": "text",
        "optional": True,
    },
]

# ---------------------------------------------------------------------------
# Helpers
# ---------------------------------------------------------------------------

def find_product(tier_key):
    for p in stripe.Product.list(active=True, limit=100).auto_paging_iter():
        if p.metadata.get("tier") == tier_key:
            return p
    return None


def find_price(product_id, tier_key):
    for pr in stripe.Price.list(product=product_id, active=True, limit=100).data:
        if pr.metadata.get("tier") == tier_key:
            return pr
    return None


def find_payment_link(tier_key):
    for ln in stripe.PaymentLink.list(active=True, limit=100).auto_paging_iter():
        if ln.metadata.get("tier") == tier_key:
            return ln
    return None


def upsert_product(tier):
    p = find_product(tier["key"])
    if p:
        # Refresh name/description in case copy changes
        p = stripe.Product.modify(
            p.id,
            name=tier["name"],
            description=tier["tagline"],
            metadata={"tier": tier["key"], "managed_by": "juicemn-setup"},
        )
        action = "found"
    else:
        p = stripe.Product.create(
            name=tier["name"],
            description=tier["tagline"],
            metadata={"tier": tier["key"], "managed_by": "juicemn-setup"},
        )
        action = "created"
    return p, action


def upsert_price(product, tier):
    pr = find_price(product.id, tier["key"])
    if pr:
        # Prices in Stripe are immutable for amount, so if it matches we keep it.
        if "custom_amount" in tier and pr.custom_unit_amount:
            return pr, "found"
        if "amount" in tier and pr.unit_amount == tier["amount"]:
            return pr, "found"
        # Mismatch — archive old price, create new
        stripe.Price.modify(pr.id, active=False)

    kwargs = {
        "product": product.id,
        "currency": "usd",
        "metadata": {"tier": tier["key"], "managed_by": "juicemn-setup"},
    }
    if "custom_amount" in tier:
        kwargs["custom_unit_amount"] = {
            "enabled": True,
            "minimum": tier["custom_amount"]["minimum"],
            "maximum": tier["custom_amount"]["maximum"],
            "preset": tier["custom_amount"]["preset"],
        }
    else:
        kwargs["unit_amount"] = tier["amount"]
    pr = stripe.Price.create(**kwargs)
    return pr, "created"


def upsert_payment_link(price, tier):
    ln = find_payment_link(tier["key"])
    if ln:
        # Refresh redirect + custom fields in case the URL or fields change
        ln = stripe.PaymentLink.modify(
            ln.id,
            after_completion={
                "type": "redirect",
                "redirect": {"url": REDIRECT_URL},
            },
            custom_fields=CUSTOM_FIELDS,
            metadata={"tier": tier["key"], "managed_by": "juicemn-setup"},
        )
        return ln, "found"
    ln = stripe.PaymentLink.create(
        line_items=[{"price": price.id, "quantity": 1}],
        after_completion={
            "type": "redirect",
            "redirect": {"url": REDIRECT_URL},
        },
        custom_fields=CUSTOM_FIELDS,
        phone_number_collection={"enabled": True},
        metadata={"tier": tier["key"], "managed_by": "juicemn-setup"},
    )
    return ln, "created"


# ---------------------------------------------------------------------------
# Main
# ---------------------------------------------------------------------------

def main():
    key = os.environ.get("STRIPE_API_KEY", "").strip()
    if not key:
        print("ERROR: STRIPE_API_KEY env var is empty.", file=sys.stderr)
        sys.exit(1)
    stripe.api_key = key

    mode = "live" if key.startswith(("sk_live_", "rk_live_")) else "test"
    print(f"Stripe mode: {mode}")

    output = {"mode": mode, "tiers": {}}

    for tier in TIERS:
        product, p_action = upsert_product(tier)
        price, pr_action = upsert_price(product, tier)
        link, ln_action = upsert_payment_link(price, tier)

        output["tiers"][tier["key"]] = {
            "name": tier["name"].split(" — ")[0],
            "product_id": product.id,
            "price_id": price.id,
            "payment_link_id": link.id,
            "url": link.url,
        }
        print(
            f"  {tier['key']:<11}  product={p_action:<7}  "
            f"price={pr_action:<7}  link={ln_action:<7}  {link.url}"
        )

    out_path = "assets/data/payment-links.json"
    os.makedirs(os.path.dirname(out_path), exist_ok=True)
    with open(out_path, "w") as f:
        json.dump(output, f, indent=2)
        f.write("\n")
    print(f"\nWrote {out_path}")


if __name__ == "__main__":
    main()
