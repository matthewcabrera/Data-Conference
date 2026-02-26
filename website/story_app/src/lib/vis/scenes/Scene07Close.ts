import * as d3 from 'd3';
import { renderAnnotations } from '$lib/vis/annotations';
import { clamp } from '$lib/vis/transitions';
import { buildRegression, createLayout, drawBaseFrame, residualColorScale, sceneDuration } from './sceneShared';
import type { SceneContext, SceneModule, SceneRuntimeState } from '$lib/vis/types';

/**
 * Scene 07 — Close.
 * Settle to full cloud with minimal annotation and no extra recap widgets.
 * The ending lands without summary cards — just the field and the line.
 */
export function createScene07Close(): SceneModule {
  let g: d3.Selection<SVGGElement, unknown, null, undefined>;
  let pointsLayer: d3.Selection<SVGGElement, unknown, null, undefined>;
  let linePath: d3.Selection<SVGPathElement, unknown, null, undefined>;
  let annotationLayer: d3.Selection<SVGGElement, unknown, null, undefined>;
  let width = 0;
  let height = 0;

  return {
    id: 'scene07_close',
    init(ctx: SceneContext) {
      width = ctx.width;
      height = ctx.height;
      const layout = createLayout(ctx);
      const { x, y, xExtent } = layout;
      const color = residualColorScale();

      g = ctx.rootLayer.append('g').attr('class', 'scene scene07').attr('opacity', 0);
      drawBaseFrame(g, layout, { title: 'Progress is governable' });

      pointsLayer = g.append('g').attr('class', 'points-layer');
      pointsLayer.selectAll('circle')
        .data(ctx.data.points).enter().append('circle')
        .attr('cx', (d) => x(d.gni_percap)).attr('cy', (d) => y(d.life_exp))
        .attr('r', 3.2)
        .attr('fill', (d) => color(d.residual_z)).attr('fill-opacity', 0.8)
        .attr('stroke', '#1b001f').attr('stroke-width', 0.6).attr('opacity', 0.9);

      const linePts = buildRegression(ctx.data.model.slope, ctx.data.model.intercept, xExtent[0], xExtent[1]);
      linePath = g.append('path')
        .datum(linePts).attr('fill', 'none').attr('stroke', '#f4e8f7').attr('stroke-width', 2)
        .attr('stroke-dasharray', '5 4').attr('opacity', 0.95)
        .attr('d', d3.line<[number, number]>().x((d) => x(d[0])).y((d) => y(d[1])));

      annotationLayer = g.append('g').attr('class', 'annotations').attr('opacity', 0);
    },
    enter(state: SceneRuntimeState) {
      g.transition().duration(sceneDuration(350)).attr('opacity', 1);
      renderAnnotations(annotationLayer, state.beat.annotations, width, height);
    },
    update(state: SceneRuntimeState) {
      const p = clamp(state.progress);
      const dur = sceneDuration(180);
      // Gentle settle — cloud brightens, line solidifies
      pointsLayer.transition().duration(dur).attr('opacity', 0.5 + 0.45 * p);
      linePath.transition().duration(dur).attr('opacity', 0.7 + 0.25 * p);
      annotationLayer.transition().duration(dur).attr('opacity', clamp((p - 0.2) * 2.5));
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
