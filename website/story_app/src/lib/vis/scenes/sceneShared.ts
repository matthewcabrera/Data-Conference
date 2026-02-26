import * as d3 from 'd3';
import type { SceneContext } from '$lib/vis/types';

export interface SceneLayout {
  margin: { top: number; right: number; bottom: number; left: number };
  chartW: number;
  chartH: number;
  x: d3.ScaleLogarithmic<number, number>;
  y: d3.ScaleLinear<number, number>;
  xExtent: [number, number];
  yExtent: [number, number];
}

export function createLayout(ctx: SceneContext, margin = { top: 30, right: 28, bottom: 82, left: 72 }): SceneLayout {
  const chartW = ctx.width - margin.left - margin.right;
  const chartH = ctx.height - margin.top - margin.bottom;

  const xExtent = d3.extent(ctx.data.points, (d) => d.gni_percap) as [number, number];
  const yExtent = d3.extent(ctx.data.points, (d) => d.life_exp) as [number, number];

  const x = d3.scaleLog().domain(xExtent).range([margin.left, margin.left + chartW]).nice();
  const y = d3
    .scaleLinear()
    .domain([Math.floor(yExtent[0] - 1), Math.ceil(yExtent[1] + 1)])
    .range([margin.top + chartH, margin.top]);

  return { margin, chartW, chartH, x, y, xExtent, yExtent };
}

export function drawBaseFrame(
  g: d3.Selection<SVGGElement, unknown, null, undefined>,
  layout: SceneLayout,
  opts?: { title?: string; hideAxisTitles?: boolean }
) {
  const { margin, chartW, chartH, x, y } = layout;

  g.append('rect')
    .attr('x', margin.left)
    .attr('y', margin.top)
    .attr('width', chartW)
    .attr('height', chartH)
    .attr('fill', '#19001e')
    .attr('stroke', '#4a2b53');

  g.append('g')
    .attr('class', 'y-grid')
    .attr('transform', `translate(${margin.left}, 0)`)
    .call(
      d3
        .axisLeft(y)
        .ticks(6)
        .tickSize(-chartW)
        .tickFormat(() => '')
    )
    .call((sel) => sel.selectAll('path').remove())
    .call((sel) => sel.selectAll('line').style('stroke', '#3d2943').style('stroke-opacity', 0.78));

  g.append('g')
    .attr('class', 'axis axis-x')
    .attr('transform', `translate(0, ${margin.top + chartH})`)
    .call(d3.axisBottom(x).ticks(6, '~s'))
    .call((sel) => sel.selectAll('text').style('font-size', '10px').style('fill', '#b79cc3').style('font-family', 'var(--font-ui)'))
    .call((sel) => sel.selectAll('path,line').style('stroke', '#5b3f66'));

  g.append('g')
    .attr('class', 'axis axis-y')
    .attr('transform', `translate(${margin.left}, 0)`)
    .call(d3.axisLeft(y).ticks(6))
    .call((sel) => sel.selectAll('text').style('font-size', '10px').style('fill', '#b79cc3').style('font-family', 'var(--font-ui)'))
    .call((sel) => sel.selectAll('path,line').style('stroke', '#5b3f66'));

  if (opts?.title) {
    g.append('text')
      .attr('x', margin.left)
      .attr('y', margin.top - 10)
      .attr('fill', '#d7c2df')
      .style('font-size', '11px')
      .style('font-family', 'var(--font-ui)')
      .style('letter-spacing', '0.04em')
      .text(opts.title.toUpperCase());
  }

  if (!opts?.hideAxisTitles) {
    g.append('text')
      .attr('x', margin.left + chartW / 2)
      .attr('y', margin.top + chartH + 36)
      .attr('text-anchor', 'middle')
      .attr('fill', '#ad90bc')
      .style('font-size', '10px')
      .style('font-family', 'var(--font-ui)')
      .text('GNI per capita (log scale)');

    g.append('text')
      .attr('x', 14)
      .attr('y', margin.top + chartH / 2)
      .attr('transform', `rotate(-90, 14, ${margin.top + chartH / 2})`)
      .attr('text-anchor', 'middle')
      .attr('fill', '#ad90bc')
      .style('font-size', '10px')
      .style('font-family', 'var(--font-ui)')
      .text('Life expectancy (years)');
  }
}

export function buildRegression(slope: number, intercept: number, xMin: number, xMax: number): [number, number][] {
  const steps = 75;
  return Array.from({ length: steps }, (_, i) => {
    const t = i / (steps - 1);
    const x = xMin * Math.pow(xMax / xMin, t);
    const y = slope * Math.log10(x) + intercept;
    return [x, y];
  });
}

export function residualColorScale() {
  return d3.scaleDiverging([-2.5, 0, 2.5], d3.interpolatePiYG);
}

export function sceneDuration(ms: number): number {
  if (typeof window !== 'undefined' && window.matchMedia?.('(prefers-reduced-motion: reduce)').matches) {
    return 0;
  }
  return ms;
}
