import * as d3 from 'd3';
import { renderAnnotations } from '$lib/vis/annotations';
import { clamp, yearFromProgress } from '$lib/vis/transitions';
import { buildRegression, createLayout, drawBaseFrame, residualColorScale, sceneDuration } from './sceneShared';
import type { SceneContext, SceneModule, SceneRuntimeState } from '$lib/vis/types';

interface CachedState {
  yearPoints: Map<number, any[]>;
  distByYear: Map<number, any>;
  x: d3.ScaleLogarithmic<number, number>;
  y: d3.ScaleLinear<number, number>;
  distScale: d3.ScaleLinear<number, number>;
}

/**
 * Scene 06 — Compression.
 * Year scrub 2006→2015 with distribution compression updates.
 * Points morph positions per year; distribution strip updates in sync.
 */
export function createScene06Compression(): SceneModule {
  let g: d3.Selection<SVGGElement, unknown, null, undefined>;
  let pointsLayer: d3.Selection<SVGGElement, unknown, null, undefined>;
  let distLayer: d3.Selection<SVGGElement, unknown, null, undefined>;
  let annotationLayer: d3.Selection<SVGGElement, unknown, null, undefined>;
  let yearLabel: d3.Selection<SVGTextElement, unknown, null, undefined>;
  let medianDot: d3.Selection<SVGCircleElement, unknown, null, undefined>;
  let p90Dot: d3.Selection<SVGCircleElement, unknown, null, undefined>;
  let medianText: d3.Selection<SVGTextElement, unknown, null, undefined>;
  let p90Text: d3.Selection<SVGTextElement, unknown, null, undefined>;
  let cache: CachedState;
  let lastAppliedYear = -1;
  let width = 0;
  let height = 0;

  function applyYear(year: number) {
    if (year === lastAppliedYear) return;
    lastAppliedYear = year;

    const row = cache.yearPoints.get(year);
    if (row) {
      const color = residualColorScale();
      const dur = sceneDuration(180);
      pointsLayer
        .selectAll<SVGCircleElement, any>('circle.point')
        .data(row, (d: any) => d.code)
        .join('circle')
        .attr('class', 'point')
        .transition()
        .duration(dur)
        .attr('cx', (d: any) => cache.x(d.gni_percap))
        .attr('cy', (d: any) => cache.y(d.life_exp))
        .attr('r', 3.2)
        .attr('fill', (d: any) => color(d.residual_z))
        .attr('fill-opacity', 0.8)
        .attr('stroke', '#1b001f')
        .attr('stroke-width', 0.6);
    }

    const dist = cache.distByYear.get(year);
    if (dist) {
      const dur = sceneDuration(180);
      medianDot.transition().duration(dur).attr('cx', cache.distScale(dist.median_abs_gap));
      p90Dot.transition().duration(dur).attr('cx', cache.distScale(dist.p90_abs_gap));
      medianText.text(`Median abs gap: ${dist.median_abs_gap.toFixed(1)} years`);
      p90Text.text(`P90 abs gap: ${dist.p90_abs_gap.toFixed(1)} years`);
    }

    yearLabel.text(String(year));
  }

  return {
    id: 'scene06_compression',
    init(ctx: SceneContext) {
      width = ctx.width;
      height = ctx.height;
      const layout = createLayout(ctx);
      const { margin, chartW, chartH, x, y, xExtent } = layout;

      g = ctx.rootLayer.append('g').attr('class', 'scene scene06').attr('opacity', 0);
      drawBaseFrame(g, layout, { title: 'Global compression from 2006 to 2015' });

      const linePts = buildRegression(ctx.data.model.slope, ctx.data.model.intercept, xExtent[0], xExtent[1]);
      g.append('path')
        .datum(linePts).attr('fill', 'none').attr('stroke', '#f4e8f7').attr('stroke-width', 2)
        .attr('stroke-dasharray', '5 4').attr('opacity', 0.9)
        .attr('d', d3.line<[number, number]>().x((d) => x(d[0])).y((d) => y(d[1])));

      pointsLayer = g.append('g').attr('class', 'points-layer').attr('opacity', 1);

      distLayer = g.append('g').attr('class', 'dist-layer').attr('opacity', 1);
      const stripY = margin.top + chartH + 24;
      const stripX0 = margin.left;
      const stripX1 = margin.left + chartW;

      const distScale = d3.scaleLinear()
        .domain([
          d3.min(ctx.data.distribution, (d) => d.max_neg_gap) ?? -18,
          d3.max(ctx.data.distribution, (d) => d.max_pos_gap) ?? 11
        ])
        .range([stripX0, stripX1]);

      distLayer.append('line')
        .attr('x1', stripX0).attr('x2', stripX1).attr('y1', stripY).attr('y2', stripY).attr('stroke', '#704a7d');

      medianDot = distLayer.append('circle').attr('cy', stripY).attr('r', 5).attr('fill', '#76d443');
      p90Dot = distLayer.append('circle').attr('cy', stripY).attr('r', 5).attr('fill', '#ff32c8');

      medianText = distLayer.append('text')
        .attr('x', stripX0).attr('y', stripY + 18)
        .style('font-size', '10px').style('font-family', 'var(--font-ui)').attr('fill', '#c5add0');

      p90Text = distLayer.append('text')
        .attr('x', stripX1).attr('y', stripY + 18).attr('text-anchor', 'end')
        .style('font-size', '10px').style('font-family', 'var(--font-ui)').attr('fill', '#c5add0');

      yearLabel = g.append('text')
        .attr('x', margin.left + chartW - 8).attr('y', margin.top + 22).attr('text-anchor', 'end')
        .style('font-size', '22px').style('font-family', 'var(--font-mono)').attr('fill', '#f0d7f5');

      annotationLayer = g.append('g').attr('class', 'annotations').attr('opacity', 0);

      cache = {
        yearPoints: new Map(ctx.data.year_points.map((row) => [row.year, row.points])),
        distByYear: new Map(ctx.data.distribution.map((row) => [row.year, row])),
        x, y, distScale
      };

      lastAppliedYear = -1;
      applyYear(2006);
    },
    enter(state: SceneRuntimeState) {
      g.transition().duration(sceneDuration(260)).attr('opacity', 1);
      renderAnnotations(annotationLayer, state.beat.annotations, width, height);
    },
    update(state: SceneRuntimeState) {
      const p = clamp(state.progress);
      applyYear(yearFromProgress(2006, 2015, p));
      annotationLayer.transition().duration(sceneDuration(160)).attr('opacity', clamp((p - 0.35) * 3));
    },
    exit(state: SceneRuntimeState) {
      g.transition().duration(sceneDuration(220)).attr('opacity', 0);
      annotationLayer.attr('opacity', 0);
      renderAnnotations(annotationLayer, state.beat.annotations, width, height);
      lastAppliedYear = -1;
    },
    destroy() {
      g.remove();
    }
  };
}
