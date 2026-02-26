import * as d3 from 'd3';
import { renderAnnotations } from '$lib/vis/annotations';
import { clamp } from '$lib/vis/transitions';
import { buildRegression, createLayout, drawBaseFrame, sceneDuration } from './sceneShared';
import type { SceneContext, SceneModule, SceneRuntimeState } from '$lib/vis/types';

/**
 * Scene 05 — Mirror case.
 * Equatorial Guinea tail distance + Sierra Leone floor annotation.
 */
export function createScene05Mirror(): SceneModule {
  let g: d3.Selection<SVGGElement, unknown, null, undefined>;
  let highlightLayer: d3.Selection<SVGGElement, unknown, null, undefined>;
  let floorLayer: d3.Selection<SVGGElement, unknown, null, undefined>;
  let annotationLayer: d3.Selection<SVGGElement, unknown, null, undefined>;
  let width = 0;
  let height = 0;

  return {
    id: 'scene05_mirror',
    init(ctx: SceneContext) {
      width = ctx.width;
      height = ctx.height;
      const layout = createLayout(ctx);
      const { margin, x, y, xExtent } = layout;
      const snaps = ctx.data.snapshots;

      g = ctx.rootLayer.append('g').attr('class', 'scene scene05').attr('opacity', 0);
      drawBaseFrame(g, layout, { title: 'Negative tail: Equatorial Guinea and Sierra Leone' });

      const linePts = buildRegression(ctx.data.model.slope, ctx.data.model.intercept, xExtent[0], xExtent[1]);
      g.append('path')
        .datum(linePts).attr('fill', 'none').attr('stroke', '#f4e8f7').attr('stroke-width', 2)
        .attr('stroke-dasharray', '5 4').attr('opacity', 0.9)
        .attr('d', d3.line<[number, number]>().x((d) => x(d[0])).y((d) => y(d[1])));

      g.selectAll('circle.base')
        .data(ctx.data.points).enter().append('circle').attr('class', 'base')
        .attr('cx', (d) => x(d.gni_percap)).attr('cy', (d) => y(d.life_exp))
        .attr('r', 3).attr('fill', '#5f3d67').attr('opacity', 0.35);

      const gnq = ctx.data.points.find((d) => d.code === 'GNQ');

      highlightLayer = g.append('g').attr('class', 'highlight-layer').attr('opacity', 0);
      if (gnq) {
        highlightLayer.append('line')
          .attr('x1', x(gnq.gni_percap)).attr('x2', x(gnq.gni_percap))
          .attr('y1', y(gnq.predicted)).attr('y2', y(gnq.life_exp))
          .attr('stroke', '#ff32c8').attr('stroke-width', 2.8).attr('stroke-dasharray', '4 3');

        highlightLayer.append('circle')
          .attr('cx', x(gnq.gni_percap)).attr('cy', y(gnq.life_exp))
          .attr('r', 6.5).attr('fill', '#ff32c8').attr('stroke', '#18001b').attr('stroke-width', 1.4);

        highlightLayer.append('text')
          .attr('x', x(gnq.gni_percap) + 8).attr('y', y(gnq.life_exp) - 8)
          .attr('fill', '#ff84df')
          .style('font-size', '11px').style('font-family', 'var(--font-ui)').style('font-weight', '600')
          .text('Equatorial Guinea');
      }

      floorLayer = g.append('g').attr('class', 'floor-layer').attr('opacity', 0);
      floorLayer.append('rect')
        .attr('x', margin.left + 16).attr('y', margin.top + 18)
        .attr('width', 360).attr('height', 76).attr('rx', 10)
        .attr('fill', 'rgba(40,16,50,0.92)').attr('stroke', '#6f4d7a');

      floorLayer.append('text')
        .attr('x', margin.left + 30).attr('y', margin.top + 46)
        .attr('fill', '#e3d2ea')
        .style('font-size', '12px').style('font-family', 'var(--font-ui)')
        .text(`Sierra Leone maternal mortality (2010): ${snaps.sle_maternal_2010.toFixed(0)} per 100,000`);

      floorLayer.append('text')
        .attr('x', margin.left + 30).attr('y', margin.top + 69)
        .attr('fill', '#ff84df')
        .style('font-size', '11px').style('font-family', 'var(--font-ui)')
        .text('Different country profile. Different income path. Same failure.');

      annotationLayer = g.append('g').attr('class', 'annotations').attr('opacity', 0);
    },
    enter(state: SceneRuntimeState) {
      g.transition().duration(sceneDuration(260)).attr('opacity', 1);
      renderAnnotations(annotationLayer, state.beat.annotations, width, height);
    },
    update(state: SceneRuntimeState) {
      const p = clamp(state.progress);
      const dur = sceneDuration(160);
      highlightLayer.transition().duration(dur).attr('opacity', clamp((p - 0.15) * 3));
      floorLayer.transition().duration(dur).attr('opacity', clamp((p - 0.45) * 3));
      annotationLayer.transition().duration(dur).attr('opacity', clamp((p - 0.4) * 3));
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
