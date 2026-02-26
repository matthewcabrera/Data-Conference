import * as d3 from 'd3';
import type { AnnotationSpec } from './types';

export function renderAnnotations(
  layer: d3.Selection<SVGGElement, unknown, null, undefined>,
  annotations: AnnotationSpec[],
  width: number,
  height: number
) {
  const join = layer
    .selectAll<SVGGElement, AnnotationSpec>('g.annotation')
    .data(annotations, (d: any) => d.id)
    .join((enter) => {
      const g = enter.append('g').attr('class', 'annotation');
      g.append('line').attr('class', 'annotation-line');
      g.append('rect').attr('class', 'annotation-bg');
      g.append('text').attr('class', 'annotation-text');
      return g;
    });

  join.each(function draw(d) {
    const x = d.x * width;
    const y = d.y * height;
    const dx = (d.dx ?? 0) * width;
    const dy = (d.dy ?? 0) * height;

    const g = d3.select<SVGGElement, AnnotationSpec>(this as SVGGElement);
    g.select<SVGLineElement>('line')
      .attr('x1', x)
      .attr('y1', y)
      .attr('x2', x + dx)
      .attr('y2', y + dy)
      .attr('stroke', '#9f88aa')
      .attr('stroke-width', 1.1)
      .attr('stroke-dasharray', '2 2');

    const text = g
      .select<SVGTextElement>('text')
      .attr('x', x + dx + 6)
      .attr('y', y + dy)
      .attr('dominant-baseline', 'middle')
      .attr('text-anchor', d.anchor ?? 'start')
      .attr('fill', '#f0e3f4')
      .style('font-size', '12px')
      .style('font-weight', '500')
      .style('font-family', 'var(--font-ui)')
      .text(d.text);

    const box = text.node()?.getBBox();
    if (box) {
      g.select<SVGRectElement>('rect')
        .attr('x', box.x - 6)
        .attr('y', box.y - 4)
        .attr('width', box.width + 12)
        .attr('height', box.height + 8)
        .attr('rx', 5)
        .attr('fill', 'rgba(44, 20, 54, 0.92)')
        .attr('stroke', '#765282')
        .attr('stroke-width', 1);
    }
  });
}
