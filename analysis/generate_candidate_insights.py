"""
Generate candidate conference insights from precomputed global data products.

Usage:
    python analysis/generate_candidate_insights.py

Writes:
    docs/candidate_insights.md
"""

import json
import os
from typing import Dict, List

import pandas as pd

from helpers import PROJECT_ROOT


DATA_DIR = os.path.join(PROJECT_ROOT, "website", "data")
OUT_PATH = os.path.join(PROJECT_ROOT, "docs", "candidate_insights.md")


def load_json(name: str):
    with open(os.path.join(DATA_DIR, name), "r") as f:
        return json.load(f)


def latest_year_for_indicator(df: pd.DataFrame, indicator: str) -> int:
    sub = df[df["indicator"] == indicator]
    if sub.empty:
        return None
    year_counts = sub.groupby("Year").size().sort_index()
    # Choose latest year with at least 60 countries to avoid sparse artifacts.
    valid_years = year_counts[year_counts >= 60].index.tolist()
    if valid_years:
        return int(valid_years[-1])
    return int(year_counts.index[-1])


def safe_country_name(country_map: Dict[str, Dict], code: str) -> str:
    return country_map.get(code, {}).get("Country.Name", code)


def build_insights() -> str:
    metadata = load_json("metadata.json")
    long_rows = pd.DataFrame(load_json("country_year_long.json"))
    residual_rows = pd.DataFrame(load_json("residuals_long.json"))
    trend_rows = pd.DataFrame(load_json("country_trends.json"))

    indicators = metadata["indicators"]
    country_map = {c["Country.Code"]: c for c in metadata["countries"]}

    lines: List[str] = []
    lines.append("# Candidate Insights (Auto-Generated)")
    lines.append("")
    lines.append("These are machine-generated starting points for conference narrative curation.")
    lines.append("They should be reviewed for domain plausibility before final presentation.")
    lines.append("")

    # 1) Wealth-adjusted outliers per indicator
    lines.append("## 1) Wealth-Adjusted Outliers by Indicator")
    lines.append("")
    for ind in indicators:
        code = ind["indicator"]
        label = ind["label"]
        year = latest_year_for_indicator(residual_rows, code)
        if year is None:
            continue
        subset = residual_rows[
            (residual_rows["indicator"] == code) & (residual_rows["Year"] == year)
        ].dropna(subset=["quality_residual_z"])
        if len(subset) < 20:
            continue

        best = subset.sort_values("quality_residual_z", ascending=False).iloc[0]
        worst = subset.sort_values("quality_residual_z", ascending=True).iloc[0]
        lines.append(
            f"- **{label} ({year})**: strongest over-performer is "
            f"**{safe_country_name(country_map, best['Country.Code'])}** "
            f"(z={best['quality_residual_z']:.2f}); strongest under-performer is "
            f"**{safe_country_name(country_map, worst['Country.Code'])}** "
            f"(z={worst['quality_residual_z']:.2f})."
        )
    lines.append("")

    # 2) Broad multi-indicator leaders at a stable anchor year (2010 if available)
    lines.append("## 2) Broad Multi-Indicator Leaders and Laggards")
    lines.append("")
    anchor_year = 2010 if 2010 in set(long_rows["Year"].unique()) else int(long_rows["Year"].max())
    anchor = long_rows[long_rows["Year"] == anchor_year].dropna(subset=["percentile_quality"])
    country_scores = (
        anchor.groupby("Country.Code")
        .agg(
            mean_percentile=("percentile_quality", "mean"),
            indicator_count=("percentile_quality", "count"),
        )
        .reset_index()
    )
    country_scores = country_scores[country_scores["indicator_count"] >= 8]

    top5 = country_scores.sort_values("mean_percentile", ascending=False).head(5)
    bot5 = country_scores.sort_values("mean_percentile", ascending=True).head(5)

    lines.append(f"Anchor year: **{anchor_year}** (countries with at least 8 indicators).")
    lines.append("")
    lines.append("Top broad performers:")
    for _, row in top5.iterrows():
        lines.append(
            f"- {safe_country_name(country_map, row['Country.Code'])}: "
            f"mean percentile {row['mean_percentile']:.1f} "
            f"across {int(row['indicator_count'])} indicators."
        )
    lines.append("")
    lines.append("Bottom broad performers:")
    for _, row in bot5.iterrows():
        lines.append(
            f"- {safe_country_name(country_map, row['Country.Code'])}: "
            f"mean percentile {row['mean_percentile']:.1f} "
            f"across {int(row['indicator_count'])} indicators."
        )
    lines.append("")

    # 3) Countries with strongest directionally-improving trend portfolios
    lines.append("## 3) Trend Portfolio Movers (Quality-Adjusted)")
    lines.append("")
    trend_valid = trend_rows.dropna(subset=["quality_pct_change"]).copy()
    trend_valid["improved"] = trend_valid["quality_pct_change"] > 0
    by_country = (
        trend_valid.groupby("Country.Code")
        .agg(
            indicators_tracked=("quality_pct_change", "count"),
            indicators_improved=("improved", "sum"),
            median_quality_change=("quality_pct_change", "median"),
        )
        .reset_index()
    )
    by_country = by_country[by_country["indicators_tracked"] >= 8].copy()
    by_country["improve_share"] = (
        by_country["indicators_improved"] / by_country["indicators_tracked"]
    )

    leaders = by_country.sort_values(
        ["improve_share", "median_quality_change"], ascending=[False, False]
    ).head(8)
    decliners = by_country.sort_values(
        ["improve_share", "median_quality_change"], ascending=[True, True]
    ).head(8)

    lines.append("Highest share of indicators improving:")
    for _, row in leaders.iterrows():
        lines.append(
            f"- {safe_country_name(country_map, row['Country.Code'])}: "
            f"{int(row['indicators_improved'])}/{int(row['indicators_tracked'])} "
            f"({row['improve_share']*100:.0f}%), median quality change {row['median_quality_change']:.1f}%."
        )
    lines.append("")
    lines.append("Lowest share of indicators improving:")
    for _, row in decliners.iterrows():
        lines.append(
            f"- {safe_country_name(country_map, row['Country.Code'])}: "
            f"{int(row['indicators_improved'])}/{int(row['indicators_tracked'])} "
            f"({row['improve_share']*100:.0f}%), median quality change {row['median_quality_change']:.1f}%."
        )
    lines.append("")

    # 4) Regional signal: which regions overperform after wealth adjustment most often?
    lines.append("## 4) Regional Wealth-Adjusted Signal")
    lines.append("")
    residual_clean = residual_rows.dropna(subset=["quality_residual_z"]).copy()
    region_score = (
        residual_clean.groupby("Region")
        .agg(
            median_quality_z=("quality_residual_z", "median"),
            n_points=("quality_residual_z", "count"),
        )
        .reset_index()
        .sort_values("median_quality_z", ascending=False)
    )
    region_score = region_score[region_score["n_points"] >= 300]
    for _, row in region_score.iterrows():
        lines.append(
            f"- {row['Region']}: median wealth-adjusted z = {row['median_quality_z']:.2f} "
            f"(n={int(row['n_points'])} country-indicator-year points)."
        )
    lines.append("")

    lines.append("## 5) Suggested Next Manual Review")
    lines.append("")
    lines.append("- Validate top/bottom outlier countries against known measurement caveats.")
    lines.append("- Select 3-5 final insights with one sentence of caveat each.")
    lines.append("- Pair each final insight with one primary chart and one backup chart.")
    lines.append("")

    return "\n".join(lines)


def main() -> None:
    content = build_insights()
    with open(OUT_PATH, "w") as f:
        f.write(content)
    print(f"Wrote: {OUT_PATH}")


if __name__ == "__main__":
    main()
