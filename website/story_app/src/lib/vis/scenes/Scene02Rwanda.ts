import * as d3 from 'd3';
import { renderAnnotations } from '$lib/vis/annotations';
import { clamp } from '$lib/vis/transitions';
import { buildRegression, createLayout, drawBaseFrame, sceneDuration } from './sceneShared';
import type { CountrySeriesPoint, SceneContext, SceneModule, SceneRuntimeState } from '$lib/vis/types';

/**
 * Scene 02 — Rwanda trajectory.
 * Timed 98.3 pause → 42.0 reveal → trajectory path over fixed regression line.
 * Progress windows: [0, 0.35] hold on 2006/98.3, [0.35, 0.7] animate path, [0.7, 1] settle at 2015/42.0.
 */
export function createScene02Rwanda(): SceneModule {
  let g: d3.Selection<SVGGElement, unknown, null, undefined>;
  let pathLayer: d3.Selection<SVGGElement, unknown, null, undefined>;
  let annotationLayer: d3.Selection<SVGGElement, unknown, null, undefined>;
  let cardLayer: d3.Selection<SVGGElement, unknown, null, undefined>;
  let cardYearText: d3.Selection<SVGTextElement, unknown, null, undefined>;
  let cardValueText: d3.Selection<SVGTextElement, unknown, null, undefined>;
  let path: d3.Selection<SVGPathElement, CountrySeriesPoint[], null, undefined>;
  let pathLength = 0;
  let width = 0;
  let height = 0;

  return {
    id: 'scene02_rwanda',
    init(ctx: SceneContext) {
      width = ctx.width;
      height = ctx.height;
      const layout = createLayout(ctx);
      const { margin, x, y, xExtent } = layout;
      g = ctx.rootLayer.append('g').attr('class', 'scene scene02').attr('opacity', 0);
      drawBaseFrame(g, layout, { title: 'Rwanda trajectory against expectation' });

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
        .attr('opacity', 0.5);

      const rwandaSeries =
        ctx.data.country_series.find((s) => s.code === 'RWA' && s.metric === 'life_exp_path')?.values ?? [];

      pathLayer = g.append('g').attr('class', 'rwanda-path');
      path = pathLayer
        .append('path')
        .datum(rwandaSeries)
        .attr('fill', 'none')
        .attr('stroke', '#76d443')
        .attr('stroke-width', 3)
        .attr('d', d3.line<CountrySeriesPoint>().x((d) => x(d.gni_percap ?? 1)).y((d) => y(d.value)));

      const node = path.node();
      pathLength = node?.getTotalLength() ?? 0;
      path.attr('stroke-dasharray', pathLength).attr('stroke-dashoffset', pathLength);

      pathLayer
        .selectAll('circle.year-dot')
        .data(rwandaSeries.filter((d) => d.year === 2006 || d.year === 2010 || d.year === 2015))
        .enter()
        .append('circle')
        .attr('class', 'year-dot')
        .attr('cx', (d) => x(d.gni_percap ?? 1))
        .attr('cy', (d) => y(d.value))
        .attr('r', 4.6)
        .attr('fill', '#76d443')
        .attr('stroke', '#0f0013')
        .attr('stroke-width', 1.3)
        .attr('opacity', 0);

      cardLayer = g.append('g').attr('class', 'rwanda-card');
      cardLayer
        .append('rect')
        .attr('x', margin.left + 16)
        .attr('y', margin.top + 16)
        .attr('width', 270)
        .attr('height', 96)
        .attr('rx', 10)
        .attr('fill', 'rgba(40, 16, 50, 0.92)')
        .attr('stroke', '#6f4d7a');

      cardLayer.append('text')
        .attr('x', margin.left + 30).attr('y', margin.top + 40)
        .style('font-size', '11px').style('font-family', 'var(--font-ui)')
        .attr('fill', '#c9b4d3')
        .text('Rwanda under-5 mortality');

      cardYearText = cardLayer.append('text')
        .attr('x', margin.left + 30).attr('y', margin.top + 66)
        .style('font-size', '16px').style('font-family', 'var(--font-ui)').style('font-weight', '700')
        .attr('fill', '#f0e4f5');

      cardValueText = cardLayer.append('text')
        .attr('x', margin.left + 30).attr('y', margin.top + 92)
        .style('font-size', '24px').style('font-family', 'var(--font-ui)').style('font-weight', '700')
        .attr('fill', '#76d443');

      annotationLayer = g.append('g').attr('class', 'annotations').attr('opacity', 0);
    },
    enter(state: SceneRuntimeState) {
      g.transition().duration(sceneDuration(260)).attr('opacity', 1);
      renderAnnotations(annotationLayer, state.beat.annotations, width, height);
    },
    update(state: SceneRuntimeState) {
      const p = clamp(state.progress);

      // Phase 1: Hold at 2006/98.3 [0, 0.35]
      // Phase 2: Animate path [0.35, 0.7]
      // Phase 3: Settle at 2015/42.0 [0.7, 1]
      const pathProgress = clamp((p - 0.35) / 0.35);
      path.attr('stroke-dashoffset', pathLength * (1 - pathProgress));
      pathLayer.selectAll('circle.year-dot').attr('opacity', clamp((p - 0.3) * 3));

      const showEnd = p >= 0.55;
      cardYearText.text(showEnd ? '2015' : '2006');
      cardValueText.text(showEnd ? '42.0 per 1,000' : '98.3 per 1,000');

      annotationLayer.transition().duration(sceneDuration(150)).attr('opacity', clamp((p - 0.6) * 3));
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
