"""
Export all charts as HTML divs and optionally assemble them into the website.

Usage:
    python visualizations/export_charts.py          # Export chart divs
    python visualizations/export_charts.py --build   # Export + build full website
"""

import sys
import os

# Ensure analysis/ is importable
sys.path.insert(0, os.path.join(os.path.dirname(__file__), '..', 'analysis'))

import plotly.io as pio
from charts import (
    make_radar_chart, make_diverging_bar, make_scatter_outlier,
    make_slope_chart, make_bump_chart, make_income_bands, make_gap_highlights,
)
from helpers import load_data

PROJECT_ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
ASSETS_DIR = os.path.join(PROJECT_ROOT, "website", "assets")
WEBSITE_DIR = os.path.join(PROJECT_ROOT, "website")


def export_chart_divs():
    """Generate all chart HTML divs and save to website/assets/."""
    os.makedirs(ASSETS_DIR, exist_ok=True)
    os.makedirs(os.path.join(ASSETS_DIR, "png"), exist_ok=True)

    print("Loading data...")
    df = load_data()

    charts = {
        "radar": make_radar_chart(df),
        "diverging": make_diverging_bar(df),
        "scatter_maternal": make_scatter_outlier(df, "maternal_mortality_ratio"),
        "scatter_adol": make_scatter_outlier(df, "adol_fert_rate"),
        "scatter_life_exp": make_scatter_outlier(df, "life_exp"),
        "slope": make_slope_chart(df),
        "income_bands": make_income_bands(df),
        "gap_highlights": make_gap_highlights(df),
    }

    divs = {}
    for name, fig in charts.items():
        # HTML div
        html_div = pio.to_html(fig, full_html=False, include_plotlyjs=False)
        div_path = os.path.join(ASSETS_DIR, f"{name}.html")
        with open(div_path, "w") as f:
            f.write(html_div)
        divs[name] = html_div
        print(f"  Exported: {name}.html")

        # PNG (optional, requires kaleido)
        try:
            png_path = os.path.join(ASSETS_DIR, "png", f"{name}.png")
            fig.write_image(png_path, width=1200, height=800, scale=2)
            print(f"  Exported: png/{name}.png")
        except Exception as e:
            print(f"  Skipped PNG for {name}: {e}")

    return divs


def build_website(divs):
    """Read the template index.html and replace placeholder sections with chart divs."""
    import re

    template_path = os.path.join(WEBSITE_DIR, "index.html")
    output_path = os.path.join(WEBSITE_DIR, "index.html")

    with open(template_path, "r") as f:
        html = f.read()

    # Map chart IDs in HTML to exported div names
    replacements = {
        'id="chart-radar"': ("radar", "chart-radar"),
        'id="chart-diverging"': ("diverging", "chart-diverging"),
        'id="chart-scatter-maternal"': ("scatter_maternal", "chart-scatter-maternal"),
        'id="chart-scatter-adol"': ("scatter_adol", "chart-scatter-adol"),
        'id="chart-slope"': ("slope", "chart-slope"),
        'id="chart-income-bands"': ("income_bands", "chart-income-bands"),
    }

    for marker, (chart_name, div_id) in replacements.items():
        if chart_name in divs:
            pattern = re.compile(
                rf'<div class="chart-container" {re.escape(marker)}>.*?</div>',
                re.DOTALL,
            )
            new_div = f'<div class="chart-container" {marker}>\n{divs[chart_name]}\n</div>'
            # Use a lambda to avoid re interpreting backslashes in the replacement
            html = pattern.sub(lambda m: new_div, html, count=1)
            print(f"  Embedded: {chart_name} -> #{div_id}")

    with open(output_path, "w") as f:
        f.write(html)

    print(f"\nWebsite built: {output_path}")


if __name__ == "__main__":
    divs = export_chart_divs()

    if "--build" in sys.argv:
        build_website(divs)
    else:
        print("\nRun with --build to embed charts into index.html")
        print(f"Chart divs saved to: {ASSETS_DIR}")
