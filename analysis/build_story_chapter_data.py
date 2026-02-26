"""
Build compact chapter data for the narrative scrolly prototype.

Output:
    website/data/story_life_expectancy.json

Usage:
    python analysis/build_story_chapter_data.py
"""

from __future__ import annotations

import json
from pathlib import Path
from typing import Any, Dict, List


PROJECT_ROOT = Path(__file__).resolve().parents[1]
DATA_DIR = PROJECT_ROOT / "website" / "data"
OUTPUT_PATH = DATA_DIR / "story_life_expectancy.json"

INDICATOR = "life_exp"
YEAR = 2010
PEER_CODES = ["USA", "GBR", "DEU", "FRA", "CAN", "JPN"]


def _load_json(path: Path) -> Any:
    with path.open("r") as f:
        return json.load(f)


def _as_float(value: Any) -> float | None:
    if value is None:
        return None
    try:
        return float(value)
    except (TypeError, ValueError):
        return None


def _rank_label(rank: int, total: int) -> str:
    if total <= 0:
        return "n/a"
    return f"{rank} of {total}"


def build_story_data() -> Dict[str, Any]:
    metadata = _load_json(DATA_DIR / "metadata.json")
    long_rows = _load_json(DATA_DIR / "country_year_long.json")
    residual_rows = _load_json(DATA_DIR / "residuals_long.json")
    trend_rows = _load_json(DATA_DIR / "country_trends.json")

    countries = metadata["countries"]
    country_name = {row["Country.Code"]: row["Country.Name"] for row in countries}
    country_meta = {row["Country.Code"]: row for row in countries}

    long_filtered = [
        row
        for row in long_rows
        if row["indicator"] == INDICATOR and int(row["Year"]) == YEAR
    ]
    long_by_code = {row["Country.Code"]: row for row in long_filtered}

    residual_filtered = [
        row
        for row in residual_rows
        if row["indicator"] == INDICATOR
        and int(row["Year"]) == YEAR
        and _as_float(row.get("gni_percap")) is not None
        and _as_float(row.get("value")) is not None
        and _as_float(row.get("quality_residual_z")) is not None
    ]

    points: List[Dict[str, Any]] = []
    for row in residual_filtered:
        code = row["Country.Code"]
        meta = country_meta.get(code, {})
        points.append(
            {
                "code": code,
                "name": country_name.get(code, code),
                "region": meta.get("Region", row.get("Region")),
                "income_group": meta.get("Income.Group", row.get("Income.Group")),
                "gni_percap": float(row["gni_percap"]),
                "value": float(row["value"]),
                "predicted": float(row["predicted"]),
                "z": float(row["quality_residual_z"]),
            }
        )

    if not points:
        raise RuntimeError("No residual points found for story data.")

    points.sort(key=lambda item: item["z"])
    worst_outliers = points[:6]
    best_outliers = points[-6:]

    usa_point = next((row for row in points if row["code"] == "USA"), None)
    if usa_point is None:
        raise RuntimeError("USA row missing from story points.")

    model_row = residual_filtered[0]
    model = {
        "slope": float(model_row["model_slope"]),
        "intercept": float(model_row["model_intercept"]),
        "r2": float(model_row["model_r2"]),
        "n": int(model_row["model_n"]),
    }

    usa_long = long_by_code.get("USA")
    usa_rank = None
    usa_percentile = None
    rank_text = "n/a"
    if usa_long is not None:
        usa_rank = int(round(float(usa_long["rank_quality"])))
        usa_percentile = float(usa_long["percentile_quality"])
        rank_text = _rank_label(usa_rank, int(usa_long["n_countries_year"]))

    similar_income = [
        row
        for row in points
        if row["code"] != "USA"
        and 0.75 * usa_point["gni_percap"] <= row["gni_percap"] <= 1.25 * usa_point["gni_percap"]
    ]
    similar_income.sort(key=lambda item: item["z"], reverse=True)
    similar_income_top = similar_income[:8]

    peers = [row for row in points if row["code"] in PEER_CODES]
    peers.sort(key=lambda item: item["value"], reverse=True)

    trends_filtered = [
        row
        for row in trend_rows
        if row["indicator"] == INDICATOR
        and row.get("n_years", 0) >= 8
        and row.get("quality_pct_change") is not None
    ]
    trends_filtered.sort(key=lambda item: float(item["quality_pct_change"]))
    trend_bottom = trends_filtered[:6]
    trend_top = trends_filtered[-6:]

    trend_codes = {row["Country.Code"] for row in trend_bottom + trend_top}
    trend_codes.update(["USA", "JPN", "VNM"])

    long_series_rows = [
        row
        for row in long_rows
        if row["indicator"] == INDICATOR and row["Country.Code"] in trend_codes
    ]
    long_series_rows.sort(key=lambda item: (item["Country.Code"], int(item["Year"])))

    series_by_country: Dict[str, List[Dict[str, float]]] = {}
    for row in long_series_rows:
        code = row["Country.Code"]
        series_by_country.setdefault(code, []).append(
            {"year": int(row["Year"]), "value": float(row["value"])}
        )

    trend_highlights = []
    for code in sorted(trend_codes):
        values = series_by_country.get(code, [])
        if not values:
            continue
        trend_highlights.append(
            {
                "code": code,
                "name": country_name.get(code, code),
                "series": values,
                "start": values[0]["value"],
                "end": values[-1]["value"],
                "delta": values[-1]["value"] - values[0]["value"],
            }
        )

    story_data: Dict[str, Any] = {
        "story_meta": {
            "indicator": INDICATOR,
            "indicator_label": "Life Expectancy (years)",
            "year": YEAR,
            "thesis": "National wealth explains part of life expectancy, but countries can still significantly overperform or underperform their income level.",
            "subhed": "This prototype chapter is a narrative shell for the full Pudding-style story build.",
        },
        "summary": {
            "country_count": len(points),
            "model_r2": model["r2"],
            "usa_value": usa_point["value"],
            "usa_predicted": usa_point["predicted"],
            "usa_z": usa_point["z"],
            "usa_percentile": usa_percentile,
            "usa_rank_text": rank_text,
        },
        "model": model,
        "points": points,
        "peers": peers,
        "best_outliers": best_outliers,
        "worst_outliers": worst_outliers,
        "similar_income_top": similar_income_top,
        "trend_highlights": trend_highlights,
        "chapters": [
            {
                "id": "hook",
                "label": "Chapter 1",
                "title": "Wealth predicts a lot, but not everything.",
                "body": "Each country is a dot. The x-axis is income per person, and the y-axis is life expectancy. The line is the wealth expectation curve for 2010.",
                "focus": "all",
            },
            {
                "id": "usa",
                "label": "Chapter 2",
                "title": "The United States sits below its wealth expectation.",
                "body": "In 2010, the U.S. life expectancy is below the model-predicted value for countries at a similar income level.",
                "focus": "usa",
            },
            {
                "id": "peers",
                "label": "Chapter 3",
                "title": "Several similarly wealthy countries sit higher on outcomes.",
                "body": "Peer countries with comparable income levels tend to land above the U.S. on life expectancy in this snapshot.",
                "focus": "peers",
            },
            {
                "id": "outliers",
                "label": "Chapter 4",
                "title": "Some countries strongly overperform, others strongly underperform.",
                "body": "Residual z-scores quantify how far countries sit above or below what their income predicts.",
                "focus": "outliers",
            },
            {
                "id": "trends",
                "label": "Chapter 5",
                "title": "Long-run trend gains are uneven across countries.",
                "body": "From 2006 to 2015, country trajectories diverge widely. Progress is possible at many income levels.",
                "focus": "trends",
            },
        ],
    }
    return story_data


def main() -> None:
    story_data = build_story_data()
    with OUTPUT_PATH.open("w") as f:
        json.dump(story_data, f, indent=2)
    print(f"Wrote {OUTPUT_PATH}")


if __name__ == "__main__":
    main()

