"""
Build conference-ready all-country data products for the global interactive site.

Outputs (website/data):
- metadata.json
- country_year_long.json
- residuals_long.json
- country_trends.json
- top_movers.json

Usage:
    python analysis/build_global_site_data.py
"""

import json
import math
import os
from typing import Any, Dict, List

import numpy as np
import pandas as pd
from scipy import stats

from helpers import FOCUS_VARIABLES, PROJECT_ROOT, load_data


COUNTRY_META_PATH = os.path.join(PROJECT_ROOT, "MDG_Metadata_coded.xlsx")
OUTPUT_DIR = os.path.join(PROJECT_ROOT, "website", "data")

GOAL_NAMES = {
    1: "Eradicate Extreme Poverty and Hunger",
    2: "Achieve Universal Primary Education",
    3: "Promote Gender Equality and Empower Women",
    4: "Reduce Child Mortality",
    5: "Improve Maternal Health",
    6: "Combat HIV/AIDS, Malaria, and Other Diseases",
    7: "Ensure Environmental Sustainability",
    8: "Develop a Global Partnership for Development",
}


def _clean_value(v: Any) -> Any:
    """Convert numpy scalars and NaN to JSON-safe values."""
    if v is None:
        return None
    if isinstance(v, (np.integer,)):
        return int(v)
    if isinstance(v, (np.floating, float)):
        if math.isnan(float(v)) or math.isinf(float(v)):
            return None
        return float(v)
    return v


def _records_to_json(path: str, records: List[Dict[str, Any]]) -> None:
    clean_records = []
    for row in records:
        clean_records.append({k: _clean_value(v) for k, v in row.items()})
    with open(path, "w") as f:
        json.dump(clean_records, f, indent=2, allow_nan=False)


def _clean_nested(value: Any) -> Any:
    if isinstance(value, dict):
        return {k: _clean_nested(v) for k, v in value.items()}
    if isinstance(value, list):
        return [_clean_nested(v) for v in value]
    return _clean_value(value)


def _to_quality_percentiles(
    df: pd.DataFrame, value_col: str, lower_is_better: bool
) -> pd.DataFrame:
    """
    Convert raw values to quality percentile (0-100, higher=better) within a group.
    """
    out = df.copy()
    n = len(out)
    if n == 1:
        out["percentile_quality"] = 50.0
        out["rank_quality"] = 1.0
        return out

    if lower_is_better:
        ranks = out[value_col].rank(ascending=True, method="average")
    else:
        ranks = out[value_col].rank(ascending=False, method="average")

    out["rank_quality"] = ranks
    out["percentile_quality"] = 100.0 * (n - ranks) / (n - 1)
    return out


def load_country_metadata() -> pd.DataFrame:
    """Load country metadata and prepare entity-type flags."""
    country_meta = pd.read_excel(COUNTRY_META_PATH, sheet_name="Country - Metadata")
    country_meta = country_meta[
        ["Code", "Short Name", "Region", "Income Group"]
    ].rename(
        columns={
            "Code": "Country.Code",
            "Short Name": "Meta.ShortName",
            "Income Group": "Income.Group",
        }
    )
    country_meta["is_country"] = country_meta["Region"].notna()
    return country_meta


def build_long_country_year(df_country: pd.DataFrame) -> pd.DataFrame:
    """Build long-form country-year-indicator table with quality percentiles."""
    long_frames = []

    for col, label, goal, lower_is_better in FOCUS_VARIABLES:
        base = df_country[
            [
                "Country.Code",
                "Country.Name",
                "Year",
                "gni_percap",
                "Region",
                "Income.Group",
                col,
            ]
        ].rename(columns={col: "value"})

        base = base.dropna(subset=["value"])
        if base.empty:
            continue

        base["indicator"] = col
        base["indicator_label"] = label
        base["goal"] = goal
        base["goal_name"] = GOAL_NAMES.get(goal, f"Goal {goal}")
        base["lower_is_better"] = lower_is_better

        group_frames = []
        for year, year_df in base.groupby("Year", sort=True):
            year_scored = _to_quality_percentiles(
                year_df, value_col="value", lower_is_better=lower_is_better
            )
            year_scored["n_countries_year"] = len(year_df)
            group_frames.append(year_scored)

        long_frames.append(pd.concat(group_frames, ignore_index=True))

    if not long_frames:
        return pd.DataFrame()

    long_df = pd.concat(long_frames, ignore_index=True)
    return long_df


def build_residuals_long(long_df: pd.DataFrame) -> pd.DataFrame:
    """
    Build wealth-adjusted residuals by year and indicator:
    value ~ log10(gni_percap), computed across countries.
    """
    rows = []

    for (indicator, year), group in long_df.groupby(["indicator", "Year"], sort=True):
        work = group.dropna(subset=["gni_percap", "value"]).copy()
        work = work[work["gni_percap"] > 0]
        if len(work) < 20:
            continue

        x = np.log10(work["gni_percap"].astype(float))
        y = work["value"].astype(float)
        slope, intercept, r_val, p_val, std_err = stats.linregress(x, y)

        work["predicted"] = slope * x + intercept
        work["residual"] = work["value"] - work["predicted"]
        lower_is_better = bool(work["lower_is_better"].iloc[0])
        if lower_is_better:
            work["quality_residual"] = -work["residual"]
        else:
            work["quality_residual"] = work["residual"]

        q_std = work["quality_residual"].std()
        if q_std and not np.isnan(q_std):
            work["quality_residual_z"] = (
                (work["quality_residual"] - work["quality_residual"].mean()) / q_std
            )
        else:
            work["quality_residual_z"] = 0.0

        work["model_slope"] = slope
        work["model_intercept"] = intercept
        work["model_r2"] = r_val**2
        work["model_p"] = p_val
        work["model_n"] = len(work)
        rows.append(work)

    if not rows:
        return pd.DataFrame()

    residuals = pd.concat(rows, ignore_index=True)
    keep_cols = [
        "Country.Code",
        "Country.Name",
        "Year",
        "Region",
        "Income.Group",
        "indicator",
        "indicator_label",
        "goal",
        "goal_name",
        "lower_is_better",
        "gni_percap",
        "value",
        "predicted",
        "residual",
        "quality_residual",
        "quality_residual_z",
        "model_slope",
        "model_intercept",
        "model_r2",
        "model_p",
        "model_n",
    ]
    return residuals[keep_cols]


def build_country_trends(long_df: pd.DataFrame) -> pd.DataFrame:
    """Build per-country per-indicator trend summaries across years."""
    rows = []
    for (country_code, indicator), group in long_df.groupby(
        ["Country.Code", "indicator"], sort=False
    ):
        g = group.sort_values("Year")
        if len(g) < 5:
            continue

        x = g["Year"].astype(float)
        y = g["value"].astype(float)
        slope, intercept, r_val, p_val, std_err = stats.linregress(x, y)

        start_row = g.iloc[0]
        end_row = g.iloc[-1]
        start_val = float(start_row["value"])
        end_val = float(end_row["value"])
        pct_change = None
        if start_val != 0:
            pct_change = ((end_val - start_val) / abs(start_val)) * 100.0

        lower_is_better = bool(g["lower_is_better"].iloc[0])
        quality_pct_change = None
        if pct_change is not None:
            quality_pct_change = -pct_change if lower_is_better else pct_change

        rows.append(
            {
                "Country.Code": country_code,
                "Country.Name": g["Country.Name"].iloc[0],
                "Region": g["Region"].iloc[0],
                "Income.Group": g["Income.Group"].iloc[0],
                "indicator": indicator,
                "indicator_label": g["indicator_label"].iloc[0],
                "goal": int(g["goal"].iloc[0]),
                "goal_name": g["goal_name"].iloc[0],
                "lower_is_better": lower_is_better,
                "n_years": int(len(g)),
                "start_year": int(start_row["Year"]),
                "end_year": int(end_row["Year"]),
                "start_value": start_val,
                "end_value": end_val,
                "pct_change": pct_change,
                "quality_pct_change": quality_pct_change,
                "slope_per_year": slope,
                "r2": r_val**2,
                "p_value": p_val,
                "std_err": std_err,
            }
        )

    if not rows:
        return pd.DataFrame()
    return pd.DataFrame(rows)


def build_top_movers(trends_df: pd.DataFrame, top_n: int = 8) -> Dict[str, Any]:
    """Create top/bottom movers for each indicator by quality-adjusted percent change."""
    output: Dict[str, Any] = {}
    if trends_df.empty:
        return output

    valid = trends_df.dropna(subset=["quality_pct_change"]).copy()
    for indicator, group in valid.groupby("indicator", sort=True):
        g = group.sort_values("quality_pct_change", ascending=False)
        output[indicator] = {
            "label": g["indicator_label"].iloc[0],
            "best": g.head(top_n)[
                ["Country.Code", "Country.Name", "quality_pct_change", "pct_change"]
            ].to_dict(orient="records"),
            "worst": g.tail(top_n).sort_values("quality_pct_change", ascending=True)[
                ["Country.Code", "Country.Name", "quality_pct_change", "pct_change"]
            ].to_dict(orient="records"),
        }
    return output


def build_metadata(
    df_country: pd.DataFrame, long_df: pd.DataFrame, trends_df: pd.DataFrame
) -> Dict[str, Any]:
    """Build compact metadata payload for frontend controls."""
    indicators = []
    total_country_year = len(df_country)
    for col, label, goal, lower_is_better in FOCUS_VARIABLES:
        non_null = int(df_country[col].notna().sum())
        coverage = (100.0 * non_null / total_country_year) if total_country_year else 0.0
        indicators.append(
            {
                "indicator": col,
                "label": label,
                "goal": goal,
                "goal_name": GOAL_NAMES.get(goal, f"Goal {goal}"),
                "lower_is_better": lower_is_better,
                "coverage_pct_country_year": coverage,
            }
        )

    years = sorted(int(y) for y in df_country["Year"].dropna().unique())
    countries = (
        df_country[["Country.Code", "Country.Name", "Region", "Income.Group"]]
        .drop_duplicates()
        .sort_values(["Country.Name"])
        .to_dict(orient="records")
    )

    return {
        "country_count": int(df_country["Country.Code"].nunique()),
        "country_year_rows": int(total_country_year),
        "years": years,
        "indicators": indicators,
        "countries": countries,
        "trend_rows": int(len(trends_df)),
        "long_rows": int(len(long_df)),
    }


def main() -> None:
    os.makedirs(OUTPUT_DIR, exist_ok=True)
    print("Loading base dataset...")
    raw = load_data()
    meta = load_country_metadata()

    merged = raw.merge(meta, on="Country.Code", how="left")
    df_country = merged[merged["is_country"] == True].copy()

    print(f"Country rows retained: {len(df_country)}")
    print(f"Countries retained: {df_country['Country.Code'].nunique()}")

    print("Building long-form indicator dataset...")
    long_df = build_long_country_year(df_country)
    print(f"Long rows: {len(long_df)}")

    print("Building wealth-adjusted residuals...")
    residuals_df = build_residuals_long(long_df)
    print(f"Residual rows: {len(residuals_df)}")

    print("Building country trends...")
    trends_df = build_country_trends(long_df)
    print(f"Trend rows: {len(trends_df)}")

    print("Building top movers...")
    top_movers = build_top_movers(trends_df, top_n=8)

    print("Building metadata...")
    metadata = build_metadata(df_country, long_df, trends_df)

    # Export compact payloads for faster browser load.
    long_export = long_df[
        [
            "Country.Code",
            "Year",
            "Region",
            "Income.Group",
            "indicator",
            "value",
            "gni_percap",
            "rank_quality",
            "percentile_quality",
            "n_countries_year",
        ]
    ].copy()

    residual_export = residuals_df[
        [
            "Country.Code",
            "Year",
            "Region",
            "Income.Group",
            "indicator",
            "value",
            "gni_percap",
            "predicted",
            "quality_residual",
            "quality_residual_z",
            "model_slope",
            "model_intercept",
            "model_r2",
            "model_p",
            "model_n",
        ]
    ].copy()

    print("Writing outputs...")
    _records_to_json(
        os.path.join(OUTPUT_DIR, "country_year_long.json"),
        long_export.to_dict(orient="records"),
    )
    _records_to_json(
        os.path.join(OUTPUT_DIR, "residuals_long.json"),
        residual_export.to_dict(orient="records"),
    )
    _records_to_json(
        os.path.join(OUTPUT_DIR, "country_trends.json"),
        trends_df.to_dict(orient="records"),
    )
    with open(os.path.join(OUTPUT_DIR, "top_movers.json"), "w") as f:
        json.dump(_clean_nested(top_movers), f, indent=2, allow_nan=False)
    with open(os.path.join(OUTPUT_DIR, "metadata.json"), "w") as f:
        json.dump(_clean_nested(metadata), f, indent=2, allow_nan=False)

    print("\nDone.")
    print(f"Data files written to: {OUTPUT_DIR}")


if __name__ == "__main__":
    main()
