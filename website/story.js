const DATA_PATH = "data/story_life_expectancy.json";

const els = {
  thesis: document.getElementById("thesis-text"),
  kpiCountryCount: document.getElementById("kpi-country-count"),
  kpiR2: document.getElementById("kpi-r2"),
  kpiUsaRank: document.getElementById("kpi-usa-rank"),
  chapterSteps: document.getElementById("chapter-steps"),
  figureTitle: document.getElementById("figure-title"),
  figureCaption: document.getElementById("figure-caption"),
  detailList: document.getElementById("detail-list"),
};

const chartId = "story-chart";
let story = null;
let activeIndex = -1;

function fmt(value, digits = 2) {
  if (value === null || value === undefined || Number.isNaN(value)) return "n/a";
  return Number(value).toFixed(digits);
}

function comma(value) {
  if (value === null || value === undefined || Number.isNaN(value)) return "n/a";
  return Number(value).toLocaleString();
}

function buildChapterSteps() {
  els.chapterSteps.innerHTML = "";
  story.chapters.forEach((chapter, index) => {
    const article = document.createElement("article");
    article.className = "chapter-step";
    article.dataset.index = String(index);
    article.innerHTML = `
      <p class="chapter-label">${chapter.label}</p>
      <h4>${chapter.title}</h4>
      <p>${chapter.body}</p>
    `;
    els.chapterSteps.appendChild(article);
  });
}

function renderSummary() {
  const summary = story.summary;
  els.thesis.textContent = story.story_meta.thesis;
  els.kpiCountryCount.textContent = comma(summary.country_count);
  els.kpiR2.textContent = fmt(summary.model_r2, 2);
  els.kpiUsaRank.textContent = summary.usa_rank_text;
}

function regressionLine(model, points) {
  const incomes = points.map((row) => row.gni_percap).sort((a, b) => a - b);
  const min = incomes[0];
  const max = incomes[incomes.length - 1];
  const lineX = [];
  const lineY = [];

  const steps = 60;
  for (let i = 0; i < steps; i += 1) {
    const t = i / (steps - 1);
    const x = min * Math.pow(max / min, t);
    lineX.push(x);
    lineY.push(model.slope * Math.log10(x) + model.intercept);
  }
  return { lineX, lineY };
}

function scatterLayout(title) {
  return {
    title: {
      text: title,
      font: { size: 17, family: "Manrope, sans-serif", color: "#0d1b2a" },
      x: 0.01,
      y: 0.99,
    },
    margin: { l: 70, r: 24, t: 52, b: 58 },
    xaxis: {
      type: "log",
      title: "GNI per capita (USD, log scale)",
      tickprefix: "$",
      gridcolor: "rgba(13,27,42,0.08)",
      zeroline: false,
    },
    yaxis: {
      title: "Life expectancy (years)",
      gridcolor: "rgba(13,27,42,0.08)",
      zeroline: false,
    },
    plot_bgcolor: "rgba(255,255,255,0.94)",
    paper_bgcolor: "rgba(0,0,0,0)",
    hoverlabel: { bgcolor: "#ffffff" },
    showlegend: true,
    legend: { orientation: "h", y: -0.2, x: 0 },
  };
}

function scatterTraceBase(points, mode = "colored") {
  if (mode === "colored") {
    return {
      type: "scattergl",
      mode: "markers",
      name: "Countries",
      x: points.map((row) => row.gni_percap),
      y: points.map((row) => row.value),
      text: points.map((row) => row.name),
      marker: {
        size: 9,
        color: points.map((row) => row.z),
        cmin: -2.5,
        cmax: 2.5,
        colorscale: [
          [0.0, "#b91c1c"],
          [0.5, "#f8fafc"],
          [1.0, "#15803d"],
        ],
        line: { width: 0.4, color: "rgba(13,27,42,0.25)" },
        colorbar: {
          title: "Residual z",
          thickness: 10,
          x: 1.03,
        },
      },
      hovertemplate:
        "<b>%{text}</b><br>Income: $%{x:,.0f}<br>Life expectancy: %{y:.1f}<br>z: %{marker.color:.2f}<extra></extra>",
    };
  }

  return {
    type: "scattergl",
    mode: "markers",
    name: "Countries",
    x: points.map((row) => row.gni_percap),
    y: points.map((row) => row.value),
    text: points.map((row) => row.name),
    marker: {
      size: 8,
      color: "rgba(100,116,139,0.30)",
      line: { width: 0 },
    },
    hovertemplate:
      "<b>%{text}</b><br>Income: $%{x:,.0f}<br>Life expectancy: %{y:.1f}<extra></extra>",
    showlegend: false,
  };
}

function renderScatterFocus(focus) {
  const points = story.points;
  const model = story.model;
  const { lineX, lineY } = regressionLine(model, points);
  const usa = points.find((row) => row.code === "USA");
  const peers = story.peers;

  const traces = [];
  let title = "Wealth and Life Expectancy (2010)";
  let caption = "";

  if (focus === "all") {
    traces.push(scatterTraceBase(points, "colored"));
    caption =
      "Most countries follow the wealth curve, but residual colors show that outcomes can still diverge strongly above and below expectation.";
  } else if (focus === "usa") {
    traces.push(scatterTraceBase(points, "muted"));
    traces.push({
      type: "scatter",
      mode: "markers+text",
      name: "United States",
      x: [usa.gni_percap],
      y: [usa.value],
      text: ["USA"],
      textposition: "top center",
      marker: {
        size: 16,
        color: "#b91c1c",
        line: { width: 2, color: "#ffffff" },
      },
      hovertemplate:
        "<b>United States</b><br>Income: $%{x:,.0f}<br>Life expectancy: %{y:.1f}<br>Expected: " +
        fmt(usa.predicted, 1) +
        "<extra></extra>",
    });
    caption =
      "In 2010, the U.S. point lands below the fitted expectation line for countries at a similar income level.";
  } else if (focus === "peers") {
    traces.push(scatterTraceBase(points, "muted"));
    traces.push({
      type: "scatter",
      mode: "markers",
      name: "High-income peers",
      x: peers.filter((row) => row.code !== "USA").map((row) => row.gni_percap),
      y: peers.filter((row) => row.code !== "USA").map((row) => row.value),
      text: peers.filter((row) => row.code !== "USA").map((row) => row.name),
      marker: {
        size: 12,
        color: "#0f766e",
        line: { width: 1.5, color: "#ffffff" },
      },
      hovertemplate:
        "<b>%{text}</b><br>Income: $%{x:,.0f}<br>Life expectancy: %{y:.1f}<extra></extra>",
    });
    traces.push({
      type: "scatter",
      mode: "markers+text",
      name: "United States",
      x: [usa.gni_percap],
      y: [usa.value],
      text: ["USA"],
      textposition: "top center",
      marker: {
        size: 17,
        symbol: "star",
        color: "#b91c1c",
        line: { width: 1.5, color: "#ffffff" },
      },
      hovertemplate:
        "<b>United States</b><br>Income: $%{x:,.0f}<br>Life expectancy: %{y:.1f}<extra></extra>",
    });
    caption =
      "Among similarly wealthy countries, several peers cluster above the U.S. in life expectancy.";
  } else if (focus === "outliers") {
    traces.push(scatterTraceBase(points, "muted"));
    traces.push({
      type: "scatter",
      mode: "markers+text",
      name: "Overperformers",
      x: story.best_outliers.map((row) => row.gni_percap),
      y: story.best_outliers.map((row) => row.value),
      text: story.best_outliers.map((row) => row.name),
      textposition: "top center",
      marker: {
        size: 13,
        color: "#15803d",
        line: { width: 1.2, color: "#ffffff" },
      },
      hovertemplate:
        "<b>%{text}</b><br>Income: $%{x:,.0f}<br>Life expectancy: %{y:.1f}<extra></extra>",
    });
    traces.push({
      type: "scatter",
      mode: "markers+text",
      name: "Underperformers",
      x: story.worst_outliers.map((row) => row.gni_percap),
      y: story.worst_outliers.map((row) => row.value),
      text: story.worst_outliers.map((row) => row.name),
      textposition: "bottom center",
      marker: {
        size: 13,
        color: "#b91c1c",
        line: { width: 1.2, color: "#ffffff" },
      },
      hovertemplate:
        "<b>%{text}</b><br>Income: $%{x:,.0f}<br>Life expectancy: %{y:.1f}<extra></extra>",
    });
    traces.push({
      type: "scatter",
      mode: "markers",
      name: "United States",
      x: [usa.gni_percap],
      y: [usa.value],
      marker: {
        size: 16,
        symbol: "star",
        color: "#b91c1c",
        line: { width: 1.5, color: "#ffffff" },
      },
      hovertemplate:
        "<b>United States</b><br>Income: $%{x:,.0f}<br>Life expectancy: %{y:.1f}<extra></extra>",
    });
    caption =
      "Residual outliers show countries performing much better or worse than their wealth level predicts.";
  }

  traces.push({
    type: "scatter",
    mode: "lines",
    name: "Wealth expectation",
    x: lineX,
    y: lineY,
    line: { color: "#0d1b2a", width: 2.2, dash: "dot" },
    hoverinfo: "skip",
  });

  Plotly.react(chartId, traces, scatterLayout(title), {
    responsive: true,
    displayModeBar: false,
  });
  els.figureCaption.textContent = caption;
}

function selectTrendRows() {
  const rows = story.trend_highlights.slice();
  const byDelta = rows.slice().sort((a, b) => a.delta - b.delta);
  const bottom = byDelta.slice(0, 3).map((row) => row.code);
  const top = byDelta.slice(-3).map((row) => row.code);
  const highlightSet = new Set(["USA", "JPN", "VNM", ...top, ...bottom]);
  return rows.filter((row) => highlightSet.has(row.code));
}

function renderTrendFocus() {
  const rows = selectTrendRows();
  const colorMap = {
    USA: "#b91c1c",
    JPN: "#0f766e",
    VNM: "#2563eb",
  };

  const traces = rows.map((row) => {
    const color = colorMap[row.code] || "rgba(15,23,42,0.35)";
    const width = colorMap[row.code] ? 3 : 1.8;
    return {
      type: "scatter",
      mode: "lines+markers",
      name: row.name,
      x: row.series.map((pt) => pt.year),
      y: row.series.map((pt) => pt.value),
      marker: { size: colorMap[row.code] ? 7 : 5 },
      line: { color, width },
      hovertemplate:
        "<b>" + row.name + "</b><br>Year: %{x}<br>Life expectancy: %{y:.1f}<extra></extra>",
    };
  });

  Plotly.react(
    chartId,
    traces,
    {
      title: {
        text: "Life Expectancy Trends (2006-2015)",
        font: { size: 17, family: "Manrope, sans-serif", color: "#0d1b2a" },
        x: 0.01,
      },
      margin: { l: 70, r: 24, t: 52, b: 58 },
      xaxis: {
        title: "Year",
        tickmode: "array",
        tickvals: [2006, 2008, 2010, 2012, 2014, 2015],
        gridcolor: "rgba(13,27,42,0.08)",
      },
      yaxis: {
        title: "Life expectancy (years)",
        gridcolor: "rgba(13,27,42,0.08)",
      },
      plot_bgcolor: "rgba(255,255,255,0.94)",
      paper_bgcolor: "rgba(0,0,0,0)",
      legend: { orientation: "h", y: -0.28, x: 0 },
      hoverlabel: { bgcolor: "#ffffff" },
    },
    {
      responsive: true,
      displayModeBar: false,
    }
  );

  els.figureCaption.textContent =
    "Long-run trajectories vary sharply. Improvement is possible at many income levels, but gains are uneven.";
}

function renderDetails(focus) {
  const items = [];
  if (focus === "usa") {
    items.push(
      `<strong>U.S. life expectancy:</strong> ${fmt(story.summary.usa_value, 1)} years (expected ${fmt(
        story.summary.usa_predicted,
        1
      )})`
    );
    items.push(
      `<strong>U.S. residual z:</strong> ${fmt(story.summary.usa_z, 2)} | <strong>rank:</strong> ${story.summary.usa_rank_text}`
    );
  } else if (focus === "peers") {
    story.similar_income_top.slice(0, 5).forEach((row) => {
      items.push(
        `<strong>${row.name}</strong>: ${fmt(row.value, 1)} years at $${comma(row.gni_percap)} income`
      );
    });
  } else if (focus === "outliers") {
    story.best_outliers.slice(-3).forEach((row) => {
      items.push(`<strong>Overperformer:</strong> ${row.name} (z ${fmt(row.z, 2)})`);
    });
    story.worst_outliers.slice(0, 3).forEach((row) => {
      items.push(`<strong>Underperformer:</strong> ${row.name} (z ${fmt(row.z, 2)})`);
    });
  } else if (focus === "trends") {
    selectTrendRows()
      .sort((a, b) => b.delta - a.delta)
      .slice(0, 6)
      .forEach((row) => {
        const sign = row.delta >= 0 ? "+" : "";
        items.push(
          `<strong>${row.name}</strong>: ${sign}${fmt(row.delta, 1)} years (2006-2015)`
        );
      });
  } else {
    items.push(
      `<strong>Model fit:</strong> R² ${fmt(story.summary.model_r2, 2)} across ${comma(
        story.summary.country_count
      )} countries.`
    );
    items.push(
      "<strong>Interpretation:</strong> Wealth matters, but residuals show substantial room for overperformance and underperformance."
    );
  }

  els.detailList.innerHTML = items
    .map((item) => `<div class="detail-item">${item}</div>`)
    .join("");
}

function setActiveStep(index) {
  if (index === activeIndex || index < 0 || index >= story.chapters.length) return;
  activeIndex = index;

  const steps = [...document.querySelectorAll(".chapter-step")];
  steps.forEach((step, i) => step.classList.toggle("active", i === index));

  const chapter = story.chapters[index];
  els.figureTitle.textContent = chapter.title;

  if (chapter.focus === "trends") {
    renderTrendFocus();
  } else {
    renderScatterFocus(chapter.focus);
  }
  renderDetails(chapter.focus);
}

function setupScrollObserver() {
  const steps = [...document.querySelectorAll(".chapter-step")];
  const io = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting && entry.intersectionRatio >= 0.55) {
          const idx = Number(entry.target.dataset.index);
          setActiveStep(idx);
        }
      });
    },
    { threshold: [0.55, 0.75] }
  );
  steps.forEach((step) => io.observe(step));

  setActiveStep(0);
}

async function init() {
  try {
    const response = await fetch(DATA_PATH);
    if (!response.ok) throw new Error(`Failed to load ${DATA_PATH}`);
    story = await response.json();
    renderSummary();
    buildChapterSteps();
    setupScrollObserver();
  } catch (err) {
    els.figureTitle.textContent = "Unable to load chapter data";
    els.figureCaption.textContent =
      "Check that `data/story_life_expectancy.json` exists and reload the page.";
    console.error(err);
  }
}

init();

