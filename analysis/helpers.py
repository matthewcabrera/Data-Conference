"""
Shared constants and helper functions for the America's Development Paradox project.
"""

import pandas as pd
import os

# ── Paths ──────────────────────────────────────────────────────────────────
PROJECT_ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
DATA_PATH = os.path.join(PROJECT_ROOT, "coded_reshaped_mdg.csv")
METADATA_PATH = os.path.join(PROJECT_ROOT, "MDG_Metadata_coded.xlsx")

# ── Country Groups ─────────────────────────────────────────────────────────
PEER_COUNTRIES = ["USA", "GBR", "DEU", "JPN", "CAN", "FRA"]
PEER_COUNTRIES_NO_US = ["GBR", "DEU", "JPN", "CAN", "FRA"]

EXTENDED_PEERS = [
    "USA", "GBR", "DEU", "JPN", "CAN", "FRA",
    "AUS", "NLD", "SWE", "NOR", "ITA", "ESP",
]

# Regional / income aggregates
AGGREGATES = {
    "HIC": "High Income",
    "UMC": "Upper Middle Income",
    "LMC": "Lower Middle Income",
    "LIC": "Low Income",
    "WLD": "World",
    "OED": "OECD Members",
}

# ── Focus Variables ────────────────────────────────────────────────────────
# Each entry: (csv_column, human_label, mdg_goal, lower_is_better)
FOCUS_VARIABLES = [
    ("maternal_mortality_ratio",            "Maternal Mortality (per 100K)",      5, True),
    ("adol_fert_rate",                      "Adolescent Fertility Rate",          5, True),
    ("co2_emissions_percap",                "CO\u2082 Emissions per Capita (mt)",       7, True),
    ("mortality_rate_infant",               "Infant Mortality (per 1,000)",       4, True),
    ("mortality_rate_under5",               "Under-5 Mortality (per 1,000)",      4, True),
    ("life_exp",                            "Life Expectancy (years)",            4, False),
    ("prop_women_parliament",               "Women in Parliament (%)",            3, False),
    ("net_oda_provided_pctgni",             "ODA as % of GNI",                   8, False),
    ("trade_pct_gdp",                       "Trade as % of GDP",                 8, False),
    ("immunization_measles_pct_12-23mos",   "Measles Immunization (%)",          4, False),
    ("internet_users",                      "Internet Users (%)",                8, False),
    ("tb_incidence",                        "TB Incidence (per 100K)",           6, True),
    ("pct_undernourished",                  "Undernourishment (%)",              1, True),
    ("co2_emissions_by_gdp",               "CO\u2082 Emissions per GDP",              7, True),
]

# Quick-access mappings
VAR_LABELS = {col: label for col, label, _, _ in FOCUS_VARIABLES}
VAR_GOALS = {col: goal for col, _, goal, _ in FOCUS_VARIABLES}
VAR_LOWER_IS_BETTER = {col: lib for col, _, _, lib in FOCUS_VARIABLES}
FOCUS_COLS = [col for col, _, _, _ in FOCUS_VARIABLES]

# ── Color Palette ──────────────────────────────────────────────────────────
COLORS = {
    "usa":        "#E63946",  # Strong red
    "peers":      "#457B9D",  # Steel blue
    "peers_light": "#A8DADC", # Light blue
    "umc":        "#F4A261",  # Amber
    "world":      "#2A9D8F",  # Teal
    "better":     "#2D6A4F",  # Dark green
    "worse":      "#E63946",  # Red (same as USA for consistency)
    "bg":         "#F1FAEE",  # Off-white
    "text":       "#1D3557",  # Dark navy
}

COUNTRY_COLORS = {
    "USA": "#E63946",
    "GBR": "#457B9D",
    "DEU": "#264653",
    "JPN": "#2A9D8F",
    "CAN": "#E9C46A",
    "FRA": "#F4A261",
}

COUNTRY_NAMES = {
    "USA": "United States",
    "GBR": "United Kingdom",
    "DEU": "Germany",
    "JPN": "Japan",
    "CAN": "Canada",
    "FRA": "France",
}

# ── Data Loading ───────────────────────────────────────────────────────────

def load_data():
    """Load the primary MDG dataset."""
    df = pd.read_csv(DATA_PATH)
    # Standardize column names (the CSV uses dots, keep as-is for now)
    return df


def load_metadata():
    """Load the metadata spreadsheet."""
    return pd.read_excel(METADATA_PATH)


def get_country(df, code):
    """Filter dataframe to a single country by code."""
    return df[df["Country.Code"] == code].sort_values("Year")


def get_countries(df, codes):
    """Filter dataframe to multiple countries."""
    return df[df["Country.Code"].isin(codes)].sort_values(["Country.Code", "Year"])


def get_peer_average(df, year=None):
    """Compute the average of the 5 non-US peer countries for focus variables."""
    peers = df[df["Country.Code"].isin(PEER_COUNTRIES_NO_US)]
    if year is not None:
        peers = peers[peers["Year"] == year]
    return peers.groupby("Year")[FOCUS_COLS].mean()


def compute_pct_difference(usa_val, peer_val):
    """Compute percent difference: how far USA is from peer average."""
    if peer_val == 0:
        return float("nan")
    return ((usa_val - peer_val) / abs(peer_val)) * 100


def assign_grade(pct_diff, lower_is_better):
    """
    Assign a letter grade based on % difference from peer average.
    Positive pct_diff means USA value is higher than peers.
    """
    # Flip sign if lower is better (higher = worse)
    effective_diff = pct_diff if not lower_is_better else -pct_diff

    if effective_diff >= 10:
        return "A"   # 10%+ better than peers
    elif effective_diff >= -10:
        return "B"   # Within 10% of peers
    elif effective_diff >= -25:
        return "C"   # 10-25% worse
    elif effective_diff >= -50:
        return "D"   # 25-50% worse
    else:
        return "F"   # 50%+ worse


def normalize_score(value, best, worst):
    """
    Normalize a value to 0-100 scale where 100 = best.
    best/worst are defined relative to the comparison group.
    """
    if best == worst:
        return 50.0
    return 100 * (value - worst) / (best - worst)
