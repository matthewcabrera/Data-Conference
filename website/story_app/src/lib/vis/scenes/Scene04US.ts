import * as d3 from 'd3';
import { renderAnnotations } from '$lib/vis/annotations';
import { clamp } from '$lib/vis/transitions';
import { buildRegression, createLayout, drawBaseFrame, sceneDuration } from './sceneShared';
import type { CountrySeriesPoint, SceneContext, SceneModule, SceneRuntimeState } from '$lib/vis/types';

/**
 * Scene 04 — US comparison arc.
 * Below-line lock, decade persistence line, multi-indicator summary panel.
 * Shows all three evidence signals: gap position, trend path, comparative data.
 */
export function createScene04US(): SceneModule {
  let g: d3.Selection<SVGGElement, unknown, null, undefined>;
  let peerLayer: d3.Selection<SVGGElement, unknown, null, undefined>;
  let usLayer: d3.Selection<SVGGElement, unknown, null, undefined>;
  let trendLayer: d3.Selection<SVGGElement, unknown, null, undefined>;
  let panelLayer: d3.Selection<SVGGElement, unknown, null, undefined>;
  let annotationLayer: d3.Selection<SVGGElement, unknown, null, undefined>;
  let path: d3.Selection<SVGPathElement, CountrySeriesPoint[], null, undefined>;
  let pathLength = 0;
  let width = 0;
  let height = 0;

  return {
    id: 'scene04_us',
    init(ctx: SceneContext) {
      width = ctx.width;
      height = ctx.height;
      const layout = createLayout(ctx);
      const { margin, x, y, xExtent } = layout;
      const snaps = ctx.data.snapshots;

      g = ctx.rootLayer.append('g').attr('class', 'scene scene04').attr('opacity', 0);
      drawBaseFrame(g, layout, { title: 'United States below expectation over a decade' });

      const linePts = buildRegression(ctx.data.model.slope, ctx.data.model.intercept, xExtent[0], xExtent[1]);
      g.append('path')
        .datum(linePts)
        .attr('fill', 'none').attr('stroke', '#f4e8f7').attr('stroke-width', 2)
        .attr('stroke-dasharray', '5 4').attr('opacity', 0.9)
        .attr('d', d3.line<[number, number]>().x((d) => x(d[0])).y((d) => y(d[1])));

      g.selectAll('circle.base')
        .data(ctx.data.points).enter().append('circle').attr('class', 'base')
        .attr('cx', (d) => x(d.gni_percap)).attr('cy', (d) => y(d.life_exp))
        .attr('r', 2.8).attr('fill', '#5f3d67').attr('opacity', 0.28);

      // Peer ring highlights
      peerLayer = g.append('g').attr('class', 'peer-layer').attr('opacity', 0);
      const peerSet = new Set(ctx.data.us_peer_codes);
      peerLayer.selectAll('circle.peer')
        .data(ctx.data.points.filter((d) => peerSet.has(d.code)))
        .enter().append('circle').attr('class', 'peer')
        .attr('cx', (d) => x(d.gni_percap)).attr('cy', (d) => y(d.life_exp))
        .attr('r', 4.8).attr('fill', 'none').attr('stroke', '#d59de6').attr('stroke-width', 1.4);

      // US dot + gap line
      usLayer = g.append('g').attr('class', 'us-layer').attr('opacity', 0);
      const usPoint = ctx.data.points.find((d) => d.code === 'USA');
      if (usPoint) {
        usLayer.append('line')
          .attr('x1', x(usPoint.gni_percap)).attr('x2', x(usPoint.gni_percap))
          .attr('y1', y(usPoint.predicted)).attr('y2', y(usPoint.life_exp))
          .attr('stroke', '#ff32c8').attr('stroke-width', 2.3).attr('stroke-dasharray', '4 3');

        usLayer.append('circle')
          .attr('cx', x(usPoint.gni_percap)).attr('cy', y(usPoint.life_exp))
          .attr('r', 6).attr('fill', '#ff32c8').attr('stroke', '#160018').attr('stroke-width', 1.4);

        usLayer.append('text')
          .attr('x', x(usPoint.gni_percap) + 9).attr('y', y(usPoint.life_exp) - 8)
          .style('font-size', '11px').style('font-family', 'var(--font-ui)').style('font-weight', '600')
          .attr('fill', '#ff7ddb').text('USA');
      }

      // Decade trend path
      trendLayer = g.append('g').attr('class', 'trend-layer').attr('opacity', 0);
      const usPath = ctx.data.country_series.find((s) => s.code === 'USA' && s.metric === 'life_exp_path')?.values ?? [];
      path = trendLayer.append('path')
        .datum(usPath).attr('fill', 'none').attr('stroke', '#ff95e6').attr('stroke-width', 2.4)
        .attr('d', d3.line<CountrySeriesPoint>().x((d) => x(d.gni_percap ?? 1)).y((d) => y(d.value)));
      pathLength = path.node()?.getTotalLength() ?? 0;
      path.attr('stroke-dasharray', pathLength).attr('stroke-dashoffset', pathLength);

      // Multi-indicator summary panel
      panelLayer = g.append('g').attr('class', 'panel-layer').attr('opacity', 0);
      panelLayer.append('rect')
        .attr('x', margin.left + 10).attr('y', margin.top + 18)
        .attr('width', 360).attr('height', 122).attr('rx', 10)
        .attr('fill', 'rgba(40,16,50,0.92)').attr('stroke', '#6f4d7a');

      const lines = [
        `US life expectancy 2010: ${snaps.usa_2010_actual.toFixed(1)} vs expected ${snaps.usa_2010_predicted.toFixed(1)}`,
        `US maternal mortality: ${snaps.usa_maternal_2006.toFixed(1)} to ${snaps.usa_maternal_2015.toFixed(1)}`,
        `Canada maternal: ${snaps.can_maternal_2006.toFixed(1)} to ${snaps.can_maternal_2015.toFixed(1)}`,
        `Peer maternal change: ${snaps.peer_maternal_pct_change.toFixed(1)}%`
      ];
      lines.forEach((line, i) => {
        panelLayer.append('text')
          .attr('x', margin.left + 24).attr('y', margin.top + 44 + i * 22)
          .style('font-size', '11px').style('font-family', 'var(--font-ui)')
          .attr('fill', '#e3d2ea').text(line);
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

      // Staged: US dot → peers → trend path → summary panel → annotations
      usLayer.transition().duration(dur).attr('opacity', clamp(p * 3));
      peerLayer.transition().duration(dur).attr('opacity', clamp((p - 0.1) * 3));
      trendLayer.transition().duration(dur).attr('opacity', clamp((p - 0.3) * 3));
      path.attr('stroke-dashoffset', pathLength * (1 - clamp((p - 0.3) / 0.35)));
      panelLayer.transition().duration(dur).attr('opacity', clamp((p - 0.5) * 3));
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
