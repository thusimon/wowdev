import * as d3 from 'd3';
import Slider from './slider';
import { findNearestDate, getSimpleDateTime, getLatestPortionFromDate, DAY_SPAN } from '../utils/date';
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
  toolTipDataPoint: any;
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

  updateXAxisTick(xExtent) {
    if ((xExtent[1] - xExtent[0]) < DAY_SPAN * 7) {
      this.axisXCall!.tickFormat(d3.timeFormat('%m/%d %H:%M'))
        .ticks(7);
      // this.axisX.selectAll('text').each(function(d) {
      //   const el = d3.select(this);
      //   const text = el.text();
      //   const [time, date] = text.split(' ');
      //   el.append('tspan').text(date);
      //   el.text(time);
      // });
    } else {
      this.axisXCall!.tickFormat(d3.timeFormat('%m/%d/%Y'))
        .ticks(7);
    }
  }

  initChart(data) {
    const lineChartContainer = document.querySelector('div#line-chart')!;
    while (lineChartContainer.firstChild) {
      lineChartContainer.removeChild(lineChartContainer.firstChild);
    }
    this.updateConfig();
    const vis = this;
    const {
      chartWidth,
      chartHeight,
      transition,
      svgWidth,
      svgHeight,
      marginLeft,
      marginTop,
      marginControllerHeight,
      chartBg
    } = vis.config;
    vis.originalData = data;
    // create svg
    vis.svg = d3.select(vis.parentElement)
      .append('svg')
      .attr('width', svgWidth)
      .attr('height', svgHeight);

    // create g and transform, this is for the chart
    vis.chart = vis.svg.append('g')
      .attr('transform', `translate(${marginLeft}, ${marginTop + marginControllerHeight + 20})`)
    
    // create scaleX
    vis.scaleX = d3.scaleTime();

    // create scaleY
    vis.scaleY = d3.scaleLinear();

    vis.scaleZ = d3.scaleOrdinal(d3.schemeCategory10);

    const xExtent = d3.extent(data[0].values, (d: any) => d.date);

    vis.axisXCall = d3.axisBottom<Date>(vis.scaleX);
  
    vis.axisYCall = d3.axisLeft(vis.scaleY)

    vis.axisX = vis.chart.append('g')
      .attr('transform', `translate(0, ${chartHeight})`)
      .attr('id', 'x-axis-id');
  
    vis.axisY = vis.chart.append('g');

    vis.t = d3.transition().duration(transition || 500);

    vis.controller = vis.svg.append('g').attr('transform', `translate(${marginLeft + chartWidth * 0.05}, ${marginTop})`);

    vis.chartBgArea = vis.chart.selectAll('.bgArea')
      .data([1])
      .join('rect')
      .attr('class', 'bgArea')
      .attr('width', chartWidth)
      .attr('height', chartHeight)
      .attr('fill', chartBg)
      .on('mousemove touchmove', (evt, d) => {
        if (!vis.selectedZone) {
          return;
        }
        const e = evt.target;
        const dim = e.getBoundingClientRect();
        let x = evt.clientX - dim.left;
        if (evt.type === 'touchmove') {
          x = evt.changedTouches[0].clientX - 51.5
        }
        const dateInvert = vis.scaleX!.invert(x);
        const zoneIdx = vis.dataZone.indexOf(vis.selectedZone);
        const zoneData = vis.data[zoneIdx];
        vis.toolTipDate = findNearestDate(vis.dataDate, dateInvert.getTime());
        const toolTipData = zoneData.values.find(d => d.date === vis.toolTipDate);
        const widthV = vis.scaleX!(vis.toolTipDate);
        const heightV = vis.scaleY!(toolTipData.price);
        let toolTipValueLabelXOffset = 5;
        let toolTipDateLabelXOffset = -50;
        if (chartWidth - widthV < 30) {
          toolTipValueLabelXOffset = -55;
          toolTipDateLabelXOffset += chartWidth - widthV - 30;
        }
        vis.toolTipContainer.attr('transform', `translate(${widthV}, 0)`);
        vis.toolTipDateLabel.text(getSimpleDateTime(new Date(vis.toolTipDate)))
          .attr('transform', `translate(${toolTipDateLabelXOffset}, ${chartHeight+35})`);
        vis.toolTipValueLabel.attr('transform', `translate(${toolTipValueLabelXOffset}, ${heightV - 5})`)
          .text(`${toolTipData.price}G`);
        vis.toolTipDataPoint.attr('cy', heightV);
        vis.toolTipContainer.raise();
        vis.legendContainer.raise();
      })

    vis.chartBgLine = vis.chart.selectAll('.y-dash-area')
      .data([[[0, 0], [chartWidth, 0]]])
      .transition(vis.t);

    vis.toolTipContainer = vis.chart.append('g')
      .attr('class', 'tooltip-container')
      .style('opacity','0');

    vis.toolTipDateLabel = vis.toolTipContainer
      .append('text')
      .attr('class', 'tooltip-date-label')
      .style('font-size', '12px')
      .style('font-weight', '600');

    vis.toolTipValueLabel = vis.toolTipContainer
      .append('text')
      .attr('class', 'tooltip-value-label')
      .style('font-size', '12px')
      .style('font-weight', '600');

    vis.toolTipVerticalLine = vis.toolTipContainer
      .append('line')
      .attr('class', 'tooltip-line')
      .attr('x1', 0)
      .attr('y1', 0)
      .attr('x2', 0)
      .attr('y2', chartHeight)
      .attr('stroke-width', 1)
      .attr('stroke', 'black');

    vis.toolTipDataPoint = vis.toolTipContainer
      .append('circle')
      .attr('class', 'tooltip-data-point')
      .attr('cx', 0)
      .attr('cy', 0)
      .attr('r', 3)
      .attr('fill', 'red');;

    vis.legendContainer = vis.chart.append('g')
      .attr('class', 'legend');

    vis.legendContainer.append('rect')
      .attr('class', 'legend-bg')
      .attr('x', 0)
      .attr('y', -6)
      .attr('width', 82)
      .attr('height', 72)
      .attr('fill', chartBg);
      
    vis.legendContainer.append('text')
      .attr('class', 'legend-hint')
      .attr('x', -12)           
      .attr('y', 82)
      .attr('fill', 'black')
      .attr('text-anchor', 'left')  
      .style('font-size', '12px')
      .style('font-weight', '600')
      .text('Click to show detals');

    vis.legendContainer.selectAll('.legend-sample')
      .data(data.map(d => d.zone))
      .join(enter => {
        const g = enter.append('g')
          .attr('class', 'legend-sample')
          .attr('id', d => `legend-sample-${d}`)
          .attr('transform', (d, i) => `translate(0, ${i * 15})`)
          .attr('cursor', 'pointer');
        
        g.append('line')
          .attr('class', 'legend-line')
          .attr('x1', 0)
          .attr('y1', 0)
          .attr('x2', 60)
          .attr('y2', 0)
          .attr('stroke-width', 2)
          .attr('stroke', d => vis.scaleZ!(d));

        g.append('text')
          .attr('class', 'legend-text')
          .attr('x', 65)           
          .attr('y', 4)
          .attr('fill', 'black')
          .attr('text-anchor', 'left')  
          .style('font-size', '12px')
          .style('font-weight', '600')
          .text(d => d);
        
        g.append('rect')
          .attr('class', 'legend-sample-bg')
          .attr('x', 0)
          .attr('y', -6)
          .attr('width', 85)
          .attr('height', 12)
          .attr('fill-opacity', '0')
          .on('mouseover', function() {
            d3.select(this).attr('stroke', '#000');
          })
          .on('mouseleave', function() {
            d3.select(this).attr('stroke', 'none');
          });

        g.on('click', (evt, d) => {
          if (vis.selectedZone === d) {
            // clicked the same zone
            vis.selectedZone = null;
          } else {
            vis.selectedZone = d;
          }
          vis.updateLegend();
          vis.updatePaths();
          vis.updateToolTips();
        })
      });

    vis.slider = new Slider(vis.controller, xExtent, [chartWidth * 0.9, marginControllerHeight ], vis);
    
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
    const { chartWidth, chartHeight } = vis.config;
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
    this.updateXAxisTick(xExtent);

    vis.axisYCall!.scale(vis.scaleY!);
    vis.axisY.call(vis.axisYCall);

    vis.toolTipDateLabel.attr('transform', `translate(-50, ${chartHeight+35})`);

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
    vis.paths = vis.chart.selectAll('.zone-path')
      .data(data)
      .join('path')
      .attr('class', 'zone-path')
      .attr('id', d=> `zone-path-${d.zone}`)
      .attr('d', d => line(d.values))
      .attr('fill', 'none')
      .style('stroke', d => vis.scaleZ!(d.zone))
      .style('stroke-width', '2px');
    
    // legend
    vis.legendContainer.attr('transform', `translate(${chartWidth - 100}, 10)`);
  }

  updateToolTips() {
    const vis = this;
    if (vis.selectedZone != null) {
      vis.toolTipContainer.style('opacity', 1);
    } else {
      vis.toolTipContainer.style('opacity', 0);
    }
  }

  updateLegend() {
    const vis = this;
    if (this.selectedZone) {
      // greyout other zones, only highlight selected zone
      this.legendContainer.selectAll('.legend-sample')
      .attr('opacity', function() {
        if (this.id.endsWith(vis.selectedZone)) {
          return '1';
        }
        return '0.1';
      });
    } else {
      this.legendContainer.selectAll('.legend-sample')
      .attr('opacity', 1);
    }
  }
  
  updatePaths() {
    const vis = this;
    if (this.selectedZone) {
      // greyout other path, only highlight selected zone
      this.chart.selectAll('.zone-path')
      .attr('opacity', function() {
        if (this.id.endsWith(vis.selectedZone)) {
          return '1';
        }
        return '0.1';
      });
    } else {
      this.chart.selectAll('.zone-path')
      .attr('opacity', 1);
    }
  }
}

export default LineChart;
