#!/usr/bin/env python3
"""Extract hourly and weekly listening patterns from Spotify extended streaming history.

Timestamps in the export are UTC. Use --tz-offset to shift to local time
(e.g. 1 for CET, 2 for CEST). A simple fixed offset is applied (no DST).
"""

from __future__ import annotations

import argparse
import json
from collections import defaultdict
from datetime import datetime, timezone, timedelta
from pathlib import Path

WEEKDAY_NAMES = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"]


def parse_args() -> argparse.Namespace:
    parser = argparse.ArgumentParser(
        description="Aggregate Spotify streams by hour of day and day of week."
    )
    parser.add_argument("--export-dir", required=True)
    parser.add_argument(
        "--output", default="assets/data/spotify_listening_clock.json"
    )
    parser.add_argument(
        "--tz-offset", type=int, default=1,
        help="UTC offset in whole hours (default: 1 for CET)."
    )
    parser.add_argument(
        "--min-ms", type=int, default=0,
        help="Minimum ms_played to count an event (default: 0)."
    )
    return parser.parse_args()


def main() -> int:
    args = parse_args()
    export_dir = Path(args.export_dir).expanduser().resolve()
    output_file = Path(args.output).expanduser().resolve()

    if not export_dir.exists():
        raise SystemExit(f"Export directory not found: {export_dir}")

    tz = timezone(timedelta(hours=args.tz_offset))

    hour_streams:   dict[int, int] = defaultdict(int)
    hour_ms:        dict[int, int] = defaultdict(int)
    weekday_streams: dict[int, int] = defaultdict(int)
    weekday_ms:     dict[int, int] = defaultdict(int)

    total = 0
    files = 0

    for json_file in sorted(export_dir.rglob("*.json")):
        try:
            data = json.loads(json_file.read_text(encoding="utf-8"))
        except (json.JSONDecodeError, OSError):
            continue
        if not isinstance(data, list) or not data:
            continue
        if not isinstance(data[0], dict) or "ts" not in data[0]:
            continue

        files += 1
        for event in data:
            if not isinstance(event, dict):
                continue
            ms = event.get("ms_played", 0) or 0
            if ms < args.min_ms:
                continue
            ts_raw = event.get("ts", "")
            if not ts_raw:
                continue
            try:
                dt = datetime.fromisoformat(ts_raw.replace("Z", "+00:00")).astimezone(tz)
            except ValueError:
                continue

            h = dt.hour
            w = dt.weekday()  # 0=Monday … 6=Sunday

            hour_streams[h]    += 1
            hour_ms[h]         += ms
            weekday_streams[w] += 1
            weekday_ms[w]      += ms
            total += 1

    by_hour = [
        {
            "hour":    h,
            "label":   f"{h:02d}:00",
            "streams": hour_streams[h],
            "minutes": round(hour_ms[h] / 60_000),
        }
        for h in range(24)
    ]

    by_weekday = [
        {
            "day":     d,
            "label":   WEEKDAY_NAMES[d],
            "streams": weekday_streams[d],
            "minutes": round(weekday_ms[d] / 60_000),
        }
        for d in range(7)
    ]

    output = {
        "title":      "Spotify Listening Patterns",
        "tz_offset":  args.tz_offset,
        "total":      total,
        "by_hour":    by_hour,
        "by_weekday": by_weekday,
    }

    output_file.parent.mkdir(parents=True, exist_ok=True)
    output_file.write_text(
        json.dumps(output, indent=4, ensure_ascii=False) + "\n", encoding="utf-8"
    )

    print(f"Files processed: {files}")
    print(f"Events counted:  {total}")
    print(f"Written to:      {output_file}")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
