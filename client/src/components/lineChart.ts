import * as d3 from 'd3';
import Slider from './slider';
import { getLastWeekFromDate, findNearestDate, getSimpleDateTime, getLatestPortionFromDate } from '../utils/date';
import './lineChart.scss';

class LineChart {
  parentElement: string;
  config: any;
  showTooltip: boolean;
  selectedZone: null;
  originalData: any;
  timeRangeData: any;
  svg?: d3.Selection<SVGSVGElement, unknown, HTMLElement, any>;
  chart: any;
  scaleX?: d3.ScaleTime<number, number, never>;
  scaleY?: d3.ScaleLinear<number, number, never>;
  scaleZ?: d3.ScaleOrdinal<string, string, never>;
  axisX: any;
  axisY: any;
  t?: d3.Transition<d3.BaseType, unknown, null, undefined>;
  controller: any;
  chartBgArea: any;
  chartBgLine: any;
  legendContainer: any;
  toolTipContainer: any;
  toolTipDateLabel: any;
  toolTipValueLabel: any;
  slider?: Slider;
  data: any;
  dataDate: any;
  dataZone: any;
  toolTipDate: any;
  paths: any;
  toolTipVerticalLine: any;
  axisXCall?: d3.Axis<Date>;
  axisYCall?: d3.Axis<d3.NumberValue>;
  constructor(parentElement: string, config: object) {
    this.parentElement = parentElement;
    this.config = config;
    this.showTooltip = false;
    this.selectedZone = null;
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
    const lineChartContainer = document.querySelector('div#line-chart')!;
    while (lineChartContainer.firstChild) {
      lineChartContainer.removeChild(lineChartContainer.firstChild);
    }
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

    vis.axisXCall = d3.axisBottom<Date>(vis.scaleX)
      .tickFormat(d3.timeFormat('%m/%d/%Y'));
  
    vis.axisYCall = d3.axisLeft(vis.scaleY)

    vis.axisX = vis.chart.append('g')
      .attr("transform", `translate(0, ${vis.config.chartHeight})`);
  
    vis.axisY = vis.chart.append('g');

    vis.t = d3.transition().duration(vis.config.transition || 500);

    vis.controller = vis.svg.append('g').attr('transform', `translate(${vis.config.marginLeft + vis.config.chartWidth * 0.05}, ${vis.config.marginTop})`);

    const xExtent = d3.extent(data[0].values, (d: any) => d.date);

    vis.chartBgArea = vis.chart.selectAll('.bgArea')
      .data([1])
      .join('rect')
      .attr('class', 'bgArea')
      .attr('width', vis.config.chartWidth)
      .attr('height', vis.config.chartHeight)
      .attr('fill', vis.config.chartBg)
      // .on('click', () => {
      //   vis.selectedZone = null;
      // });

    vis.chartBgLine = vis.chart.selectAll('.y-dash-area')
      .data([[[0, 0], [vis.config.chartWidth, 0]]])
      .transition(vis.t);

    vis.legendContainer = vis.chart.append('g')
      .attr('class', 'legend');

    vis.toolTipContainer = vis.chart.append('g')
      .attr('class', 'tooltip-container')
      .style('opacity','0');

    vis.toolTipDateLabel = vis.toolTipContainer.selectAll('.tooltip-date-label')
      .data([0])
      .join('text')
      .attr('class', 'tooltip-date-label');

    vis.toolTipValueLabel = vis.toolTipContainer.selectAll('.tooltip-value-label')
      .data([0])
      .join('text')
      .attr('class', 'tooltip-value-label');

    vis.slider = new Slider(vis.controller, xExtent, [ vis.config.chartWidth * 0.9, vis.config.marginControllerHeight ], vis);
    
    this.updateChartOnTimeRangePick(data)
  }

  updateChartOnTimeRangePick(data) {
    //init the slider on latest 1/5
    const xExtent = d3.extent(data[0].values, (d: any) => d.date);
    const initRange = getLatestPortionFromDate(xExtent[0], xExtent[1], 0.2);
    this.slider!.updateValue(initRange);
  }

  updateChartOnSlider(data) {
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
    const vis = this;
    vis.data = data;
    vis.dataDate = data[0].values.map(d => d.date);
    vis.dataZone = data.map(d => d.zone);
    const {chartWidth, chartHeight, chartBg} = vis.config;
    // update scales
    const xExtent = d3.extent(vis.dataDate) as Iterable<Date | d3.NumberValue>;
    vis.scaleX!.domain(xExtent)
      .range([0, chartWidth]);

    const yExtent = [
      d3.min(data, (d: any) => d3.min(d.values, (v: any) => v.price)),
      d3.max(data, (d: any) => d3.max(d.values, (v: any) => v.price))
    ] as Iterable<Date | d3.NumberValue>;;
    vis.scaleY!.domain([yExtent[0]*0.8, yExtent[1]*1.2])
      .range([chartHeight, 0]);
      //.interpolate(d3.interpolateRound);

    // update axises
    vis.axisXCall!.scale(vis.scaleX!);
    vis.axisX.call(vis.axisXCall);

    vis.axisYCall!.scale(vis.scaleY!);
    vis.axisY.call(vis.axisYCall);

    vis.toolTipDateLabel.attr('transform', `translate(-60, ${chartHeight+35})`);

    // update background
    // vis.chart.selectAll('.bgArea')
    //   .attr('width', chartWidth)
    //   .attr('height', chartHeight)
    //   .attr('fill', chartBg)
    //   .on('mousemove', (evt, d) => {
    //     const e = evt.target;
    //     const dim = e.getBoundingClientRect();
    //     const x = evt.clientX - dim.left;
    //     const dateInvert = vis.scaleX!.invert(x);
    //     vis.toolTipDate = findNearestDate(vis.dataDate, dateInvert.getTime());
    //     vis.toolTipContainer.attr('transform', `translate(${vis.scaleX!(vis.toolTipDate)}, 0)`);
    //     vis.toolTipDateLabel.text(getSimpleDateTime(new Date(vis.toolTipDate)));
    //     if (vis.selectedZone != null) {
    //       const zoneIdx = vis.dataZone.indexOf(vis.selectedZone);
    //       const zoneData = vis.data[zoneIdx];
    //       const toolTipData = zoneData.values.find(d => d.date === vis.toolTipDate);
    //       vis.toolTipValueLabel.attr('transform', `translate(10, ${vis.scaleY!(toolTipData.price)})`)
    //         .text(`${toolTipData.price}G`);
    //     }
    //   })
    //   .on('click', (evt, d) => {
    //     vis.selectedZone = null;
    //     vis.updateToolTips();
    // });

    // add dashed area on Y axis
    const yTicks = vis.scaleY!.ticks();
    yTicks.shift();
    const ydashLines = yTicks.map(y => [[0, y], [chartWidth, y]])
    vis.chartBgLine = vis.chart.selectAll('.y-dash-area')
      .data(ydashLines)
      .join('line')
      .attr('class', 'y-dash-area')
      .attr('x1', d => d[0][0])
      .attr('y1', d => vis.scaleY!(d[0][1]))
      .attr('x2', d => d[1][0])
      .attr('y2', d => vis.scaleY!(d[1][1]));
    
    const line = d3.line()
      .defined(((d: any, i) => d.price > 0))
      .x((d: any) => vis.scaleX!(d.date))
      .y((d: any) => vis.scaleY!(d.price));

    vis.scaleZ!.domain(data.map(d => d.zone));

    // Create a <g> element for each zone
    // vis.zones = vis.chart.selectAll('.zone')
    //   .data(data)
    //   .join('g')
    //   .attr('class', 'zone');
    
    // Create a <path> element inside of each city <g>
    // Use line generator function to convert data points into SVG path string
    vis.paths = vis.chart.selectAll('.zone-path-border')
      .data(data)
      .join('path')
      .attr('class', 'zone-path-border')
      .attr('id', d=> `zone-border-${d.zone}`)
      .attr('d', d => line(d.values))
      .attr('fill', 'none')
      .style('stroke', d => vis.scaleZ!(d.zone))
      .style('stroke-width', '2px')
      //.style('opacity', '0');

    // vis.paths = vis.chart.selectAll('.zone-path')
    //   .data(data)
    //   .join('path')
    //   .attr('class', 'zone-path')
    //   .attr('d', d => line(d.values))
    //   .attr('fill', 'none')
    //   .style('stroke', d => vis.scaleZ!(d.zone))
    //   .style('stroke-width', '2px')
    //   .on('mouseover', function(evt, d) {
    //     d3.selectAll(`#zone-border-${d.zone}`)
    //       .style('opacity', 1);
    //     d3.select(this).style('cursor', 'pointer'); 
    //   })
    //   .on('mouseout', function(evt, d) {
    //     d3.selectAll(`#zone-border-${d.zone}`)
    //       .style('opacity', 0);
    //     d3.select(this).style('cursor', 'default');
    //   })
    //   .on('click', function(evt, d) {
    //     vis.selectedZone = d.zone;
    //     vis.updateToolTips();
    //   });
    
    vis.toolTipVerticalLine = vis.toolTipContainer.selectAll('.tooltip-line')
      .data([0])
      .join('line')
      .attr('class', 'tooltip-line')
      .attr('x1', 0)
      .attr('y1', 0)
      .attr('x2', 0)
      .attr('y2', chartHeight)
      .attr('stroke-width', 1)
      .attr('stroke', 'black');
    
    // legend
    vis.legendContainer.attr('transform', `translate(${chartWidth - 100}, 10)`);

    vis.legendContainer.selectAll('.legend-line')
      .data(data.map(d => d.zone))
      .join('line')
      .attr('class', 'legend-line')
      .attr('x1', 0)
      .attr('y1', (d, i) => i*15)
      .attr('x2', 60)
      .attr('y2', (d, i) => i*15)
      .attr('stroke-width', 2)
      .attr('stroke', d => vis.scaleZ!(d));

    vis.legendContainer.selectAll('.legend-text')
      .data(data.map(d => d.zone))
      .join('text')
      .attr('class', 'legend-text')
      .attr('x', 65)           
      .attr('y', (d, i) => i*15 + 3)
      .attr('text-anchor', 'left')  
      .style('font-size', '12px') 
      .style('font-weight', '600')  
      .text(d => d);
  }

  updateToolTips() {
    const vis = this;
    if (vis.selectedZone != null) {
      vis.toolTipContainer.style('opacity', 1);
    } else {
      vis.toolTipContainer.style('opacity', 0);
    }

  }
}

export default LineChart;
