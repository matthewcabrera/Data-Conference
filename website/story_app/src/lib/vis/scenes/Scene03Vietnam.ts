import * as d3 from 'd3';
import { renderAnnotations } from '$lib/vis/annotations';
import { clamp } from '$lib/vis/transitions';
import { buildRegression, createLayout, drawBaseFrame, sceneDuration } from './sceneShared';
import type { SceneContext, SceneModule, SceneRuntimeState } from '$lib/vis/types';

/**
 * Scene 03 — Vietnam confirmation.
 * Dual highlight only, no new grammar. Reads as confirmation of the mechanism, not a new chapter.
 */
export function createScene03Vietnam(): SceneModule {
  let g: d3.Selection<SVGGElement, unknown, null, undefined>;
  let highlightLayer: d3.Selection<SVGGElement, unknown, null, undefined>;
  let annotationLayer: d3.Selection<SVGGElement, unknown, null, undefined>;
  let width = 0;
  let height = 0;

  return {
    id: 'scene03_vietnam',
    init(ctx: SceneContext) {
      width = ctx.width;
      height = ctx.height;
      const layout = createLayout(ctx);
      const { x, y, xExtent } = layout;

      g = ctx.rootLayer.append('g').attr('class', 'scene scene03').attr('opacity', 0);
      drawBaseFrame(g, layout, { title: 'Rwanda and Vietnam above the line' });

      const linePts = buildRegression(ctx.data.model.slope, ctx.data.model.intercept, xExtent[0], xExtent[1]);
      g.append('path')
        .datum(linePts)
        .attr('fill', 'none')
        .attr('stroke', '#f4e8f7')
        .attr('stroke-width', 2)
        .attr('stroke-dasharray', '5 4')
        .attr('opacity', 0.9)
        .attr('d', d3.line<[number, number]>().x((d) => x(d[0])).y((d) => y(d[1])));

      g.selectAll('circle.base')
        .data(ctx.data.points)
        .enter()
        .append('circle')
        .attr('class', 'base')
        .attr('cx', (d) => x(d.gni_percap))
        .attr('cy', (d) => y(d.life_exp))
        .attr('r', 3)
        .attr('fill', '#6d4b75')
        .attr('opacity', 0.44);

      const rwanda = ctx.data.points.find((d) => d.code === 'RWA');
      const vietnam = ctx.data.points.find((d) => d.code === 'VNM');

      highlightLayer = g.append('g').attr('class', 'highlights').attr('opacity', 0);

      [
        { row: rwanda, label: 'Rwanda', color: '#76d443' },
        { row: vietnam, label: 'Vietnam', color: '#9df26f' }
      ].forEach((entry, idx) => {
        if (!entry.row) return;
        const xPos = x(entry.row.gni_percap);
        const yPred = y(entry.row.predicted);
        const yActual = y(entry.row.life_exp);

        highlightLayer.append('line')
          .attr('x1', xPos).attr('x2', xPos).attr('y1', yPred).attr('y2', yActual)
          .attr('stroke', entry.color).attr('stroke-width', 2).attr('stroke-dasharray', '3 2');

        highlightLayer.append('circle')
          .attr('cx', xPos).attr('cy', yActual)
          .attr('r', idx === 1 ? 6 : 5)
          .attr('fill', entry.color).attr('stroke', '#19001e').attr('stroke-width', 1.4);

        highlightLayer.append('text')
          .attr('x', xPos + 7).attr('y', yActual - 8)
          .attr('fill', entry.color)
          .style('font-size', '11px').style('font-family', 'var(--font-ui)').style('font-weight', '600')
          .text(`${entry.label}: ${entry.row.residual_gap > 0 ? '+' : ''}${entry.row.residual_gap.toFixed(1)}y`);
      });

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
