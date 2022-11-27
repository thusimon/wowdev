import * as d3 from 'd3';
import { getSimpleDate } from '../utils/date';
import { filterDataByRange } from '../utils/token';

class Slider {
  size?: number[];
  x?: d3.ScaleTime<number, number, never>;
  svg?: d3.Selection<SVGGElement, any, null, undefined>;
  g?: d3.Selection<SVGGElement, any, null, undefined>;
  labelL?: d3.Selection<SVGTextElement, any, null, undefined>;
  labelR?: d3.Selection<SVGTextElement, any, null, undefined>;
  brush?: d3.BrushBehavior<unknown>;
  gBrush?: d3.Selection<SVGGElement, any, null, undefined>;
  handle?: d3.Selection<SVGPathElement, { type: string; }, SVGGElement, any>;
  selection?: d3.Selection<d3.BaseType, unknown, SVGGElement, any>;
  constructor(parentSVG: d3.Selection<SVGGElement, any, null, undefined>, range: Iterable<Date | d3.NumberValue>, size: number[], vis: any) {
    const sd = this;
    // set width and height of svg
    sd.size = size;

    // dimensions of slider bar
    const [width, height] = size;

    // create x scale
    sd.x = d3.scaleTime()
      .domain(range)  // data space
      .range([0, width]);  // display space

    // create svg and translated g
    sd.svg = parentSVG;
    sd.g = sd.svg.append('g');
    
    // labels
    sd.labelL = sd.g.append('text')
      .attr('id', 'label-left')
      .attr('x', 0)
      .attr('y', height + 15)
      .attr('text-anchor', 'middle')  

    sd.labelR = sd.g.append('text')
      .attr('id', 'label-right')
      .attr('x', 0)
      .attr('y', height - 35)
      .attr('text-anchor', 'middle')  

    const brushResizePath = (d: any) => {
      const e = +(d.type === 'e'),
        x = e ? 1 : -1,
        y = height / 2;
      return 'M' + (.5 * x) + ',' + y + 'A6,6 0 0 ' + e + ' ' + (6.5 * x) + ',' + (y + 6) + 'V' + (2 * y - 6) +
        'A6,6 0 0 ' + e + ' ' + (.5 * x) + ',' + (2 * y) + 'ZM' + (2.5 * x) + ',' + (y + 8) + 'V' + (2 * y - 8) +
        'M' + (4.5 * x) + ',' + (y + 8) + 'V' + (2 * y - 8);
    }

    // define brush
    sd.brush = d3.brushX()
      .extent([[0,0], [width, height]])
      .on('start brush end', function(evt) {
        const s = evt.selection;
        const leftValue = sd.x!.invert(s[0]);
        const rightValue = sd.x!.invert(s[1]);
        // update and move labels
        if (s[1] - s[0] < 1) {
          s[0] = s[1] - 1; // prevent null selection
          d3.select(this).call(sd.brush!.move, [s[0], s[1]]);
        }
        sd.labelL!.attr('x', s[0])
          .text(getSimpleDate(leftValue));
        sd.labelR!.attr('x', s[1])
          .text(getSimpleDate(rightValue));
        // move brush handles      
        sd.handle!.attr('display', null).attr('transform', (d, i) => { 
          return `translate(${s[i]}, ${- height / 4})`; 
        });
        // update view
        // if the view should only be updated after brushing is over, 
        // move these two lines into the on('end') part below
        sd.svg!.node()!.nodeValue = s.map((d: any) => {
          const temp = sd.x!.invert(d);
          return +temp
        });
        sd.svg!.node()!.dispatchEvent(new CustomEvent('input'));

        // update chart
        const data = filterDataByRange(vis.originalData, [leftValue.getTime(), rightValue.getTime()]);
        vis.updateChart(data);
      });

    // append brush to g
    sd.gBrush = sd.g.append('g')
      .attr('class', 'brush')
      .call(sd.brush);

    sd.handle = sd.gBrush.selectAll('.handle--custom')
      .data([{type: 'w'}, {type: 'e'}])
      .enter().append('path')
      .attr('class', 'handle--custom')
      .attr('stroke', '#000')
      .attr('fill', '#eee')
      .attr('cursor', 'ew-resize')
      .attr('d', brushResizePath);

    sd.selection = sd.gBrush.selectAll('.selection')
      .attr('stroke', '#eee');

    // override default behaviour - clicking outside of the selected area 
    // will select a small piece there rather than deselecting everything
    sd.gBrush.selectAll('.overlay')
      .each((d: any) => { 
        d.type = 'selection'; 
      });
    
    // select entire range
    this.updateValue(range);
  }

  updateValue(range: any) {
    const sd = this;
    sd.gBrush!.call(sd.brush!.move, range.map(sd.x));
  }

}

export default Slider;