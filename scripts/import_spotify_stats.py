#!/usr/bin/env python3
"""Import Spotify advanced streaming history into spotify_stats.json.

This script scans a Spotify data export directory for JSON files containing
streaming events, aggregates listening minutes and stream counts per month,
and updates the target spotify_stats.json structure.
"""

from __future__ import annotations

import argparse
import calendar
import json
from collections import defaultdict
from datetime import datetime
from pathlib import Path
from typing import Any


TIMESTAMP_KEYS = ("ts", "endTime", "timestamp", "played_at")
MS_KEYS = ("ms_played", "msPlayed")


def parse_args() -> argparse.Namespace:
    parser = argparse.ArgumentParser(
        description=(
            "Aggregate Spotify advanced streaming history per month and write "
            "into spotify_stats.json."
        )
    )
    parser.add_argument(
        "--export-dir",
        required=True,
        help="Path to unzipped Spotify account data export directory.",
    )
    parser.add_argument(
        "--stats-file",
        default="assets/data/spotify_stats.json",
        help="Path to spotify_stats.json (default: assets/data/spotify_stats.json).",
    )
    parser.add_argument(
        "--min-ms",
        type=int,
        default=30000,
        help="Minimum play duration in ms to count a stream (default: 30000).",
    )
    parser.add_argument(
        "--mode",
        choices=("fill-missing", "overwrite-months"),
        default="fill-missing",
        help=(
            "fill-missing keeps existing months in stats-file unchanged; "
            "overwrite-months replaces imported months."
        ),
    )
    return parser.parse_args()


def find_first_key(d: dict[str, Any], keys: tuple[str, ...]) -> Any | None:
    for key in keys:
        if key in d:
            return d[key]
    return None


def parse_iso_datetime(value: str) -> datetime | None:
    text = value.strip()
    if not text:
        return None

    # Spotify commonly uses trailing Z.
    if text.endswith("Z"):
        text = text[:-1] + "+00:00"

    try:
        return datetime.fromisoformat(text)
    except ValueError:
        return None


def looks_like_stream_events(data: Any) -> bool:
    if not isinstance(data, list) or not data:
        return False
    first = data[0]
    return isinstance(first, dict) and find_first_key(first, TIMESTAMP_KEYS) is not None


def collect_events(export_dir: Path, min_ms: int) -> tuple[dict[str, dict[str, dict[str, int]]], int, int]:
    monthly_ms: dict[tuple[str, str], int] = defaultdict(int)
    monthly_streams: dict[tuple[str, str], int] = defaultdict(int)

    files_scanned = 0
    matching_files = 0

    for json_file in sorted(export_dir.rglob("*.json")):
        files_scanned += 1
        try:
            with json_file.open("r", encoding="utf-8") as f:
                data = json.load(f)
        except (json.JSONDecodeError, OSError):
            continue

        if not looks_like_stream_events(data):
            continue

        matching_files += 1

        for event in data:
            if not isinstance(event, dict):
                continue

            ts_raw = find_first_key(event, TIMESTAMP_KEYS)
            if not isinstance(ts_raw, str):
                continue
            dt = parse_iso_datetime(ts_raw)
            if dt is None:
                continue

            ms_value = find_first_key(event, MS_KEYS)
            try:
                ms = int(ms_value)
            except (TypeError, ValueError):
                continue

            if ms < min_ms:
                continue

            year = str(dt.year)
            month = calendar.month_name[dt.month]
            key = (year, month)

            monthly_ms[key] += ms
            monthly_streams[key] += 1

    nested: dict[str, dict[str, dict[str, int]]] = {}
    for (year, month), ms_sum in monthly_ms.items():
        nested.setdefault(year, {})[month] = {
            "minutes": round(ms_sum / 60000),
            "streams": monthly_streams[(year, month)],
        }

    return nested, files_scanned, matching_files


def sort_years(years: dict[str, Any]) -> dict[str, Any]:
    def year_key(value: str) -> tuple[int, str]:
        return (int(value), value) if value.isdigit() else (10**9, value)

    ordered: dict[str, Any] = {}
    for year in sorted(years.keys(), key=year_key):
        months = years[year]
        ordered_months: dict[str, Any] = {}
        for month_num in range(1, 13):
            month_name = calendar.month_name[month_num]
            if month_name in months:
                ordered_months[month_name] = months[month_name]
        # Keep any non-standard keys at the end.
        for extra_key, extra_value in months.items():
            if extra_key not in ordered_months:
                ordered_months[extra_key] = extra_value
        ordered[year] = ordered_months
    return ordered


def merge_stats(
    existing: dict[str, Any],
    imported: dict[str, dict[str, dict[str, int]]],
    mode: str,
) -> tuple[int, int]:
    existing.setdefault("Year", {})
    years: dict[str, dict[str, dict[str, int]]] = existing["Year"]

    months_inserted = 0
    months_replaced = 0

    for year, months in imported.items():
        years.setdefault(year, {})
        for month, payload in months.items():
            if month in years[year]:
                if mode == "overwrite-months":
                    years[year][month] = payload
                    months_replaced += 1
                continue
            years[year][month] = payload
            months_inserted += 1

    existing["Year"] = sort_years(years)
    return months_inserted, months_replaced


def main() -> int:
    args = parse_args()

    export_dir = Path(args.export_dir).expanduser().resolve()
    stats_file = Path(args.stats_file).expanduser().resolve()

    if not export_dir.exists() or not export_dir.is_dir():
        raise SystemExit(f"Export directory not found: {export_dir}")

    if not stats_file.exists():
        raise SystemExit(f"Stats file not found: {stats_file}")

    imported, files_scanned, matching_files = collect_events(export_dir, args.min_ms)
    if not imported:
        raise SystemExit(
            "No streaming events found. Make sure you pointed to the unzipped Spotify export directory."
        )

    with stats_file.open("r", encoding="utf-8") as f:
        existing = json.load(f)

    inserted, replaced = merge_stats(existing, imported, args.mode)

    with stats_file.open("w", encoding="utf-8") as f:
        json.dump(existing, f, indent=4, ensure_ascii=False)
        f.write("\n")

    imported_months = sum(len(months) for months in imported.values())
    print(f"Scanned JSON files: {files_scanned}")
    print(f"Detected streaming-history files: {matching_files}")
    print(f"Imported months from export: {imported_months}")
    print(f"Inserted new months: {inserted}")
    if args.mode == "overwrite-months":
        print(f"Replaced existing months: {replaced}")
    print(f"Updated: {stats_file}")

    return 0


if __name__ == "__main__":
    raise SystemExit(main())
