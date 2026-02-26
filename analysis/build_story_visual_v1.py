#!/usr/bin/env python3
"""Builds Story V1 visual payloads for SvelteKit story app (beats 1-3)."""

from __future__ import annotations

import json
import math
from pathlib import Path
from statistics import median
from typing import Any

ROOT = Path(__file__).resolve().parents[1]
DATA_DIR = ROOT / "website" / "data"
APP_DATA_DIR = ROOT / "website" / "story_app" / "src" / "lib" / "data"

COPY_MAP_PATH = APP_DATA_DIR / "story_copy_map_v1.json"
VISUAL_OUT = APP_DATA_DIR / "story_visual_v1.json"
METRICS_OUT = APP_DATA_DIR / "story_metrics_v1.json"


def read_json(path: Path) -> Any:
    return json.loads(path.read_text())


def quantile(sorted_values: list[float], q: float) -> float:
    if not sorted_values:
        raise ValueError("Cannot compute quantile of empty list")
    if len(sorted_values) == 1:
        return sorted_values[0]
    i = (len(sorted_values) - 1) * q
    lo = int(math.floor(i))
    hi = int(math.ceil(i))
    frac = i - lo
    return sorted_values[lo] * (1 - frac) + sorted_values[hi] * frac


def build_scene_data() -> dict[str, Any]:
    metadata = read_json(DATA_DIR / "metadata.json")
    residuals = read_json(DATA_DIR / "residuals_long.json")
    country_year = read_json(DATA_DIR / "country_year_long.json")

    country_name = {r["Country.Code"]: r["Country.Name"] for r in metadata["countries"]}

    life_rows_2010 = [
        r
        for r in residuals
        if r["indicator"] == "life_exp"
        and r["Year"] == 2010
        and r["gni_percap"] is not None
        and r["value"] is not None
        and r["predicted"] is not None
        and r["quality_residual"] is not None
        and r["quality_residual_z"] is not None
    ]

    points = [
        {
            "code": r["Country.Code"],
            "name": country_name.get(r["Country.Code"], r["Country.Code"]),
            "gni_percap": float(r["gni_percap"]),
            "life_exp": float(r["value"]),
            "predicted": float(r["predicted"]),
            "residual_gap": float(r["quality_residual"]),
            "residual_z": float(r["quality_residual_z"]),
        }
        for r in life_rows_2010
    ]
    points.sort(key=lambda d: d["gni_percap"])

    model_ref = life_rows_2010[0]
    model = {
        "slope": float(model_ref["model_slope"]),
        "intercept": float(model_ref["model_intercept"]),
        "r2": float(model_ref["model_r2"]),
    }

    distribution: list[dict[str, Any]] = []
    for year in range(2006, 2016):
        rows = [
            r
            for r in residuals
            if r["indicator"] == "life_exp"
            and r["Year"] == year
            and r["quality_residual"] is not None
        ]
        gaps = [float(r["quality_residual"]) for r in rows]
        if not gaps:
            continue
        abs_gaps = sorted(abs(v) for v in gaps)
        distribution.append(
            {
                "year": year,
                "median_abs_gap": float(median(abs_gaps)),
                "p90_abs_gap": float(quantile(abs_gaps, 0.9)),
                "max_pos_gap": float(max(gaps)),
                "max_neg_gap": float(min(gaps)),
            }
        )

    country_series: list[dict[str, Any]] = []

    for code in ["RWA", "VNM"]:
        rows = [
            r
            for r in residuals
            if r["Country.Code"] == code
            and r["indicator"] == "life_exp"
            and 2006 <= r["Year"] <= 2015
            and r["gni_percap"] is not None
            and r["value"] is not None
            and r["predicted"] is not None
            and r["quality_residual"] is not None
        ]
        rows.sort(key=lambda r: int(r["Year"]))
        country_series.append(
            {
                "code": code,
                "metric": "life_exp_path",
                "values": [
                    {
                        "year": int(r["Year"]),
                        "value": float(r["value"]),
                        "gni_percap": float(r["gni_percap"]),
                        "predicted": float(r["predicted"]),
                        "residual_gap": float(r["quality_residual"]),
                    }
                    for r in rows
                ],
            }
        )

    under5_rows = [
        r
        for r in country_year
        if r["Country.Code"] == "RWA"
        and r["indicator"] == "mortality_rate_under5"
        and 2006 <= r["Year"] <= 2015
        and r["value"] is not None
    ]
    under5_rows.sort(key=lambda r: int(r["Year"]))
    country_series.append(
        {
            "code": "RWA",
            "metric": "under5",
            "values": [
                {
                    "year": int(r["Year"]),
                    "value": float(r["value"]),
                }
                for r in under5_rows
            ],
        }
    )

    return {
        "year_anchor": 2010,
        "points": points,
        "model": model,
        "country_series": country_series,
        "distribution": distribution,
    }


def build_metrics(scene_data: dict[str, Any]) -> dict[str, Any]:
    dist_2010 = next(d for d in scene_data["distribution"] if d["year"] == 2010)

    point_by_code = {p["code"]: p for p in scene_data["points"]}

    rwanda_under5_series = next(
        s for s in scene_data["country_series"] if s["code"] == "RWA" and s["metric"] == "under5"
    )["values"]
    rwanda_under5_2006 = next(v for v in rwanda_under5_series if v["year"] == 2006)["value"]
    rwanda_under5_2015 = next(v for v in rwanda_under5_series if v["year"] == 2015)["value"]

    rwanda_life_path = next(
        s for s in scene_data["country_series"] if s["code"] == "RWA" and s["metric"] == "life_exp_path"
    )["values"]
    rw_2006 = next(v for v in rwanda_life_path if v["year"] == 2006)
    rw_2015 = next(v for v in rwanda_life_path if v["year"] == 2015)

    vietnam_life_path = next(
        s for s in scene_data["country_series"] if s["code"] == "VNM" and s["metric"] == "life_exp_path"
    )["values"]
    vn_2010 = next(v for v in vietnam_life_path if v["year"] == 2010)
    vn_2015 = next(v for v in vietnam_life_path if v["year"] == 2015)

    return {
        "scene_data": scene_data,
        "kpis": {
            "country_count": len(scene_data["points"]),
            "r2_2010": scene_data["model"]["r2"],
            "median_abs_gap_2010": dist_2010["median_abs_gap"],
            "p90_abs_gap_2010": dist_2010["p90_abs_gap"],
            "max_pos_gap_2010": dist_2010["max_pos_gap"],
            "max_neg_gap_2010": dist_2010["max_neg_gap"],
        },
        "beat_metrics": {
            "b1_curve": {
                "r2": scene_data["model"]["r2"],
                "median_abs_gap": dist_2010["median_abs_gap"],
                "p90_abs_gap": dist_2010["p90_abs_gap"],
                "max_pos_gap": dist_2010["max_pos_gap"],
                "max_neg_gap": dist_2010["max_neg_gap"],
            },
            "b2_rwanda": {
                "under5_2006": rwanda_under5_2006,
                "under5_2015": rwanda_under5_2015,
                "life_gap_2006": rw_2006["residual_gap"],
                "life_gap_2015": rw_2015["residual_gap"],
            },
            "b3_vietnam": {
                "gap_2010": vn_2010["residual_gap"],
                "gap_2015": vn_2015["residual_gap"],
                "vietnam_2010_life_exp": point_by_code["VNM"]["life_exp"],
            },
        },
    }


def build_story_visual(copy_map: dict[str, Any], metrics: dict[str, Any]) -> dict[str, Any]:
    beat_metrics = metrics["beat_metrics"]

    detail_cards = {
        "b1_curve": [
            {
                "label": "Model fit (2010)",
                "value": f"R² {beat_metrics['b1_curve']['r2']:.2f}",
                "note": "Income explains much, not all."
            },
            {
                "label": "Typical distance",
                "value": f"{beat_metrics['b1_curve']['median_abs_gap']:.1f} years",
                "note": "Median absolute gap"
            },
            {
                "label": "Tail distance",
                "value": f"{beat_metrics['b1_curve']['p90_abs_gap']:.1f} years",
                "note": "90th percentile absolute gap"
            },
            {
                "label": "2010 extremes",
                "value": f"+{beat_metrics['b1_curve']['max_pos_gap']:.1f} / {beat_metrics['b1_curve']['max_neg_gap']:.1f}",
                "note": "Residual gap range"
            }
        ],
        "b2_rwanda": [
            {
                "label": "Under-5 mortality",
                "value": f"{beat_metrics['b2_rwanda']['under5_2006']:.1f} -> {beat_metrics['b2_rwanda']['under5_2015']:.1f}",
                "note": "Rwanda, 2006 to 2015"
            },
            {
                "label": "Line-relative shift",
                "value": f"{beat_metrics['b2_rwanda']['life_gap_2006']:+.1f}y -> {beat_metrics['b2_rwanda']['life_gap_2015']:+.1f}y",
                "note": "Life expectancy gap vs expectation"
            }
        ],
        "b3_vietnam": [
            {
                "label": "Vietnam 2010 gap",
                "value": f"{beat_metrics['b3_vietnam']['gap_2010']:+.1f} years",
                "note": "Above expected life expectancy"
            },
            {
                "label": "Vietnam 2015 gap",
                "value": f"{beat_metrics['b3_vietnam']['gap_2015']:+.1f} years",
                "note": "Still above expectation"
            }
        ],
    }

    beats = []
    for beat in copy_map["beats"]:
        beat_id = beat["beat_id"]
        beats.append(
            {
                **beat,
                "detail_cards": detail_cards.get(beat_id, []),
            }
        )

    return {
        "story_id": copy_map["story_id"],
        "title": copy_map["title"],
        "dek": copy_map["dek"],
        "beats": beats,
        "theme": {
            "colors": {
                "ink": "#111827",
                "muted": "#6b7280",
                "accent": "#0f766e",
                "positive": "#166534",
                "negative": "#991b1b",
                "paper": "#faf9f7",
                "grid": "#e5e7eb",
            },
            "type": {
                "headline": "Source Serif 4",
                "body": "Inter",
            },
            "motion": {
                "base_ms": 420,
                "slow_ms": 560,
                "easing": "cubic-bezier(0.2, 0, 0, 1)",
            },
        },
        "version": copy_map.get("version", "v1.0.0"),
    }


def main() -> None:
    APP_DATA_DIR.mkdir(parents=True, exist_ok=True)

    copy_map = read_json(COPY_MAP_PATH)
    scene_data = build_scene_data()
    metrics = build_metrics(scene_data)
    story_visual = build_story_visual(copy_map, metrics)

    VISUAL_OUT.write_text(json.dumps(story_visual, indent=2))
    METRICS_OUT.write_text(json.dumps(metrics, indent=2))

    print(f"Wrote {VISUAL_OUT}")
    print(f"Wrote {METRICS_OUT}")


if __name__ == "__main__":
    main()
