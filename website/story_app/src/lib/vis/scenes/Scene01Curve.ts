import * as d3 from 'd3';
import { renderAnnotations } from '$lib/vis/annotations';
import { clamp } from '$lib/vis/transitions';
import { buildRegression, createLayout, drawBaseFrame, residualColorScale, sceneDuration } from './sceneShared';
import type { SceneContext, SceneModule, SceneRuntimeState } from '$lib/vis/types';

/**
 * Scene 01 — The curve mechanism.
 * Staged reveal: axis frame → point cloud → regression line → distribution strip → annotations.
 * Teaches above/below line meaning before any specific country is called out.
 */
export function createScene01Mechanism(): SceneModule {
  let g: d3.Selection<SVGGElement, unknown, null, undefined>;
  let axisGroup: d3.Selection<SVGGElement, unknown, null, undefined>;
  let pointsLayer: d3.Selection<SVGGElement, unknown, null, undefined>;
  let linePath: d3.Selection<SVGPathElement, unknown, null, undefined>;
  let distLayer: d3.Selection<SVGGElement, unknown, null, undefined>;
  let annotationLayer: d3.Selection<SVGGElement, unknown, null, undefined>;
  let width = 0;
  let height = 0;

  return {
    id: 'scene01_mechanism',
    init(ctx: SceneContext) {
      width = ctx.width;
      height = ctx.height;
      const layout = createLayout(ctx);
      const { margin, chartW, chartH, x, y, xExtent } = layout;

      g = ctx.rootLayer.append('g').attr('class', 'scene scene01').attr('opacity', 0);

      // Phase 1: Axis frame
      axisGroup = g.append('g').attr('class', 'axis-frame').attr('opacity', 0);
      drawBaseFrame(axisGroup, layout, { title: '2010: expectation line and distance' });

      const color = residualColorScale();

      // Phase 2: Point cloud
      pointsLayer = g.append('g').attr('class', 'points').attr('opacity', 0);
      pointsLayer
        .selectAll('circle')
        .data(ctx.data.points)
        .enter()
        .append('circle')
        .attr('cx', (d) => x(d.gni_percap))
        .attr('cy', (d) => y(d.life_exp))
        .attr('r', 3.6)
        .attr('fill', (d) => color(d.residual_z))
        .attr('fill-opacity', 0.84)
        .attr('stroke', '#2a1232')
        .attr('stroke-width', 0.7);

      // Phase 3: Regression line
      const linePts = buildRegression(ctx.data.model.slope, ctx.data.model.intercept, xExtent[0], xExtent[1]);
      linePath = g
        .append('path')
        .datum(linePts)
        .attr('fill', 'none')
        .attr('stroke', '#f4e8f7')
        .attr('stroke-width', 2)
        .attr('stroke-dasharray', '5 4')
        .attr('opacity', 0)
        .attr('d', d3.line<[number, number]>().x((d) => x(d[0])).y((d) => y(d[1])));

      // Phase 4: Distribution strip
      distLayer = g.append('g').attr('class', 'distribution').attr('opacity', 0);

      const stripY = margin.top + chartH + 24;
      const stripX0 = margin.left;
      const stripX1 = margin.left + chartW;
      const d2010 = ctx.data.distribution.find((d) => d.year === ctx.data.year_anchor) ?? ctx.data.distribution[0];

      const distScale = d3
        .scaleLinear()
        .domain([
          d3.min(ctx.data.distribution, (d) => d.max_neg_gap) ?? -18,
          d3.max(ctx.data.distribution, (d) => d.max_pos_gap) ?? 11
        ])
        .range([stripX0, stripX1]);

      distLayer.append('line').attr('x1', stripX0).attr('x2', stripX1).attr('y1', stripY).attr('y2', stripY).attr('stroke', '#704a7d');
      distLayer.append('circle').attr('cx', distScale(d2010.median_abs_gap)).attr('cy', stripY).attr('r', 5).attr('fill', '#76d443');
      distLayer.append('circle').attr('cx', distScale(d2010.p90_abs_gap)).attr('cy', stripY).attr('r', 5).attr('fill', '#ff32c8');

      distLayer.append('text').attr('x', stripX0).attr('y', stripY + 18)
        .style('font-size', '10px').style('font-family', 'var(--font-ui)').attr('fill', '#c5add0')
        .text(`Median abs gap: ${d2010.median_abs_gap.toFixed(1)} years`);

      distLayer.append('text').attr('x', stripX1).attr('y', stripY + 18).attr('text-anchor', 'end')
        .style('font-size', '10px').style('font-family', 'var(--font-ui)').attr('fill', '#c5add0')
        .text(`P90 abs gap: ${d2010.p90_abs_gap.toFixed(1)} years`);

      annotationLayer = g.append('g').attr('class', 'annotations').attr('opacity', 0);
    },
    enter(state: SceneRuntimeState) {
      g.transition().duration(sceneDuration(260)).attr('opacity', 1);
      renderAnnotations(annotationLayer, state.beat.annotations, width, height);
    },
    update(state: SceneRuntimeState) {
      const p = clamp(state.progress);
      const dur = sceneDuration(180);

      // Staged reveal choreography
      axisGroup.transition().duration(dur).attr('opacity', clamp(p * 4));
      pointsLayer.transition().duration(dur).attr('opacity', clamp((p - 0.1) * 3));
      linePath.transition().duration(dur).attr('opacity', clamp((p - 0.25) * 3));
      distLayer.transition().duration(dur).attr('opacity', clamp((p - 0.4) * 3));
      annotationLayer.transition().duration(dur).attr('opacity', clamp((p - 0.55) * 3));
    },
    exit(state: SceneRuntimeState) {
      g.transition().duration(sceneDuration(220)).attr('opacity', 0);
      annotationLayer.attr('opacity', 0);
      renderAnnotations(annotationLayer, state.beat.annotations, width, height);
    },
    destroy() {
      g.remove();
    }
  };
}
