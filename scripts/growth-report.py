#!/usr/bin/env python3
"""Generate an internal TRAUMA operating report from normalized, local exports."""
import argparse
import csv
import json
import sys
from collections import defaultdict
from datetime import date
from pathlib import Path


def rows(path, columns):
    if path is None:
        return None
    with path.open(encoding="utf-8-sig", newline="") as file:
        reader = csv.DictReader(file)
        if not set(columns).issubset(reader.fieldnames or []):
            raise ValueError(f"{path.name}: expected columns {', '.join(columns)}")
        return [{key: (record.get(key) or "").strip() for key in columns} for record in reader]


def num(value):
    if not value.isascii() or not value.isdecimal():
        raise ValueError("Counts must be whole numbers without formatting.")
    return int(value)


def normalized(value):
    return " ".join(value.casefold().split())


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--inventory", type=Path, default=Path(__file__).resolve().parents[1] / "data/inventory.json")
    parser.add_argument("--products", type=Path, help="product_id,seller_sku,title,status across all statuses")
    parser.add_argument("--complete-products", action="store_true", help="Verify full catalog including all statuses before using")
    parser.add_argument("--videos", type=Path, help="video_id,posted_date,linked_product_ids (IDs separated by |)")
    parser.add_argument("--complete-videos", action="store_true", help="Verify all videos for the intended period are present")
    parser.add_argument("--metrics", type=Path, help="product_id,product_clicks,paid_orders for a consistent reporting window")
    parser.add_argument("--subscribers", type=Path, help="week_start,source,confirmed_new,unsubscribed; aggregate counts, no emails")
    parser.add_argument("--window", default="Not supplied")
    args = parser.parse_args()
    if args.complete_products and args.products is None or args.complete_videos and args.videos is None:
        parser.error("An export is required before declaring coverage complete.")
    inventory = json.loads(args.inventory.read_text(encoding="utf-8"))["products"]
    active = [p for p in inventory if p.get("published") and p.get("ownerConfirmed") and not p.get("sold")]
    active = [p for p in active if p.get("orderType") != "custom" and
              p.get("fulfillmentType") != "digital" and p.get("inventoryType") != "digital" and not p.get("payhipUrl")]
    sellers = rows(args.products, ("product_id", "seller_sku", "title", "status"))
    videos = rows(args.videos, ("video_id", "posted_date", "linked_product_ids"))
    metrics = rows(args.metrics, ("product_id", "product_clicks", "paid_orders"))
    subscribers = rows(args.subscribers, ("week_start", "source", "confirmed_new", "unsubscribed"))
    result = {"window": args.window, "website_inventory_records": len(inventory), "website_ready_made_apparel": len(active)}
    if sellers is None:
        result["catalog"] = {"coverage": "unavailable", "missing": None, "duplicates": None, "next": "Supply all statuses."}
    else:
        by_sku = defaultdict(set)
        by_title = defaultdict(set)
        for row in sellers:
            if not row["product_id"] or not row["status"]:
                raise ValueError("All TikTok product rows need a product ID and status.")
            if row["seller_sku"]:
                by_sku[normalized(row["seller_sku"])].add(row["product_id"])
            if row["title"]:
                by_title[normalized(row["title"])].add(row["product_id"])
        candidates = []
        for item in active:
            exact = sorted(by_sku[normalized(item["id"])])
            similar = sorted(by_title[normalized(item["name"])])
            if len(exact) > 1:
                state = "duplicate-sku-hold"
            elif exact:
                state = "inspect-existing-id-and-physical-unit"
            elif similar:
                state = "possible-match-review"
            elif args.complete_products:
                state = "no-exact-match-review-photos-before-create"
            else:
                state = "unverified-partial-export"
            candidates.append({"site_id": item["id"], "name": item["name"], "state": state,
                               "matched_seller_product_ids": exact, "similar_title_ids": similar})
        result["catalog"] = {
            "coverage": "operator-confirmed all statuses" if args.complete_products else "partial",
            "missing": [x for x in candidates if x["state"].startswith("no-exact-match")] if args.complete_products else None,
            "duplicates": [{"sku": k, "product_ids": sorted(v)} for k, v in by_sku.items() if len(v) > 1],
            "same_title_review": [{"normalized_title": k, "product_ids": sorted(v)} for k, v in by_title.items() if len(v) > 1],
            "comparison": candidates,
        }
    if videos is None:
        result["videos"] = {"coverage": "unavailable", "videos_without_links": None, "active_products_without_video": None}
    else:
        attached = set()
        unlinked = []
        seen = set()
        for row in videos:
            date.fromisoformat(row["posted_date"])
            if not row["video_id"] or row["video_id"] in seen:
                raise ValueError("Video export must have one row per unique video ID.")
            seen.add(row["video_id"])
            links = {value.strip() for value in row["linked_product_ids"].split("|") if value.strip()}
            attached.update(links)
            if not links:
                unlinked.append(row["video_id"])
        active_ids = {r["product_id"] for r in sellers or [] if normalized(r["status"]) in {"active", "live"}}
        result["videos"] = {
            "coverage": "operator-confirmed window" if args.complete_videos else "partial",
            "videos_without_links": unlinked,
            "active_products_without_video": sorted(active_ids - attached) if args.complete_products and args.complete_videos else None,
        }
    if metrics is None:
        result["conversion"] = {"coverage": "unavailable", "ranked": None}
    else:
        if len({row["product_id"] for row in metrics}) != len(metrics) or any(not row["product_id"] for row in metrics):
            raise ValueError("Metrics must have one row per TikTok product ID and window; do not combine overlapping segments.")
        ranked = []
        small_sample = []
        for row in metrics:
            clicks, orders = num(row["product_clicks"]), num(row["paid_orders"])
            if orders > clicks:
                raise ValueError("Use paid orders attributed to the same click funnel and window.")
            values = {"product_id": row["product_id"], "clicks": clicks, "paid_orders": orders}
            if clicks >= 30:
                ranked.append({**values, "paid_order_rate": orders / clicks})
            else:
                small_sample.append(values)
        result["conversion"] = {"minimum_clicks": 30, "ranked": sorted(ranked, key=lambda r: (-r["paid_order_rate"], -r["clicks"], r["product_id"])), "small_sample": small_sample}
    if subscribers is None:
        result["subscribers"] = {"coverage": "unavailable", "weekly": None}
    else:
        seen = set()
        weekly = defaultdict(lambda: {"confirmed_new": 0, "unsubscribed": 0, "sources": []})
        for row in subscribers:
            week, source = row["week_start"], row["source"] or "unknown"
            if date.fromisoformat(week).weekday() != 0 or (week, source) in seen:
                raise ValueError("Use one row per Monday start date and attribution source.")
            seen.add((week, source))
            add, lost = num(row["confirmed_new"]), num(row["unsubscribed"])
            weekly[week]["confirmed_new"] += add
            weekly[week]["unsubscribed"] += lost
            weekly[week]["sources"].append({"source": source, "confirmed_new": add, "unsubscribed": lost})
        result["subscribers"] = {"weekly": [{"week_start": week, **data, "net_new": data["confirmed_new"] - data["unsubscribed"]} for week, data in sorted(weekly.items())]}
    result["next_actions"] = ["Resolve exact product matches and check photos before creating any listing.",
                              "Film clean original apparel and use only an active listing for the exact product.",
                              "Connect a confirmed opt-in provider, then measure confirmed subscribers by QR or tap placement.",
                              "Use margin-checked manual offers for one-of-one pieces."]
    print(json.dumps(result, indent=2, ensure_ascii=False))


if __name__ == "__main__":
    try:
        main()
    except (OSError, ValueError, KeyError) as error:
        sys.exit(str(error))
