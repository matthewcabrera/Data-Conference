"""
All Plotly visualization functions for America's Development Paradox.
Each function returns a plotly Figure object.
"""

import sys
import os
sys.path.insert(0, os.path.join(os.path.dirname(__file__), '..', 'analysis'))

import pandas as pd
import numpy as np
import plotly.graph_objects as go
import plotly.express as px
from plotly.subplots import make_subplots
from helpers import (
    load_data, get_country, get_countries, get_peer_average,
    normalize_score, compute_pct_difference,
    PEER_COUNTRIES, PEER_COUNTRIES_NO_US, AGGREGATES,
    FOCUS_VARIABLES, FOCUS_COLS, VAR_LABELS, VAR_LOWER_IS_BETTER,
    COUNTRY_NAMES, COUNTRY_COLORS, COLORS
)

# ── Shared Layout Defaults ─────────────────────────────────────────────────

LAYOUT_DEFAULTS = dict(
    font=dict(family="Inter, system-ui, sans-serif", size=13, color=COLORS["text"]),
    plot_bgcolor="white",
    paper_bgcolor="white",
    margin=dict(l=60, r=40, t=60, b=60),
    hoverlabel=dict(bgcolor="white", font_size=12),
)


def _apply_defaults(fig, **overrides):
    """Apply shared layout defaults to a figure."""
    layout = {**LAYOUT_DEFAULTS, **overrides}
    fig.update_layout(**layout)
    return fig


# ── Chart 1: Radar / Spider Chart ──────────────────────────────────────────

def make_radar_chart(df=None, year=2010):
    """
    Development scorecard: U.S. vs. Peer Average vs. Upper Middle Income.
    All indicators normalized to 0-100 where 100 = best.
    """
    if df is None:
        df = load_data()

    usa_row = df[(df["Country.Code"] == "USA") & (df["Year"] == year)].iloc[0]
    peer_data = df[
        (df["Country.Code"].isin(PEER_COUNTRIES_NO_US)) & (df["Year"] == year)
    ]
    peer_avg = peer_data[FOCUS_COLS].mean()

    umc_row = df[(df["Country.Code"] == "UMC") & (df["Year"] == year)]
    umc_vals = umc_row.iloc[0] if len(umc_row) > 0 else None

    # Collect all values to determine normalization range
    categories = []
    usa_scores = []
    peer_scores = []
    umc_scores = []

    for col, label, goal, lower_is_better in FOCUS_VARIABLES:
        usa_val = usa_row[col]
        peer_val = peer_avg[col]

        if pd.isna(usa_val) or pd.isna(peer_val):
            continue

        # Determine range from all available data for this year
        all_vals = df[df["Year"] == year][col].dropna()
        if len(all_vals) < 5:
            continue

        if lower_is_better:
            best = all_vals.min()
            worst = all_vals.quantile(0.95)  # Use 95th percentile to avoid extreme outliers
        else:
            best = all_vals.quantile(0.95)
            worst = all_vals.min()

        usa_score = normalize_score(usa_val, best, worst)
        peer_score = normalize_score(peer_val, best, worst)

        categories.append(label)
        usa_scores.append(max(0, min(100, usa_score)))
        peer_scores.append(max(0, min(100, peer_score)))

        if umc_vals is not None and pd.notna(umc_vals[col]):
            umc_score = normalize_score(umc_vals[col], best, worst)
            umc_scores.append(max(0, min(100, umc_score)))
        else:
            umc_scores.append(None)

    # Close the polygon
    categories.append(categories[0])
    usa_scores.append(usa_scores[0])
    peer_scores.append(peer_scores[0])
    umc_scores.append(umc_scores[0])

    fig = go.Figure()

    # Upper Middle Income (background)
    if any(v is not None for v in umc_scores):
        fig.add_trace(go.Scatterpolar(
            r=umc_scores, theta=categories, fill="toself",
            name="Upper Middle Income",
            line=dict(color=COLORS["umc"], dash="dash", width=1),
            fillcolor="rgba(244, 162, 97, 0.1)",
        ))

    # Peer Average
    fig.add_trace(go.Scatterpolar(
        r=peer_scores, theta=categories, fill="toself",
        name="Peer Average (G5)",
        line=dict(color=COLORS["peers"], width=2),
        fillcolor="rgba(69, 123, 157, 0.15)",
    ))

    # United States
    fig.add_trace(go.Scatterpolar(
        r=usa_scores, theta=categories, fill="toself",
        name="United States",
        line=dict(color=COLORS["usa"], width=3),
        fillcolor="rgba(230, 57, 70, 0.15)",
    ))

    fig = _apply_defaults(
        fig,
        title=dict(text=f"Development Scorecard ({year})", font_size=20),
        polar=dict(
            radialaxis=dict(visible=True, range=[0, 100], showticklabels=False),
            angularaxis=dict(tickfont=dict(size=11)),
        ),
        legend=dict(x=1.05, y=1),
        height=600,
        width=750,
    )
    return fig


# ── Chart 2: Diverging Bar Chart ───────────────────────────────────────────

def make_diverging_bar(df=None, year=2010):
    """
    Horizontal bars showing % difference of U.S. from peer average.
    Red = worse, green = better.
    """
    if df is None:
        df = load_data()

    usa_row = df[(df["Country.Code"] == "USA") & (df["Year"] == year)].iloc[0]
    peer_data = df[
        (df["Country.Code"].isin(PEER_COUNTRIES_NO_US)) & (df["Year"] == year)
    ]
    peer_avg = peer_data[FOCUS_COLS].mean()

    items = []
    for col, label, goal, lower_is_better in FOCUS_VARIABLES:
        usa_val = usa_row[col]
        peer_val = peer_avg[col]
        if pd.isna(usa_val) or pd.isna(peer_val) or peer_val == 0:
            continue

        pct_diff = compute_pct_difference(usa_val, peer_val)

        # Determine if the difference is good or bad
        if lower_is_better:
            quality_diff = -pct_diff  # Positive = good (USA lower = better)
        else:
            quality_diff = pct_diff  # Positive = good (USA higher = better)

        items.append({
            "label": label,
            "quality_diff": quality_diff,
            "raw_diff": pct_diff,
            "usa": usa_val,
            "peer": peer_val,
        })

    items.sort(key=lambda x: x["quality_diff"])

    labels = [d["label"] for d in items]
    diffs = [d["quality_diff"] for d in items]
    colors = [COLORS["better"] if d >= 0 else COLORS["worse"] for d in diffs]

    fig = go.Figure()
    fig.add_trace(go.Bar(
        y=labels, x=diffs, orientation="h",
        marker_color=colors,
        text=[f"{d:+.0f}%" for d in diffs],
        textposition="outside",
        textfont=dict(size=12),
        hovertemplate=(
            "<b>%{y}</b><br>"
            "USA vs. Peer Avg: %{x:+.1f}%<br>"
            "<extra></extra>"
        ),
    ))

    fig.add_vline(x=0, line_width=2, line_color=COLORS["text"])

    fig = _apply_defaults(
        fig,
        title=dict(text=f"U.S. vs. Peer Average — Gap Analysis ({year})", font_size=20),
        xaxis=dict(
            title="% Difference from Peer Average (positive = better)",
            zeroline=True,
            gridcolor="rgba(0,0,0,0.05)",
        ),
        yaxis=dict(title=""),
        height=500,
        width=850,
    )
    return fig


# ── Chart 3: Scatter Outlier (Wealth vs. Outcome) ─────────────────────────

def make_scatter_outlier(df=None, y_var="maternal_mortality_ratio", year=2010):
    """
    GNI per capita (x) vs. an outcome variable (y).
    U.S. highlighted as a red dot. Shows the U.S. as an outlier.
    """
    if df is None:
        df = load_data()

    year_data = df[df["Year"] == year].copy()

    # Filter to individual countries (exclude aggregates)
    agg_codes = list(AGGREGATES.keys())
    # Also exclude codes that are clearly aggregates (3+ letter codes that aren't countries)
    year_data = year_data[~year_data["Country.Code"].isin(agg_codes)]
    year_data = year_data[year_data["Country.Code"].str.len() == 3]

    # Keep only rows with both GNI per capita and the y variable
    plot_data = year_data[["Country.Name", "Country.Code", "gni_percap", y_var]].dropna()

    if len(plot_data) < 10:
        return go.Figure()  # Not enough data

    lower_is_better = VAR_LOWER_IS_BETTER.get(y_var, True)
    y_label = VAR_LABELS.get(y_var, y_var)

    # Color: highlight USA
    plot_data["highlight"] = plot_data["Country.Code"].apply(
        lambda x: "United States" if x == "USA" else "Other"
    )

    fig = px.scatter(
        plot_data, x="gni_percap", y=y_var,
        color="highlight",
        color_discrete_map={"United States": COLORS["usa"], "Other": COLORS["peers_light"]},
        hover_name="Country.Name",
        log_x=True,
        labels={"gni_percap": "GNI per Capita (USD, log scale)", y_var: y_label},
        title=f"Wealth vs. {y_label} ({year})",
    )

    # Add OLS trendline manually
    log_x = np.log10(plot_data["gni_percap"])
    slope, intercept, r, p, se = __import__("scipy").stats.linregress(log_x, plot_data[y_var])
    x_range = np.linspace(log_x.min(), log_x.max(), 100)
    y_trend = slope * x_range + intercept

    fig.add_trace(go.Scatter(
        x=10**x_range, y=y_trend,
        mode="lines", name="Trend",
        line=dict(color="rgba(0,0,0,0.3)", dash="dash", width=2),
        showlegend=False,
    ))

    # Annotate USA
    usa_point = plot_data[plot_data["Country.Code"] == "USA"]
    if len(usa_point) > 0:
        fig.add_annotation(
            x=np.log10(usa_point.iloc[0]["gni_percap"]),
            y=usa_point.iloc[0][y_var],
            text="USA",
            showarrow=True, arrowhead=2,
            ax=40, ay=-30,
            font=dict(size=14, color=COLORS["usa"], family="Inter, sans-serif"),
            arrowcolor=COLORS["usa"],
        )

    # Make USA dot bigger
    fig.update_traces(
        marker=dict(size=8, opacity=0.6),
        selector=dict(name="Other"),
    )
    fig.update_traces(
        marker=dict(size=16, opacity=1, line=dict(width=2, color="white")),
        selector=dict(name="United States"),
    )

    fig = _apply_defaults(
        fig,
        title=dict(font_size=20),
        height=500,
        width=800,
        showlegend=False,
    )
    return fig


# ── Chart 4: Slope Chart (2006 vs. 2015) ──────────────────────────────────

def make_slope_chart(df=None, indicators=None):
    """
    Slope chart comparing 2006 to 2015 values for U.S. and peers.
    Shows where the U.S. improved vs. stagnated.
    """
    if df is None:
        df = load_data()

    if indicators is None:
        # Default to 4 key indicators
        indicators = [
            "maternal_mortality_ratio",
            "adol_fert_rate",
            "co2_emissions_percap",
            "mortality_rate_infant",
        ]

    n = len(indicators)
    cols = min(n, 2)
    rows = (n + cols - 1) // cols

    fig = make_subplots(
        rows=rows, cols=cols,
        subplot_titles=[VAR_LABELS.get(ind, ind) for ind in indicators],
        vertical_spacing=0.15,
        horizontal_spacing=0.12,
    )

    for i, col_name in enumerate(indicators):
        row = i // cols + 1
        col = i % cols + 1

        for code in PEER_COUNTRIES:
            country_data = df[df["Country.Code"] == code]
            v06_row = country_data[country_data["Year"] == 2006]
            v15_row = country_data[country_data["Year"] == 2015]

            if len(v06_row) == 0 or len(v15_row) == 0:
                continue

            v06 = v06_row.iloc[0][col_name]
            v15 = v15_row.iloc[0][col_name]

            if pd.isna(v06) or pd.isna(v15):
                continue

            is_usa = code == "USA"
            fig.add_trace(
                go.Scatter(
                    x=[2006, 2015], y=[v06, v15],
                    mode="lines+markers",
                    name=COUNTRY_NAMES.get(code, code),
                    line=dict(
                        color=COLORS["usa"] if is_usa else COLORS["peers_light"],
                        width=4 if is_usa else 1.5,
                    ),
                    marker=dict(size=10 if is_usa else 6),
                    showlegend=(i == 0),
                    legendgroup=code,
                    hovertemplate=f"{COUNTRY_NAMES.get(code, code)}<br>"
                                  f"{{x}}: {{y:.1f}}<extra></extra>",
                ),
                row=row, col=col,
            )

    fig = _apply_defaults(
        fig,
        title=dict(text="2006 vs. 2015: Where Did the U.S. Improve?", font_size=20),
        height=350 * rows,
        width=850,
    )

    # Clean up axes
    for i in range(1, n + 1):
        fig.update_xaxes(tickvals=[2006, 2015], row=(i-1)//cols+1, col=(i-1)%cols+1)

    return fig


# ── Chart 5: Bump Chart (Rankings Over Time) ──────────────────────────────

def make_bump_chart(df=None, indicator="maternal_mortality_ratio"):
    """
    Rank of each peer country over time for a single indicator.
    """
    if df is None:
        df = load_data()

    lower_is_better = VAR_LOWER_IS_BETTER.get(indicator, True)
    label = VAR_LABELS.get(indicator, indicator)
    years = sorted(df["Year"].unique())

    fig = go.Figure()

    for code in PEER_COUNTRIES:
        ranks = []
        for year in years:
            year_data = df[
                (df["Country.Code"].isin(PEER_COUNTRIES)) & (df["Year"] == year)
            ]
            subset = year_data[["Country.Code", indicator]].dropna()
            if len(subset) < 3:
                ranks.append(None)
                continue

            if lower_is_better:
                subset["rank"] = subset[indicator].rank(ascending=True)
            else:
                subset["rank"] = subset[indicator].rank(ascending=False)

            us_rank = subset[subset["Country.Code"] == code]["rank"]
            ranks.append(us_rank.iloc[0] if len(us_rank) > 0 else None)

        is_usa = code == "USA"
        fig.add_trace(go.Scatter(
            x=years, y=ranks,
            mode="lines+markers+text",
            name=COUNTRY_NAMES.get(code, code),
            line=dict(
                color=COUNTRY_COLORS.get(code, "#999"),
                width=4 if is_usa else 2,
            ),
            marker=dict(size=10 if is_usa else 6),
            text=[COUNTRY_NAMES.get(code, code).split()[-1] if y == years[-1] else "" for y in years],
            textposition="middle right",
            textfont=dict(size=11),
        ))

    fig = _apply_defaults(
        fig,
        title=dict(text=f"Peer Ranking: {label}", font_size=20),
        yaxis=dict(
            title="Rank (1 = Best)", autorange="reversed",
            dtick=1, range=[0.5, 6.5],
            gridcolor="rgba(0,0,0,0.05)",
        ),
        xaxis=dict(title="", dtick=1),
        height=400,
        width=800,
        showlegend=False,
    )
    return fig


# ── Chart 6: Income Bands Dot Plot ────────────────────────────────────────

def make_income_bands(df=None, year=2010):
    """
    For each indicator, show U.S. value against colored bands
    for HIC, UMC, and World averages.
    """
    if df is None:
        df = load_data()

    usa_row = df[(df["Country.Code"] == "USA") & (df["Year"] == year)].iloc[0]

    agg_codes = ["HIC", "UMC", "WLD"]
    agg_data = df[(df["Country.Code"].isin(agg_codes)) & (df["Year"] == year)]

    fig = go.Figure()

    indicators = []
    usa_vals = []
    hic_vals = []
    umc_vals = []
    wld_vals = []

    for col, label, goal, lower_is_better in FOCUS_VARIABLES:
        usa_val = usa_row[col]
        if pd.isna(usa_val):
            continue

        hic_row = agg_data[agg_data["Country.Code"] == "HIC"]
        umc_row = agg_data[agg_data["Country.Code"] == "UMC"]
        wld_row = agg_data[agg_data["Country.Code"] == "WLD"]

        hic_val = hic_row.iloc[0][col] if len(hic_row) > 0 and pd.notna(hic_row.iloc[0][col]) else None
        umc_val = umc_row.iloc[0][col] if len(umc_row) > 0 and pd.notna(umc_row.iloc[0][col]) else None
        wld_val = wld_row.iloc[0][col] if len(wld_row) > 0 and pd.notna(wld_row.iloc[0][col]) else None

        if hic_val is None:
            continue

        indicators.append(label)
        usa_vals.append(usa_val)
        hic_vals.append(hic_val)
        umc_vals.append(umc_val)
        wld_vals.append(wld_val)

    # Normalize each indicator to a 0-1 scale using the range of reference values
    n = len(indicators)

    for i in range(n):
        all_ref = [v for v in [usa_vals[i], hic_vals[i], umc_vals[i], wld_vals[i]] if v is not None]
        vmin, vmax = min(all_ref), max(all_ref)
        span = vmax - vmin if vmax != vmin else 1

        y_pos = n - i - 1  # Plot from top to bottom

        # Reference markers
        if hic_vals[i] is not None:
            fig.add_trace(go.Scatter(
                x=[hic_vals[i]], y=[y_pos],
                mode="markers", marker=dict(size=14, color=COLORS["peers"], symbol="diamond"),
                name="High Income" if i == 0 else None,
                showlegend=(i == 0),
                legendgroup="HIC",
                hovertemplate=f"High Income: {hic_vals[i]:.1f}<extra></extra>",
            ))

        if umc_vals[i] is not None:
            fig.add_trace(go.Scatter(
                x=[umc_vals[i]], y=[y_pos],
                mode="markers", marker=dict(size=14, color=COLORS["umc"], symbol="square"),
                name="Upper Middle Income" if i == 0 else None,
                showlegend=(i == 0),
                legendgroup="UMC",
                hovertemplate=f"Upper Middle Income: {umc_vals[i]:.1f}<extra></extra>",
            ))

        if wld_vals[i] is not None:
            fig.add_trace(go.Scatter(
                x=[wld_vals[i]], y=[y_pos],
                mode="markers", marker=dict(size=14, color=COLORS["world"], symbol="triangle-up"),
                name="World" if i == 0 else None,
                showlegend=(i == 0),
                legendgroup="WLD",
                hovertemplate=f"World: {wld_vals[i]:.1f}<extra></extra>",
            ))

        # USA dot (on top)
        fig.add_trace(go.Scatter(
            x=[usa_vals[i]], y=[y_pos],
            mode="markers+text",
            marker=dict(size=18, color=COLORS["usa"], line=dict(width=2, color="white")),
            text=[f" {usa_vals[i]:.1f}"],
            textposition="middle right",
            textfont=dict(size=11, color=COLORS["usa"]),
            name="United States" if i == 0 else None,
            showlegend=(i == 0),
            legendgroup="USA",
            hovertemplate=f"USA: {usa_vals[i]:.1f}<extra></extra>",
        ))

    fig = _apply_defaults(
        fig,
        title=dict(text=f"U.S. vs. Income Group Averages ({year})", font_size=20),
        yaxis=dict(
            tickmode="array",
            tickvals=list(range(n)),
            ticktext=list(reversed(indicators)),
            gridcolor="rgba(0,0,0,0.03)",
        ),
        xaxis=dict(title="Value", gridcolor="rgba(0,0,0,0.05)"),
        height=max(400, 50 * n),
        width=900,
        legend=dict(x=0.7, y=0.02),
    )
    return fig


# ── Chart 7: Gap Bar Chart (Simple) ───────────────────────────────────────

def make_gap_highlights(df=None, year=2010):
    """
    Simple horizontal bar chart highlighting the worst gaps.
    Designed for quick comprehension — the 'elevator pitch' chart.
    """
    if df is None:
        df = load_data()

    usa_row = df[(df["Country.Code"] == "USA") & (df["Year"] == year)].iloc[0]
    peer_data = df[
        (df["Country.Code"].isin(PEER_COUNTRIES_NO_US)) & (df["Year"] == year)
    ]
    peer_avg = peer_data[FOCUS_COLS].mean()

    # Focus on the worst gaps only
    worst = [
        ("adol_fert_rate", "Adolescent Fertility", "3x higher than peers"),
        ("co2_emissions_percap", "CO\u2082 per Capita", "2x higher than peers"),
        ("maternal_mortality_ratio", "Maternal Mortality", "75% higher than peers"),
        ("mortality_rate_infant", "Infant Mortality", "68% higher than peers"),
        ("life_exp", "Life Expectancy", "Lowest among peers"),
        ("prop_women_parliament", "Women in Parliament", "21% below peers"),
    ]

    labels = []
    usa_values = []
    peer_values = []

    for col, label, _ in worst:
        uv = usa_row[col]
        pv = peer_avg[col]
        if pd.notna(uv) and pd.notna(pv):
            labels.append(label)
            usa_values.append(round(uv, 1))
            peer_values.append(round(pv, 1))

    fig = go.Figure()

    fig.add_trace(go.Bar(
        y=labels, x=peer_values, orientation="h",
        name="Peer Average",
        marker_color=COLORS["peers"],
        text=[f"{v}" for v in peer_values],
        textposition="inside",
    ))

    fig.add_trace(go.Bar(
        y=labels, x=usa_values, orientation="h",
        name="United States",
        marker_color=COLORS["usa"],
        text=[f"{v}" for v in usa_values],
        textposition="inside",
    ))

    fig = _apply_defaults(
        fig,
        title=dict(text=f"The Gap: U.S. vs. Peers ({year})", font_size=20),
        barmode="group",
        xaxis=dict(title="Value", gridcolor="rgba(0,0,0,0.05)"),
        yaxis=dict(title=""),
        height=400,
        width=800,
        legend=dict(x=0.7, y=1.0),
    )
    return fig


# ── Export Helper ──────────────────────────────────────────────────────────

def export_all(output_dir="../website/assets"):
    """Export all charts as HTML divs and PNGs."""
    import plotly.io as pio
    os.makedirs(output_dir, exist_ok=True)
    os.makedirs(os.path.join(output_dir, "png"), exist_ok=True)

    df = load_data()

    charts = {
        "radar": make_radar_chart(df),
        "diverging_bar": make_diverging_bar(df),
        "scatter_maternal": make_scatter_outlier(df, "maternal_mortality_ratio"),
        "scatter_adol_fert": make_scatter_outlier(df, "adol_fert_rate"),
        "scatter_life_exp": make_scatter_outlier(df, "life_exp"),
        "slope": make_slope_chart(df),
        "bump_maternal": make_bump_chart(df, "maternal_mortality_ratio"),
        "bump_co2": make_bump_chart(df, "co2_emissions_percap"),
        "income_bands": make_income_bands(df),
        "gap_highlights": make_gap_highlights(df),
    }

    for name, fig in charts.items():
        # HTML div (for embedding in website)
        html_path = os.path.join(output_dir, f"{name}.html")
        html_content = pio.to_html(fig, full_html=False, include_plotlyjs=False)
        with open(html_path, "w") as f:
            f.write(html_content)

        # PNG (for poster) — requires kaleido
        try:
            png_path = os.path.join(output_dir, "png", f"{name}.png")
            fig.write_image(png_path, width=1200, height=800, scale=2)
        except Exception:
            pass  # kaleido may not be installed

        print(f"Exported: {name}")

    print(f"\nAll charts exported to {output_dir}")


if __name__ == "__main__":
    export_all()
