#!/usr/bin/env python3
"""Build V5 story payloads for full seven-beat scrollytelling."""

from __future__ import annotations

import json
import math
from pathlib import Path
from statistics import median
from typing import Any

ROOT = Path(__file__).resolve().parents[1]
DATA_DIR = ROOT / "website" / "data"
APP_DATA_DIR = ROOT / "website" / "story_app" / "src" / "lib" / "data"

COPY_MAP_PATH = APP_DATA_DIR / "story_copy_map_v5.json"
VISUAL_OUT = APP_DATA_DIR / "story_visual_v5.json"
METRICS_OUT = APP_DATA_DIR / "story_metrics_v5.json"
CARDS_OUT = APP_DATA_DIR / "story_cards_v5.json"
SCRIPT_V5_PATH = ROOT / "docs" / "story_script_v5.md"

BEAT_ORDER = [
    "b1_curve_mechanism",
    "b2_rwanda_trajectory",
    "b3_vietnam_brief",
    "b4_us_comparison_arc",
    "b5_mirror_case",
    "b6_what_changes_gap",
    "b7_close",
]


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


def metric_value(country_rows: list[dict[str, Any]], code: str, indicator: str, year: int) -> float:
    row = next(
        r
        for r in country_rows
        if r["Country.Code"] == code and r["indicator"] == indicator and int(r["Year"]) == year and r["value"] is not None
    )
    return float(row["value"])


def _visual_marker_to_beat(marker: str, current_beat: str) -> str:
    if "Cut to Rwanda only" in marker:
        return "b2_rwanda_trajectory"
    if "Vietnam dot appears" in marker:
        return "b3_vietnam_brief"
    if "Rwanda and Vietnam fade" in marker:
        return "b4_us_comparison_arc"
    if "U.S. fades. Equatorial Guinea" in marker:
        return "b5_mirror_case"
    if "Return to full global scatter" in marker:
        return "b6_what_changes_gap"
    return current_beat


def parse_script_cards_from_md(path: Path) -> dict[str, list[dict[str, Any]]]:
    text = path.read_text()
    lines = text.splitlines()

    cards_by_beat: dict[str, list[str]] = {beat_id: [] for beat_id in BEAT_ORDER}
    started = False
    current_beat = "b1_curve_mechanism"

    for raw in lines:
        line = raw.rstrip()
        stripped = line.strip()

        if stripped.startswith("## Methods Endnote"):
            break

        # Start parsing at the first story visual cue.
        if not started:
            if stripped.startswith("[VISUAL: Empty scatter axes"):
                started = True
            continue

        # Visual cues drive beat boundaries, but are not rendered in the prose panel.
        if stripped.startswith("[VISUAL:"):
            current_beat = _visual_marker_to_beat(stripped, current_beat)
            continue

        # Close beat is explicit in the script body.
        if stripped.startswith("The hopeful reading is not that progress is automatic. It is that progress is governable."):
            current_beat = "b7_close"

        if not stripped:
            continue

        # Ignore markdown-level structure lines.
        if stripped.startswith("#"):
            continue
        if stripped == "---":
            continue
        if stripped.startswith("- "):
            continue

        cards_by_beat[current_beat].append(stripped)

    cards_payload: dict[str, list[dict[str, Any]]] = {}
    for beat_id in BEAT_ORDER:
        beat_cards = []
        for idx, paragraph in enumerate(cards_by_beat.get(beat_id, []), start=1):
            beat_cards.append(
                {
                    "card_id": f"{beat_id}_l{idx:02d}",
                    "headline": f"{beat_id}_l{idx:02d}",
                    "body": paragraph,
                    "visual_cue": "script_line",
                }
            )
        cards_payload[beat_id] = beat_cards

    return cards_payload


def build_scene_data() -> dict[str, Any]:
    metadata = read_json(DATA_DIR / "metadata.json")
    residuals = read_json(DATA_DIR / "residuals_long.json")
    country_year = read_json(DATA_DIR / "country_year_long.json")
    country_trends = read_json(DATA_DIR / "country_trends.json")

    country_name = {r["Country.Code"]: r["Country.Name"] for r in metadata["countries"]}

    def life_rows_for_year(year: int) -> list[dict[str, Any]]:
        rows = [
            r
            for r in residuals
            if r["indicator"] == "life_exp"
            and int(r["Year"]) == year
            and r["gni_percap"] is not None
            and r["value"] is not None
            and r["predicted"] is not None
            and r["quality_residual"] is not None
            and r["quality_residual_z"] is not None
        ]
        rows.sort(key=lambda r: float(r["gni_percap"]))
        return rows

    year_points: list[dict[str, Any]] = []
    for year in range(2006, 2016):
        rows = life_rows_for_year(year)
        year_points.append(
            {
                "year": year,
                "points": [
                    {
                        "code": r["Country.Code"],
                        "name": country_name.get(r["Country.Code"], r["Country.Code"]),
                        "gni_percap": float(r["gni_percap"]),
                        "life_exp": float(r["value"]),
                        "predicted": float(r["predicted"]),
                        "residual_gap": float(r["quality_residual"]),
                        "residual_z": float(r["quality_residual_z"]),
                    }
                    for r in rows
                ],
            }
        )

    points_2010 = next(y["points"] for y in year_points if y["year"] == 2010)
    rows_2010 = life_rows_for_year(2010)
    model_ref = rows_2010[0]
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
            if r["indicator"] == "life_exp" and int(r["Year"]) == year and r["quality_residual"] is not None
        ]
        gaps = [float(r["quality_residual"]) for r in rows]
        abs_gaps = sorted(abs(v) for v in gaps)
        distribution.append(
            {
                "year": year,
                "median_abs_gap": float(median(abs_gaps)),
                "p90_abs_gap": float(quantile(abs_gaps, 0.9)),
                "max_pos_gap": float(max(gaps)),
                "max_neg_gap": float(min(gaps)),
                "mean_abs_gap": float(sum(abs_gaps) / len(abs_gaps)),
            }
        )

    country_series: list[dict[str, Any]] = []
    for code in ["RWA", "VNM", "USA"]:
        rows = [
            r
            for r in residuals
            if r["Country.Code"] == code
            and r["indicator"] == "life_exp"
            and 2006 <= int(r["Year"]) <= 2015
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
        and 2006 <= int(r["Year"]) <= 2015
        and r["value"] is not None
    ]
    under5_rows.sort(key=lambda r: int(r["Year"]))
    country_series.append(
        {
            "code": "RWA",
            "metric": "under5",
            "values": [{"year": int(r["Year"]), "value": float(r["value"])} for r in under5_rows],
        }
    )

    points_by_code_2010 = {p["code"]: p for p in points_2010}

    us_rows = [r for r in rows_2010 if r.get("Income.Group") == "High income" and r["Country.Code"] != "USA"]
    usa_income = points_by_code_2010["USA"]["gni_percap"]
    us_rows.sort(key=lambda r: abs(math.log(float(r["gni_percap"]) / usa_income)))
    us_peer_codes = [r["Country.Code"] for r in us_rows[:17]]

    def trend_row(code: str, indicator: str) -> dict[str, Any]:
        return next(r for r in country_trends if r["Country.Code"] == code and r["indicator"] == indicator)

    def peer_mean_pct_change(indicator: str) -> float:
        rows = [
            r
            for r in country_trends
            if r["indicator"] == indicator
            and r["Income.Group"] == "High income"
            and r["Country.Code"] != "USA"
            and r["pct_change"] is not None
        ]
        return float(sum(float(r["pct_change"]) for r in rows) / len(rows))

    us_life_rows = [
        r
        for r in residuals
        if r["Country.Code"] == "USA"
        and r["indicator"] == "life_exp"
        and int(r["Year"]) in (2006, 2010, 2015)
        and r["quality_residual"] is not None
    ]
    us_gap = {int(r["Year"]): float(r["quality_residual"]) for r in us_life_rows}

    dist_2006 = next(d for d in distribution if d["year"] == 2006)
    dist_2015 = next(d for d in distribution if d["year"] == 2015)

    snapshots = {
        "usa_2010_actual": float(points_by_code_2010["USA"]["life_exp"]),
        "usa_2010_predicted": float(points_by_code_2010["USA"]["predicted"]),
        "usa_gap_2006": us_gap[2006],
        "usa_gap_2010": us_gap[2010],
        "usa_gap_2015": us_gap[2015],
        "usa_maternal_2006": metric_value(country_year, "USA", "maternal_mortality_ratio", 2006),
        "usa_maternal_2015": metric_value(country_year, "USA", "maternal_mortality_ratio", 2015),
        "usa_infant_pct_change": float(trend_row("USA", "mortality_rate_infant")["pct_change"]),
        "usa_under5_pct_change": float(trend_row("USA", "mortality_rate_under5")["pct_change"]),
        "peer_maternal_pct_change": peer_mean_pct_change("maternal_mortality_ratio"),
        "peer_infant_pct_change": peer_mean_pct_change("mortality_rate_infant"),
        "peer_under5_pct_change": peer_mean_pct_change("mortality_rate_under5"),
        "can_maternal_2006": metric_value(country_year, "CAN", "maternal_mortality_ratio", 2006),
        "can_maternal_2015": metric_value(country_year, "CAN", "maternal_mortality_ratio", 2015),
        "vnm_gap_2010": float(points_by_code_2010["VNM"]["residual_gap"]),
        "gnq_2010_actual": float(points_by_code_2010["GNQ"]["life_exp"]),
        "gnq_2010_predicted": float(points_by_code_2010["GNQ"]["predicted"]),
        "sle_maternal_2010": metric_value(country_year, "SLE", "maternal_mortality_ratio", 2010),
        "dist_2006_median_abs_gap": float(dist_2006["median_abs_gap"]),
        "dist_2015_median_abs_gap": float(dist_2015["median_abs_gap"]),
        "dist_2006_p90_abs_gap": float(dist_2006["p90_abs_gap"]),
        "dist_2015_p90_abs_gap": float(dist_2015["p90_abs_gap"]),
    }

    return {
        "year_anchor": 2010,
        "points": points_2010,
        "year_points": year_points,
        "model": model,
        "country_series": country_series,
        "distribution": distribution,
        "us_peer_codes": us_peer_codes,
        "snapshots": snapshots,
    }


def build_claim_registry(scene_data: dict[str, Any]) -> list[dict[str, Any]]:
    d2010 = next(d for d in scene_data["distribution"] if d["year"] == 2010)
    snap = scene_data["snapshots"]

    return [
        {"claim_id": "q01", "value": len(scene_data["points"]), "source_ref": "website/data/metadata.json"},
        {"claim_id": "q02", "value": scene_data["model"]["r2"], "source_ref": "website/data/residuals_long.json"},
        {"claim_id": "q03", "value": d2010["median_abs_gap"], "source_ref": "website/data/residuals_long.json"},
        {"claim_id": "q04", "value": d2010["p90_abs_gap"], "source_ref": "website/data/residuals_long.json"},
        {"claim_id": "q05", "value": d2010["max_pos_gap"], "source_ref": "website/data/residuals_long.json"},
        {"claim_id": "q06", "value": d2010["max_neg_gap"], "source_ref": "website/data/residuals_long.json"},
        {"claim_id": "q08", "value": 42.0, "source_ref": "website/data/country_year_long.json"},
        {"claim_id": "q12", "value": snap["vnm_gap_2010"], "source_ref": "website/data/residuals_long.json"},
        {"claim_id": "q14", "value": snap["usa_2010_actual"], "source_ref": "website/data/residuals_long.json"},
        {"claim_id": "q15", "value": snap["usa_2010_predicted"], "source_ref": "website/data/residuals_long.json"},
        {"claim_id": "q17", "value": f"{snap['usa_maternal_2006']:.1f} -> {snap['usa_maternal_2015']:.1f}", "source_ref": "website/data/country_year_long.json"},
        {"claim_id": "q21", "value": f"{snap['can_maternal_2006']:.1f} -> {snap['can_maternal_2015']:.1f}", "source_ref": "website/data/country_year_long.json"},
        {"claim_id": "q22", "value": snap["gnq_2010_actual"], "source_ref": "website/data/residuals_long.json"},
        {"claim_id": "q23", "value": snap["gnq_2010_predicted"], "source_ref": "website/data/residuals_long.json"},
        {"claim_id": "q24", "value": snap["sle_maternal_2010"], "source_ref": "website/data/country_year_long.json"},
        {"claim_id": "q25", "value": f"{snap['dist_2006_median_abs_gap']:.1f} -> {snap['dist_2015_median_abs_gap']:.1f}", "source_ref": "website/data/residuals_long.json"},
        {"claim_id": "q26", "value": f"{snap['dist_2006_p90_abs_gap']:.1f} -> {snap['dist_2015_p90_abs_gap']:.1f}", "source_ref": "website/data/residuals_long.json"},
    ]


def build_visual_doc(copy_map: dict[str, Any], scene_data: dict[str, Any], script_cards_by_beat: dict[str, list[dict[str, Any]]]) -> dict[str, Any]:
    d2010 = next(d for d in scene_data["distribution"] if d["year"] == 2010)
    snap = scene_data["snapshots"]

    detail_cards_by_beat = {
        "b1_curve_mechanism": [
            {"label": "Model fit (2010)", "value": f"R^2 {scene_data['model']['r2']:.2f}", "note": "Income explains much, not all.", "claim_id": "q02"},
            {"label": "Typical distance", "value": f"{d2010['median_abs_gap']:.1f} years", "note": "Median absolute gap", "claim_id": "q03"},
            {"label": "Tail distance", "value": f"{d2010['p90_abs_gap']:.1f} years", "note": "90th percentile absolute gap", "claim_id": "q04"},
            {"label": "2010 extremes", "value": f"+{d2010['max_pos_gap']:.1f} / {d2010['max_neg_gap']:.1f}", "note": "Residual gap range", "claim_id": "q05"}
        ],
        "b2_rwanda_trajectory": [
            {"label": "Under-5 mortality", "value": "98.3 -> 42.0", "note": "Rwanda, 2006 to 2015", "claim_id": "q08"}
        ],
        "b3_vietnam_brief": [
            {"label": "Vietnam 2010 gap", "value": f"{snap['vnm_gap_2010']:+.1f} years", "note": "Above expected life expectancy", "claim_id": "q12"}
        ],
        "b4_us_comparison_arc": [
            {"label": "US 2010", "value": f"{snap['usa_2010_actual']:.1f} vs {snap['usa_2010_predicted']:.1f}", "note": "Actual vs expected life expectancy", "claim_id": "q14"},
            {"label": "Maternal (US)", "value": f"{snap['usa_maternal_2006']:.1f} -> {snap['usa_maternal_2015']:.1f}", "note": "Flat over the decade", "claim_id": "q17"},
            {"label": "Maternal (CAN)", "value": f"{snap['can_maternal_2006']:.1f} -> {snap['can_maternal_2015']:.1f}", "note": "Named comparator", "claim_id": "q21"}
        ],
        "b5_mirror_case": [
            {"label": "Equatorial Guinea 2010", "value": f"{snap['gnq_2010_actual']:.1f} vs {snap['gnq_2010_predicted']:.1f}", "note": "Actual vs expected", "claim_id": "q22"},
            {"label": "Sierra Leone floor", "value": f"{snap['sle_maternal_2010']:.0f}", "note": "Maternal mortality per 100,000", "claim_id": "q24"}
        ],
        "b6_what_changes_gap": [
            {"label": "Median abs gap", "value": f"{snap['dist_2006_median_abs_gap']:.1f} -> {snap['dist_2015_median_abs_gap']:.1f}", "note": "2006 to 2015", "claim_id": "q25"},
            {"label": "P90 abs gap", "value": f"{snap['dist_2006_p90_abs_gap']:.1f} -> {snap['dist_2015_p90_abs_gap']:.1f}", "note": "Tail compression", "claim_id": "q26"}
        ],
        "b7_close": [
            {"label": "Read", "value": "Constrained hope", "note": "Progress is governable."}
        ],
    }

    beats = []
    for beat in copy_map["beats"]:
        beat_id = beat["beat_id"]
        beat_payload = {k: v for k, v in beat.items() if k != "cards"}
        beat_payload["cards"] = script_cards_by_beat.get(beat_id, [])
        beat_payload["detail_cards"] = detail_cards_by_beat.get(beat_id, [])
        beats.append(beat_payload)

    return {
        "story_id": copy_map["story_id"],
        "title": copy_map["title"],
        "dek": copy_map["dek"],
        "beats": beats,
        "methods_endnote": copy_map["methods_endnote"],
        "theme": {
            "colors": {
                "ink": "#f2eaf5",
                "muted": "#b99ac8",
                "accent": "#ff32c8",
                "positive": "#76d443",
                "negative": "#ff32c8",
                "paper": "#130014",
                "grid": "#4f3157",
                "dark_bg": "#130014"
            },
            "type": {
                "headline": "Newsreader",
                "body": "Newsreader",
                "ui": "IBM Plex Sans",
                "mono": "IBM Plex Mono"
            },
            "motion": {
                "base_ms": 420,
                "slow_ms": 620,
                "easing": "cubic-bezier(0.2, 0, 0, 1)"
            }
        },
        "version": copy_map.get("version", "v5.0.0")
    }


def build_metrics(scene_data: dict[str, Any], claim_registry: list[dict[str, Any]]) -> dict[str, Any]:
    d2010 = next(d for d in scene_data["distribution"] if d["year"] == 2010)
    return {
        "scene_data": scene_data,
        "kpis": {
            "country_count": len(scene_data["points"]),
            "r2_2010": scene_data["model"]["r2"],
            "median_abs_gap_2010": d2010["median_abs_gap"],
            "p90_abs_gap_2010": d2010["p90_abs_gap"],
            "max_pos_gap_2010": d2010["max_pos_gap"],
            "max_neg_gap_2010": d2010["max_neg_gap"],
        },
        "claim_registry": claim_registry,
    }


def main() -> None:
    APP_DATA_DIR.mkdir(parents=True, exist_ok=True)

    copy_map = read_json(COPY_MAP_PATH)
    script_cards_by_beat = parse_script_cards_from_md(SCRIPT_V5_PATH)
    scene_data = build_scene_data()
    claim_registry = build_claim_registry(scene_data)
    visual_doc = build_visual_doc(copy_map, scene_data, script_cards_by_beat)
    metrics = build_metrics(scene_data, claim_registry)

    cards_doc = {
        "story_id": visual_doc["story_id"],
        "title": visual_doc["title"],
        "beats": [{"beat_id": b["beat_id"], "cards": b["cards"]} for b in visual_doc["beats"]],
    }

    VISUAL_OUT.write_text(json.dumps(visual_doc, indent=2))
    METRICS_OUT.write_text(json.dumps(metrics, indent=2))
    CARDS_OUT.write_text(json.dumps(cards_doc, indent=2))

    print(f"Wrote {VISUAL_OUT}")
    print(f"Wrote {METRICS_OUT}")
    print(f"Wrote {CARDS_OUT}")


if __name__ == "__main__":
    main()
