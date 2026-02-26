const DATA_PATH = {
  metadata: "data/metadata.json",
  long: "data/country_year_long.json",
  residuals: "data/residuals_long.json",
  trends: "data/country_trends.json",
  movers: "data/top_movers.json",
};

const MAX_COMPARE = 5;
const DEFAULT_YEAR = 2010;
const DEFAULT_INDICATOR = "maternal_mortality_ratio";

const state = {
  indicator: null,
  countryCode: "USA",
  compareCodes: [],
  region: "All",
  incomeGroup: "All",
  year: DEFAULT_YEAR,
  isPlaying: false,
  timelapseMs: 1000,
  timerId: null,
};

const cache = {
  metadata: null,
  long: [],
  residuals: [],
  trends: [],
  movers: {},
  countryMap: new Map(),
  indicatorMap: new Map(),
  longByIndicatorYear: new Map(),
  residualByIndicatorYear: new Map(),
  longByCountryIndicator: new Map(),
  residualByCountryIndicator: new Map(),
};

const els = {
  indicator: document.getElementById("indicator-select"),
  country: document.getElementById("country-select"),
  region: document.getElementById("region-select"),
  income: document.getElementById("income-select"),
  yearSlider: document.getElementById("year-slider"),
  yearValue: document.getElementById("year-value"),
  kpiCount: document.getElementById("kpi-country-count"),
  kpiCoverage: document.getElementById("kpi-coverage"),
  kpiPercentile: document.getElementById("kpi-percentile"),
  kpiResidual: document.getElementById("kpi-residual"),
  insight: document.getElementById("insight-text"),
  best: document.getElementById("movers-best"),
  worst: document.getElementById("movers-worst"),
  peersTable: document.getElementById("peers-table"),
  presetRow: document.getElementById("preset-row"),
  countrySearchInput: document.getElementById("country-search-input"),
  countrySearchList: document.getElementById("country-search-list"),
  resetFiltersBtn: document.getElementById("reset-filters-btn"),
  compareCountrySelect: document.getElementById("compare-country-select"),
  addCompareBtn: document.getElementById("add-compare-btn"),
  compareChips: document.getElementById("compare-chips"),
  timelapseToggleBtn: document.getElementById("timelapse-toggle-btn"),
  stepBackBtn: document.getElementById("step-back-btn"),
  stepForwardBtn: document.getElementById("step-forward-btn"),
  timelapseSpeedSelect: document.getElementById("timelapse-speed-select"),
};

function fmt(value, digits = 1) {
  if (value === null || value === undefined || Number.isNaN(value)) {
    return "n/a";
  }
  return Number(value).toFixed(digits);
}

function withCommas(value) {
  if (value === null || value === undefined || Number.isNaN(value)) {
    return "n/a";
  }
  return Number(value).toLocaleString();
}

function countryName(code) {
  const row = cache.countryMap.get(code);
  return row ? row["Country.Name"] : code;
}

function indicatorMeta() {
  return cache.indicatorMap.get(state.indicator);
}

function yearBounds() {
  const years = cache.metadata.years;
  return [Math.min(...years), Math.max(...years)];
}

function keyIndicatorYear(indicator, year) {
  return `${indicator}|${year}`;
}

function keyCountryIndicator(code, indicator) {
  return `${code}|${indicator}`;
}

function renderEmptyPlot(divId, title) {
  Plotly.react(
    divId,
    [],
    {
      title,
      annotations: [
        {
          text: "No data for this selection",
          showarrow: false,
          x: 0.5,
          y: 0.5,
          xref: "paper",
          yref: "paper",
          font: { size: 14, color: "#64748b" },
        },
      ],
      margin: { l: 40, r: 20, t: 56, b: 40 },
      paper_bgcolor: "rgba(0,0,0,0)",
      plot_bgcolor: "white",
    },
    { responsive: true }
  );
}

function median(values) {
  if (!values || values.length === 0) return null;
  const sorted = values.slice().sort((a, b) => a - b);
  const mid = Math.floor(sorted.length / 2);
  if (sorted.length % 2 === 0) {
    return (sorted[mid - 1] + sorted[mid]) / 2;
  }
  return sorted[mid];
}

function euclideanDistance(a, b) {
  const keysA = Object.keys(a);
  const keysB = new Set(Object.keys(b));
  const overlap = keysA.filter((k) => keysB.has(k));
  if (overlap.length === 0) return null;
  let sumSq = 0;
  for (const key of overlap) {
    const diff = Number(a[key]) - Number(b[key]);
    sumSq += diff * diff;
  }
  return {
    distance: Math.sqrt(sumSq / overlap.length),
    overlap: overlap.length,
  };
}

function currentViewCountryRows() {
  let countries = cache.metadata.countries.slice();
  if (state.region !== "All") {
    countries = countries.filter((c) => c.Region === state.region);
  }
  if (state.incomeGroup !== "All") {
    countries = countries.filter((c) => c["Income.Group"] === state.incomeGroup);
  }
  return countries;
}

function filterRowsByView(rows) {
  return rows.filter((row) => {
    if (state.region !== "All" && row.Region !== state.region) return false;
    if (state.incomeGroup !== "All" && row["Income.Group"] !== state.incomeGroup) return false;
    return true;
  });
}

function buildIndices() {
  cache.longByIndicatorYear.clear();
  cache.residualByIndicatorYear.clear();
  cache.longByCountryIndicator.clear();
  cache.residualByCountryIndicator.clear();

  for (const row of cache.long) {
    const keyA = keyIndicatorYear(row.indicator, Number(row.Year));
    if (!cache.longByIndicatorYear.has(keyA)) cache.longByIndicatorYear.set(keyA, []);
    cache.longByIndicatorYear.get(keyA).push(row);

    const keyB = keyCountryIndicator(row["Country.Code"], row.indicator);
    if (!cache.longByCountryIndicator.has(keyB)) cache.longByCountryIndicator.set(keyB, []);
    cache.longByCountryIndicator.get(keyB).push(row);
  }

  for (const row of cache.residuals) {
    const keyA = keyIndicatorYear(row.indicator, Number(row.Year));
    if (!cache.residualByIndicatorYear.has(keyA)) cache.residualByIndicatorYear.set(keyA, []);
    cache.residualByIndicatorYear.get(keyA).push(row);

    const keyB = keyCountryIndicator(row["Country.Code"], row.indicator);
    if (!cache.residualByCountryIndicator.has(keyB)) cache.residualByCountryIndicator.set(keyB, []);
    cache.residualByCountryIndicator.get(keyB).push(row);
  }

  for (const list of cache.longByCountryIndicator.values()) {
    list.sort((a, b) => Number(a.Year) - Number(b.Year));
  }
  for (const list of cache.residualByCountryIndicator.values()) {
    list.sort((a, b) => Number(a.Year) - Number(b.Year));
  }
}

async function loadData() {
  const [metadata, longRows, residualRows, trendsRows, movers] = await Promise.all([
    fetch(DATA_PATH.metadata).then((r) => r.json()),
    fetch(DATA_PATH.long).then((r) => r.json()),
    fetch(DATA_PATH.residuals).then((r) => r.json()),
    fetch(DATA_PATH.trends).then((r) => r.json()),
    fetch(DATA_PATH.movers).then((r) => r.json()),
  ]);

  cache.metadata = metadata;
  cache.long = longRows;
  cache.residuals = residualRows;
  cache.trends = trendsRows;
  cache.movers = movers;
  cache.countryMap = new Map(metadata.countries.map((c) => [c["Country.Code"], c]));
  cache.indicatorMap = new Map(metadata.indicators.map((ind) => [ind.indicator, ind]));
  buildIndices();
}

function setPresetActive() {
  const buttons = [...els.presetRow.querySelectorAll(".preset-btn")];
  for (const btn of buttons) {
    const region = btn.dataset.region || "All";
    const income = btn.dataset.income || "All";
    const isActive = region === state.region && income === state.incomeGroup;
    btn.classList.toggle("active", isActive);
  }
}

function normalizeSelectionState() {
  const available = currentViewCountryRows();
  const codeSet = new Set(available.map((c) => c["Country.Code"]));

  if (available.length === 0) {
    state.region = "All";
    state.incomeGroup = "All";
    return normalizeSelectionState();
  }

  if (!codeSet.has(state.countryCode)) {
    state.countryCode = codeSet.has("USA") ? "USA" : available[0]["Country.Code"];
  }

  state.compareCodes = state.compareCodes.filter((code) => codeSet.has(code) && code !== state.countryCode);
}

function refreshCountryOptions() {
  normalizeSelectionState();
  const countries = currentViewCountryRows().sort((a, b) =>
    a["Country.Name"].localeCompare(b["Country.Name"])
  );

  els.country.innerHTML = "";
  els.countrySearchList.innerHTML = "";
  for (const c of countries) {
    const opt = document.createElement("option");
    opt.value = c["Country.Code"];
    opt.textContent = c["Country.Name"];
    els.country.appendChild(opt);

    const searchOpt = document.createElement("option");
    searchOpt.value = c["Country.Name"];
    els.countrySearchList.appendChild(searchOpt);
  }
  els.country.value = state.countryCode;

  els.compareCountrySelect.innerHTML = "";
  const compareCandidates = countries.filter(
    (c) => c["Country.Code"] !== state.countryCode && !state.compareCodes.includes(c["Country.Code"])
  );
  for (const c of compareCandidates) {
    const opt = document.createElement("option");
    opt.value = c["Country.Code"];
    opt.textContent = c["Country.Name"];
    els.compareCountrySelect.appendChild(opt);
  }
}

function renderCompareChips() {
  els.compareChips.innerHTML = "";
  if (state.compareCodes.length === 0) {
    const msg = document.createElement("span");
    msg.className = "compare-chip";
    msg.textContent = "No comparison countries selected";
    els.compareChips.appendChild(msg);
    return;
  }

  for (const code of state.compareCodes) {
    const chip = document.createElement("span");
    chip.className = "compare-chip";
    chip.innerHTML = `${countryName(code)} <button class="chip-remove" data-remove-code="${code}" title="Remove">x</button>`;
    els.compareChips.appendChild(chip);
  }
}

function setYear(year) {
  const [minYear, maxYear] = yearBounds();
  const clamped = Math.max(minYear, Math.min(maxYear, Number(year)));
  state.year = clamped;
  els.yearSlider.value = String(clamped);
  els.yearValue.textContent = String(clamped);
}

function stepYear(delta) {
  const [minYear, maxYear] = yearBounds();
  let next = state.year + delta;
  if (next > maxYear) next = minYear;
  if (next < minYear) next = maxYear;
  setYear(next);
}

function stopTimelapse() {
  if (state.timerId !== null) {
    clearInterval(state.timerId);
    state.timerId = null;
  }
  state.isPlaying = false;
  els.timelapseToggleBtn.textContent = "▶ Play Timelapse";
}

function startTimelapse() {
  stopTimelapse();
  state.isPlaying = true;
  els.timelapseToggleBtn.textContent = "⏸ Pause Timelapse";
  state.timerId = setInterval(() => {
    stepYear(1);
    renderAll();
  }, state.timelapseMs);
}

function toggleTimelapse() {
  if (state.isPlaying) {
    stopTimelapse();
  } else {
    startTimelapse();
  }
}

function addCompareCountry(code) {
  if (!code || code === state.countryCode) return;
  if (state.compareCodes.includes(code)) return;
  if (state.compareCodes.length >= MAX_COMPARE) return;
  state.compareCodes.push(code);
}

function removeCompareCountry(code) {
  state.compareCodes = state.compareCodes.filter((c) => c !== code);
}

function handleCountrySearch() {
  const raw = (els.countrySearchInput.value || "").trim().toLowerCase();
  if (!raw) return;
  const countries = currentViewCountryRows();
  const exact = countries.find((c) => c["Country.Name"].toLowerCase() === raw);
  const prefix = countries.find((c) => c["Country.Name"].toLowerCase().startsWith(raw));
  const picked = exact || prefix;
  if (picked) {
    state.countryCode = picked["Country.Code"];
    refreshCountryOptions();
    renderCompareChips();
    renderAll();
    els.countrySearchInput.value = picked["Country.Name"];
  }
}

function initControls() {
  const indicatorOptions = cache.metadata.indicators
    .slice()
    .sort((a, b) => a.label.localeCompare(b.label));
  els.indicator.innerHTML = "";
  for (const ind of indicatorOptions) {
    const opt = document.createElement("option");
    opt.value = ind.indicator;
    opt.textContent = `${ind.label} (${fmt(ind.coverage_pct_country_year, 0)}% coverage)`;
    els.indicator.appendChild(opt);
  }

  state.indicator = indicatorOptions.find((d) => d.indicator === DEFAULT_INDICATOR)
    ? DEFAULT_INDICATOR
    : indicatorOptions[0].indicator;
  els.indicator.value = state.indicator;

  const regionSet = new Set(cache.metadata.countries.map((c) => c.Region).filter(Boolean));
  const incomeSet = new Set(cache.metadata.countries.map((c) => c["Income.Group"]).filter(Boolean));
  els.region.innerHTML = "";
  els.income.innerHTML = "";

  const allRegion = document.createElement("option");
  allRegion.value = "All";
  allRegion.textContent = "All Regions";
  els.region.appendChild(allRegion);
  for (const region of [...regionSet].sort()) {
    const opt = document.createElement("option");
    opt.value = region;
    opt.textContent = region;
    els.region.appendChild(opt);
  }

  const allIncome = document.createElement("option");
  allIncome.value = "All";
  allIncome.textContent = "All Income Groups";
  els.income.appendChild(allIncome);
  for (const income of [...incomeSet].sort()) {
    const opt = document.createElement("option");
    opt.value = income;
    opt.textContent = income;
    els.income.appendChild(opt);
  }

  const [minYear, maxYear] = yearBounds();
  const initYear = cache.metadata.years.includes(DEFAULT_YEAR) ? DEFAULT_YEAR : maxYear;
  els.yearSlider.min = String(minYear);
  els.yearSlider.max = String(maxYear);
  setYear(initYear);

  state.region = "All";
  state.incomeGroup = "All";
  state.compareCodes = [];
  els.region.value = "All";
  els.income.value = "All";
  els.timelapseSpeedSelect.value = String(state.timelapseMs);
  setPresetActive();
  refreshCountryOptions();
  renderCompareChips();

  els.indicator.addEventListener("change", () => {
    state.indicator = els.indicator.value;
    renderAll();
  });

  els.country.addEventListener("change", () => {
    state.countryCode = els.country.value;
    state.compareCodes = state.compareCodes.filter((code) => code !== state.countryCode);
    refreshCountryOptions();
    renderCompareChips();
    renderAll();
  });

  els.region.addEventListener("change", () => {
    state.region = els.region.value;
    setPresetActive();
    refreshCountryOptions();
    renderCompareChips();
    renderAll();
  });

  els.income.addEventListener("change", () => {
    state.incomeGroup = els.income.value;
    setPresetActive();
    refreshCountryOptions();
    renderCompareChips();
    renderAll();
  });

  els.yearSlider.addEventListener("input", () => {
    setYear(els.yearSlider.value);
    renderAll();
  });

  els.presetRow.addEventListener("click", (event) => {
    const btn = event.target.closest(".preset-btn");
    if (!btn) return;
    state.region = btn.dataset.region || "All";
    state.incomeGroup = btn.dataset.income || "All";
    els.region.value = state.region;
    els.income.value = state.incomeGroup;
    setPresetActive();
    refreshCountryOptions();
    renderCompareChips();
    renderAll();
  });

  els.countrySearchInput.addEventListener("change", handleCountrySearch);
  els.countrySearchInput.addEventListener("keydown", (event) => {
    if (event.key === "Enter") {
      event.preventDefault();
      handleCountrySearch();
    }
  });

  els.resetFiltersBtn.addEventListener("click", () => {
    stopTimelapse();
    state.region = "All";
    state.incomeGroup = "All";
    state.compareCodes = [];
    els.region.value = "All";
    els.income.value = "All";
    els.countrySearchInput.value = "";
    setPresetActive();
    refreshCountryOptions();
    renderCompareChips();
    setYear(DEFAULT_YEAR);
    renderAll();
  });

  els.addCompareBtn.addEventListener("click", () => {
    addCompareCountry(els.compareCountrySelect.value);
    refreshCountryOptions();
    renderCompareChips();
    renderAll();
  });

  els.compareChips.addEventListener("click", (event) => {
    const btn = event.target.closest("[data-remove-code]");
    if (!btn) return;
    removeCompareCountry(btn.dataset.removeCode);
    refreshCountryOptions();
    renderCompareChips();
    renderAll();
  });

  els.timelapseToggleBtn.addEventListener("click", () => {
    toggleTimelapse();
  });
  els.stepBackBtn.addEventListener("click", () => {
    stopTimelapse();
    stepYear(-1);
    renderAll();
  });
  els.stepForwardBtn.addEventListener("click", () => {
    stopTimelapse();
    stepYear(1);
    renderAll();
  });
  els.timelapseSpeedSelect.addEventListener("change", () => {
    state.timelapseMs = Number(els.timelapseSpeedSelect.value);
    if (state.isPlaying) startTimelapse();
  });

  els.peersTable.addEventListener("click", (event) => {
    const btn = event.target.closest("[data-peer-add]");
    if (!btn) return;
    addCompareCountry(btn.dataset.peerAdd);
    refreshCountryOptions();
    renderCompareChips();
    renderAll();
  });
}

function filteredLongRows() {
  const key = keyIndicatorYear(state.indicator, state.year);
  const base = cache.longByIndicatorYear.get(key) || [];
  return filterRowsByView(base);
}

function filteredResidualRows() {
  const key = keyIndicatorYear(state.indicator, state.year);
  const base = cache.residualByIndicatorYear.get(key) || [];
  return filterRowsByView(base);
}

function renderMap(rows) {
  if (rows.length === 0) {
    renderEmptyPlot("map-chart", "Global Percentile Map");
    return;
  }

  const selected = rows.find((d) => d["Country.Code"] === state.countryCode);
  const traces = [
    {
      type: "choropleth",
      locationmode: "ISO-3",
      locations: rows.map((d) => d["Country.Code"]),
      z: rows.map((d) => d.percentile_quality),
      text: rows.map((d) => countryName(d["Country.Code"])),
      colorscale: "YlGnBu",
      zmin: 0,
      zmax: 100,
      colorbar: { title: "Percentile" },
      hovertemplate: "<b>%{text}</b><br>Percentile: %{z:.1f}<extra></extra>",
    },
  ];

  if (selected) {
    traces.push({
      type: "scattergeo",
      mode: "markers+text",
      locations: [selected["Country.Code"]],
      locationmode: "ISO-3",
      text: [countryName(selected["Country.Code"])],
      textposition: "top center",
      marker: {
        size: 10,
        color: "#f97316",
        line: { color: "white", width: 1.5 },
      },
      hovertemplate: "<b>%{text}</b><br>Selected country<extra></extra>",
      showlegend: false,
    });
  }

  Plotly.react(
    "map-chart",
    traces,
    {
      margin: { l: 10, r: 10, t: 12, b: 10 },
      geo: {
        showframe: false,
        showcoastlines: false,
        projection: { type: "natural earth" },
        bgcolor: "rgba(0,0,0,0)",
      },
      paper_bgcolor: "rgba(0,0,0,0)",
      plot_bgcolor: "white",
    },
    { responsive: true }
  );
}

function renderScatter(resRows) {
  if (resRows.length === 0) {
    renderEmptyPlot("scatter-chart", "Wealth vs. Outcomes (Adjusted)");
    return;
  }

  const selected = resRows.find((d) => d["Country.Code"] === state.countryCode);
  const compareSet = new Set(state.compareCodes);
  const others = resRows.filter(
    (d) => d["Country.Code"] !== state.countryCode && !compareSet.has(d["Country.Code"])
  );
  const compareRows = resRows.filter((d) => compareSet.has(d["Country.Code"]));
  const model = resRows[0];

  const traces = [
    {
      type: "scatter",
      mode: "markers",
      x: others.map((d) => d.gni_percap),
      y: others.map((d) => d.value),
      text: others.map((d) => countryName(d["Country.Code"])),
      marker: {
        size: 8,
        opacity: 0.72,
        color: others.map((d) => d.quality_residual_z),
        colorscale: "RdBu",
        reversescale: true,
        cmin: -2.5,
        cmax: 2.5,
        colorbar: { title: "Adj. z" },
        line: { width: 0.4, color: "white" },
      },
      hovertemplate: "<b>%{text}</b><br>GNI per cap: %{x:.0f}<br>Value: %{y:.2f}<extra></extra>",
      name: "Countries",
    },
  ];

  const comparePalette = ["#8b5cf6", "#ef4444", "#f59e0b", "#10b981", "#6366f1"];
  compareRows.forEach((row, idx) => {
    traces.push({
      type: "scatter",
      mode: "markers+text",
      x: [row.gni_percap],
      y: [row.value],
      text: [countryName(row["Country.Code"])],
      textposition: "top center",
      marker: {
        size: 13,
        symbol: "diamond",
        color: comparePalette[idx % comparePalette.length],
        line: { width: 1.2, color: "white" },
      },
      hovertemplate: "<b>%{text}</b><br>GNI per cap: %{x:.0f}<br>Value: %{y:.2f}<extra></extra>",
      name: `Compare: ${countryName(row["Country.Code"])}`,
    });
  });

  if (selected) {
    traces.push({
      type: "scatter",
      mode: "markers",
      x: [selected.gni_percap],
      y: [selected.value],
      text: [countryName(selected["Country.Code"])],
      marker: {
        size: 18,
        color: "#f97316",
        symbol: "star",
        line: { width: 1.5, color: "white" },
      },
      hovertemplate: "<b>%{text}</b><br>GNI per cap: %{x:.0f}<br>Value: %{y:.2f}<extra></extra>",
      name: "Selected Country",
    });
  }

  const selectedHistory =
    cache.residualByCountryIndicator.get(keyCountryIndicator(state.countryCode, state.indicator)) ||
    [];
  if (selectedHistory.length > 1) {
    traces.push({
      type: "scatter",
      mode: "lines+markers",
      x: selectedHistory.map((d) => d.gni_percap),
      y: selectedHistory.map((d) => d.value),
      text: selectedHistory.map((d) => String(d.Year)),
      line: { color: "rgba(249,115,22,0.45)", width: 2 },
      marker: { size: 5, color: "#f97316" },
      hovertemplate:
        "<b>Selected country</b><br>Year: %{text}<br>GNI per cap: %{x:.0f}<br>Value: %{y:.2f}<extra></extra>",
      name: "Selected Trajectory",
    });
  }

  if (model.model_slope !== null && model.model_intercept !== null) {
    const xMin = Math.min(...resRows.map((d) => d.gni_percap));
    const xMax = Math.max(...resRows.map((d) => d.gni_percap));
    const lxMin = Math.log10(xMin);
    const lxMax = Math.log10(xMax);
    const xLine = [];
    const yLine = [];
    const steps = 80;
    for (let i = 0; i <= steps; i += 1) {
      const lx = lxMin + ((lxMax - lxMin) * i) / steps;
      xLine.push(10 ** lx);
      yLine.push(model.model_slope * lx + model.model_intercept);
    }
    traces.push({
      type: "scatter",
      mode: "lines",
      x: xLine,
      y: yLine,
      line: { color: "#0f172a", width: 2, dash: "dash" },
      hoverinfo: "skip",
      name: "Trendline",
    });
  }

  Plotly.react(
    "scatter-chart",
    traces,
    {
      margin: { l: 56, r: 20, t: 10, b: 56 },
      xaxis: {
        title: "GNI per Capita (log scale)",
        type: "log",
        gridcolor: "rgba(15,23,42,0.08)",
      },
      yaxis: { title: "Indicator Value", gridcolor: "rgba(15,23,42,0.08)" },
      legend: { orientation: "h", y: 1.12, x: 0 },
      paper_bgcolor: "rgba(0,0,0,0)",
      plot_bgcolor: "white",
    },
    { responsive: true }
  );
}

function renderTrend() {
  const selectedRows =
    cache.longByCountryIndicator.get(keyCountryIndicator(state.countryCode, state.indicator)) || [];
  if (selectedRows.length === 0) {
    renderEmptyPlot("trend-chart", "Country Trajectory vs. Global Median");
    return;
  }

  const years = cache.metadata.years.slice().sort((a, b) => a - b);
  const medians = [];
  for (const year of years) {
    const yearRows = filterRowsByView(cache.longByIndicatorYear.get(keyIndicatorYear(state.indicator, year)) || []);
    medians.push(median(yearRows.map((r) => r.value)));
  }

  const traces = [
    {
      type: "scatter",
      mode: "lines+markers",
      x: selectedRows.map((d) => d.Year),
      y: selectedRows.map((d) => d.value),
      name: countryName(state.countryCode),
      line: { color: "#0ea5e9", width: 3 },
      marker: { size: 7 },
    },
    {
      type: "scatter",
      mode: "lines+markers",
      x: years,
      y: medians,
      name: "View Median",
      line: { color: "#475569", width: 2, dash: "dot" },
      marker: { size: 6 },
    },
  ];

  const comparePalette = ["#8b5cf6", "#ef4444", "#f59e0b", "#10b981", "#6366f1"];
  state.compareCodes.forEach((code, idx) => {
    const rows = cache.longByCountryIndicator.get(keyCountryIndicator(code, state.indicator)) || [];
    if (rows.length === 0) return;
    traces.push({
      type: "scatter",
      mode: "lines+markers",
      x: rows.map((d) => d.Year),
      y: rows.map((d) => d.value),
      name: countryName(code),
      line: { color: comparePalette[idx % comparePalette.length], width: 2 },
      marker: { size: 5 },
    });
  });

  Plotly.react(
    "trend-chart",
    traces,
    {
      margin: { l: 56, r: 20, t: 10, b: 50 },
      xaxis: { title: "Year", dtick: 1, gridcolor: "rgba(15,23,42,0.08)" },
      yaxis: { title: "Indicator Value", gridcolor: "rgba(15,23,42,0.08)" },
      legend: { orientation: "h", y: 1.14, x: 0 },
      paper_bgcolor: "rgba(0,0,0,0)",
      plot_bgcolor: "white",
    },
    { responsive: true }
  );
}

function renderDistribution(rows) {
  if (rows.length === 0) {
    renderEmptyPlot("distribution-chart", "Distribution at Selected Year");
    return;
  }

  const selected = rows.find((d) => d["Country.Code"] === state.countryCode);
  const layout = {
    margin: { l: 56, r: 20, t: 10, b: 50 },
    xaxis: { title: "Indicator Value", gridcolor: "rgba(15,23,42,0.08)" },
    yaxis: { title: "Country Count", gridcolor: "rgba(15,23,42,0.08)" },
    paper_bgcolor: "rgba(0,0,0,0)",
    plot_bgcolor: "white",
  };

  if (selected) {
    layout.shapes = [
      {
        type: "line",
        x0: selected.value,
        x1: selected.value,
        y0: 0,
        y1: 1,
        yref: "paper",
        line: { color: "#ef4444", width: 2, dash: "dash" },
      },
    ];
    layout.annotations = [
      {
        x: selected.value,
        y: 1,
        yref: "paper",
        text: countryName(selected["Country.Code"]),
        showarrow: false,
        yshift: 12,
        font: { color: "#ef4444", size: 11 },
      },
    ];
  }

  Plotly.react(
    "distribution-chart",
    [
      {
        type: "histogram",
        x: rows.map((d) => d.value),
        marker: { color: "#14b8a6", line: { color: "white", width: 0.5 } },
        opacity: 0.88,
        nbinsx: 28,
        name: "Distribution",
      },
      {
        type: "box",
        x: rows.map((d) => d.value),
        name: "Summary",
        marker: { color: "rgba(15,23,42,0.55)" },
        boxpoints: false,
        orientation: "h",
      },
    ],
    layout,
    { responsive: true }
  );
}

function renderTimelapseChart(rows) {
  if (rows.length === 0) {
    renderEmptyPlot("timelapse-chart", "Timelapse Ranking View");
    return;
  }

  const ranked = rows
    .slice()
    .sort((a, b) => b.percentile_quality - a.percentile_quality)
    .slice(0, 14);

  const colors = ranked.map((r) => {
    if (r["Country.Code"] === state.countryCode) return "#f97316";
    if (state.compareCodes.includes(r["Country.Code"])) return "#8b5cf6";
    return "#0ea5e9";
  });

  Plotly.react(
    "timelapse-chart",
    [
      {
        type: "bar",
        orientation: "h",
        y: ranked.map((r) => countryName(r["Country.Code"])).reverse(),
        x: ranked.map((r) => r.percentile_quality).reverse(),
        marker: { color: colors.reverse() },
        text: ranked.map((r) => fmt(r.percentile_quality, 1)).reverse(),
        textposition: "outside",
        hovertemplate: "<b>%{y}</b><br>Percentile: %{x:.1f}<extra></extra>",
      },
    ],
    {
      margin: { l: 140, r: 20, t: 12, b: 40 },
      xaxis: {
        title: "Percentile",
        range: [0, 100],
        gridcolor: "rgba(15,23,42,0.08)",
      },
      yaxis: { title: "" },
      paper_bgcolor: "rgba(0,0,0,0)",
      plot_bgcolor: "white",
      annotations: [
        {
          x: 1,
          y: 1.11,
          xref: "paper",
          yref: "paper",
          text: `Year ${state.year}`,
          showarrow: false,
          font: { size: 16, color: "#0f172a" },
        },
      ],
    },
    { responsive: true }
  );
}

function renderPeersPanel() {
  const allRowsThisYear = cache.long.filter((row) => {
    if (Number(row.Year) !== state.year) return false;
    if (state.region !== "All" && row.Region !== state.region) return false;
    if (state.incomeGroup !== "All" && row["Income.Group"] !== state.incomeGroup) return false;
    return true;
  });

  const profiles = new Map();
  for (const row of allRowsThisYear) {
    const code = row["Country.Code"];
    if (!profiles.has(code)) {
      profiles.set(code, {
        code,
        profile: {},
        currentPercentile: null,
      });
    }
    const bucket = profiles.get(code);
    bucket.profile[row.indicator] = row.percentile_quality;
    if (row.indicator === state.indicator) {
      bucket.currentPercentile = row.percentile_quality;
    }
  }

  const selected = profiles.get(state.countryCode);
  if (!selected) {
    els.peersTable.innerHTML = "<p>No peer profile data for selected filters/year.</p>";
    return;
  }

  const selectedCurrent = selected.currentPercentile;
  const candidates = [];
  for (const item of profiles.values()) {
    if (item.code === state.countryCode) continue;
    const distanceInfo = euclideanDistance(selected.profile, item.profile);
    if (!distanceInfo || distanceInfo.overlap < 8) continue;
    if (selectedCurrent === null || item.currentPercentile === null) continue;
    const currentDelta = Math.abs(item.currentPercentile - selectedCurrent);
    if (currentDelta < 10) continue;
    const score = distanceInfo.distance - currentDelta / 8;
    candidates.push({
      code: item.code,
      distance: distanceInfo.distance,
      overlap: distanceInfo.overlap,
      currentDelta,
      percentile: item.currentPercentile,
      score,
    });
  }

  if (candidates.length === 0) {
    els.peersTable.innerHTML = "<p>No strong unexpected peers found for this year/filter combo.</p>";
    return;
  }

  candidates.sort((a, b) => a.score - b.score);
  const top = candidates.slice(0, 8);
  const lines = [];
  lines.push("<table class='peers-table'>");
  lines.push("<thead><tr><th>Country</th><th>Profile Distance</th><th>Indicator Δ Percentile</th><th>This Indicator Percentile</th><th></th></tr></thead><tbody>");
  for (const row of top) {
    lines.push(
      `<tr><td>${countryName(row.code)}</td><td>${fmt(row.distance, 2)} (${row.overlap} inds)</td><td>${fmt(row.currentDelta, 1)}</td><td>${fmt(row.percentile, 1)}</td><td><button class="peer-action-btn" data-peer-add="${row.code}">Compare</button></td></tr>`
    );
  }
  lines.push("</tbody></table>");
  els.peersTable.innerHTML = lines.join("");
}

function moversTable(rows) {
  if (!rows || rows.length === 0) {
    return "<p>No mover data.</p>";
  }
  const lines = [];
  lines.push("<table class='movers-table'>");
  lines.push("<thead><tr><th>Country</th><th>Quality Δ%</th><th>Raw Δ%</th></tr></thead><tbody>");
  for (const row of rows) {
    lines.push(
      `<tr><td>${row["Country.Name"]}</td><td>${fmt(row.quality_pct_change, 1)}</td><td>${fmt(
        row.pct_change,
        1
      )}</td></tr>`
    );
  }
  lines.push("</tbody></table>");
  return lines.join("");
}

function renderMovers() {
  const payload = cache.movers[state.indicator];
  if (!payload) {
    els.best.innerHTML = "<p>No mover data.</p>";
    els.worst.innerHTML = "<p>No mover data.</p>";
    return;
  }
  els.best.innerHTML = moversTable(payload.best);
  els.worst.innerHTML = moversTable(payload.worst);
}

function renderKpis(rows, resRows) {
  const selected = rows.find((d) => d["Country.Code"] === state.countryCode);
  const selectedResidual = resRows.find((d) => d["Country.Code"] === state.countryCode);
  const ind = indicatorMeta();

  els.kpiCount.textContent = withCommas(rows.length);
  els.kpiCoverage.textContent = ind ? `${fmt(ind.coverage_pct_country_year, 0)}%` : "n/a";
  els.kpiPercentile.textContent = selected ? fmt(selected.percentile_quality, 1) : "n/a";
  els.kpiResidual.textContent = selectedResidual ? fmt(selectedResidual.quality_residual_z, 2) : "n/a";

  if (rows.length === 0) {
    els.insight.textContent = "No data for this filter selection. Reset filters or change indicator/year.";
    return;
  }

  const sorted = rows.slice().sort((a, b) => b.percentile_quality - a.percentile_quality);
  const top = sorted[0];
  const compareInfo =
    state.compareCodes.length > 0
      ? ` Comparing against ${state.compareCodes.length} additional countries.`
      : "";
  const playInfo = state.isPlaying ? " Timelapse is playing year-by-year." : "";

  els.insight.textContent =
    `${state.year}: ${countryName(state.countryCode)} is at percentile ${selected ? fmt(selected.percentile_quality, 1) : "n/a"} ` +
    `for ${ind ? ind.label : "this indicator"}. Best performer in this view is ${countryName(top["Country.Code"])} ` +
    `(percentile ${fmt(top.percentile_quality, 1)}).${compareInfo}${playInfo}`;
}

function renderAll() {
  const longRows = filteredLongRows();
  const residualRows = filteredResidualRows();
  renderMap(longRows);
  renderScatter(residualRows);
  renderTrend();
  renderDistribution(longRows);
  renderTimelapseChart(longRows);
  renderPeersPanel();
  renderMovers();
  renderKpis(longRows, residualRows);
}

async function bootstrap() {
  try {
    await loadData();
    initControls();
    renderAll();
  } catch (err) {
    console.error(err);
    stopTimelapse();
    els.insight.textContent = "Failed to load data. Check browser console for details.";
    renderEmptyPlot("map-chart", "Global Percentile Map");
    renderEmptyPlot("scatter-chart", "Wealth vs. Outcomes (Adjusted)");
    renderEmptyPlot("trend-chart", "Country Trajectory vs. Global Median");
    renderEmptyPlot("distribution-chart", "Distribution at Selected Year");
    renderEmptyPlot("timelapse-chart", "Timelapse Ranking View");
    els.peersTable.innerHTML = "<p>Unable to load peer analysis data.</p>";
  }
}

window.addEventListener("beforeunload", () => {
  stopTimelapse();
});

bootstrap();
