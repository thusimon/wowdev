import * as d3 from 'd3';
import { getSimpleDate } from '../utils/date';
import { filterDataByRange } from '../utils/token';

class Slider {
  constructor(parentSVG, range, size, vis) {
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
      .attr('id', 'labelleft')
      .attr('x', 0)
      .attr('y', height + 15)
      .attr('text-anchor', 'middle')  

    sd.labelR = sd.g.append('text')
      .attr('id', 'labelright')
      .attr('x', 0)
      .attr('y', height + 15)
      .attr('text-anchor', 'middle')  

    const brushResizePath = (d) => {
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
      .on('brush', evt => {
        const s = evt.selection;
        const leftValue = sd.x.invert(s[0]);
        const rightValue = sd.x.invert(s[1]);
        // update and move labels
        sd.labelL.attr('x', s[0])
          .text(getSimpleDate(leftValue));
        sd.labelR.attr('x', s[1])
          .text(getSimpleDate(rightValue));
        // move brush handles      
        sd.handle.attr('display', null).attr('transform', (d, i) => { 
          return `translate(${s[i]}, ${- height / 4})`; 
        });
        // update view
        // if the view should only be updated after brushing is over, 
        // move these two lines into the on('end') part below
        sd.svg.node().value = s.map(d => {
          const temp = sd.x.invert(d);
          return +temp
        });
        sd.svg.node().dispatchEvent(new CustomEvent('input'));

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

    // override default behaviour - clicking outside of the selected area 
    // will select a small piece there rather than deselecting everything
    sd.gBrush.selectAll('.overlay')
      .each(d => { 
        d.type = 'selection'; 
      });
    
    // select entire range
    this.updateValue(range);
  }

  updateValue(range) {
    const sd = this;
    sd.gBrush.call(sd.brush.move, range.map(sd.x));
  }

}

export default Slider;