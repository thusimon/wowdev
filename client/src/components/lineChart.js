import * as d3 from 'd3';
import Slider from './slider';
import { getLastWeekFromDate } from '../utils/date';
import { filterDataByRange } from '../utils/token';

class LineChart {
  constructor(parentElement, config) {
    this.parentElement = parentElement;
    this.config = config;
  }

  updateConfig() {
    // update the width and height
    const windowWidth = window.innerWidth;
    const windowHeight = window.innerHeight;
    this.config.svgWidth = windowWidth / 1.1;
    this.config.svgHeight = windowHeight / 1.2 > 800 ? 800 : windowHeight / 1.2;
    this.config.chartWidth = this.config.svgWidth - this.config.marginLeft - this.config.marginRight;
    this.config.chartHeight = this.config.svgHeight - this.config.marginTop - this.config.marginBottom - this.config.marginControllerHeight;
  }

  initChart(data) {
    this.updateConfig();
    const vis = this;
    vis.originalData = data;
    // create svg
    vis.svg = d3.select(vis.parentElement)
      .append('svg')
      .attr('width', vis.config.svgWidth)
      .attr('height', vis.config.svgHeight);

    // create g and transform, this is for the chart
    vis.chart = vis.svg.append('g')
      .attr('transform', `translate(${vis.config.marginLeft}, ${vis.config.marginTop + vis.config.marginControllerHeight + 20})`)
    
    // create scaleX
    vis.scaleX = d3.scaleTime();

    // create scaleY
    vis.scaleY = d3.scaleLinear();

    vis.scaleZ = d3.scaleOrdinal(d3.schemeCategory10);

    vis.axisXCall = d3.axisBottom()
      .tickFormat(d3.timeFormat('%m/%d/%Y'));
  
    vis.axisYCall = d3.axisLeft()

    vis.axisX = vis.chart.append('g')
      .attr("transform", `translate(0, ${vis.config.chartHeight})`);
  
    vis.axisY = vis.chart.append('g')

    vis.title = vis.svg.append('text')
      .attr('x', vis.config.svgWidth / 2)           
      .attr('y', vis.config.marginTop / 2)
      .attr('text-anchor', 'middle')  
      .style('font-size', '30px') 
      .style('font-weight', '600')  
      .text(vis.config.title);

    vis.t = d3.transition().duration(vis.config.transition || 500);

    vis.controller = vis.svg.append('g').attr('transform', `translate(${vis.config.marginLeft+vis.config.chartWidth*0.05}, ${vis.config.marginTop})`);

    const xExtent = d3.extent(data[0].values, d => d.date);
    vis.slider = new Slider(vis.controller, xExtent, [vis.config.chartWidth*0.9, vis.config.marginControllerHeight], vis);
    //get the last 7 days
    const initRange = [getLastWeekFromDate(new Date(xExtent[1])).getTime(), xExtent[1]];
    //const initData = filterDataByRange(vis.originalData, initRange);
    vis.slider.updateValue(initRange);
    //vis.updateChart(initData);
  }

  updateChart(data) {
    // the data would be like:
    /**
     * [
     *   {
     *     zone: CN,
     *     values: [
     *       {date: 11111, price: 2222},
     *       {date: 11111, price: 2222},
     *       ...
     *     ]
     *   },
     *   ...
     * ]
     */
    this.updateConfig();
    this.data = data;
    const vis = this;
    const {chartWidth, chartHeight, chartBg} = vis.config;
    // update scales
    const xExtent = d3.extent(data[0].values, d => d.date);
    vis.scaleX.domain(xExtent)
      .range([0, chartWidth]);

    const yExtent = [
      d3.min(data, d => d3.min(d.values, v => v.price)),
      d3.max(data, d => d3.max(d.values, v => v.price))
    ];
    vis.scaleY.domain([yExtent[0]*0.8, yExtent[1]*1.2])
      .range([chartHeight, 0]);
      //.interpolate(d3.interpolateRound);

    // update axises
    vis.axisXCall.scale(vis.scaleX);
    vis.axisX.call(vis.axisXCall);

    vis.axisYCall.scale(vis.scaleY);
    vis.axisY.call(vis.axisYCall);

    // add background
    vis.chartBgArea = vis.chart.selectAll('.bgArea')
      .data([1])
      .join('rect')
      .attr('class', 'bgArea')
      .attr('width', chartWidth)
      .attr('height', chartHeight)
      .attr('fill', chartBg);

    // add dashed area on Y axis
    // const yTicks = vis.scaleY.ticks();
    // yTicks.shift();
    // const ydashLines = yTicks.map(y => [[0, y], [chartWidth, y]])
    // vis.chartBgLine = vis.chart.selectAll('.y-dash-area')
    //   .data(ydashLines)
    //   .join('line')
    //   .attr('class', 'y-dash-area')
    //   .attr('x1', d=>d[0][0])
    //   .attr('y1', d=>vis.scaleY(d[0][1]))
    //   .attr('x2', d=>d[0][0])
    //   .attr('y2', d=>vis.scaleY(d[0][1]))
    //   .transition(vis.t)
    //   .attr('x1', d=>d[0][0])
    //   .attr('y1', d=>vis.scaleY(d[0][1]))
    //   .attr('x2', d=>d[1][0])
    //   .attr('y2', d=>vis.scaleY(d[1][1]));
    
    const line = d3.line()
      .x(d => vis.scaleX(d.date))
      .y(d => vis.scaleY(d.price));

    vis.scaleZ.domain(data.map(d => d.zone));

    // Create a <g> element for each zone
    // vis.zones = vis.chart.selectAll('.zone')
    //   .data(data)
    //   .join('g')
    //   .attr('class', 'zone');
    
    // Create a <path> element inside of each city <g>
    // Use line generator function to convert data points into SVG path string
    vis.paths = vis.chart.selectAll('.zone-path')
      .data(data)
      .join('path')
      .attr('class', 'zone-path')
      .attr('d', d => line(d.values))
      .attr('fill', 'none')
      .style('stroke', d => vis.scaleZ(d.zone));
      
    // vis.zones.append('path')
    //   .attr('class', 'line')
    //   .attr('d', d => line(d.values))
    //   .attr('fill', 'none')
    //   .style('stroke', d => vis.scaleZ(d.zone));
  }
}

export default LineChart;