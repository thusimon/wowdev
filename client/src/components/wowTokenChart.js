import React, { useEffect } from 'react';
import LineChart from './lineChart';
import { reformatData } from '../utils/token';

const config = {
  svgWidth: 1000,
  svgHeight: 800,
  marginTop: 50,
  marginControllerHeight: 30,
  marginRight: 30,
  marginBottom: 60,
  marginLeft: 60,
  chartBg: 'lightyellow',
  chartWidth: 1000,
  chartHeight: 800,
  barColor: '#1034a6',
  barHoverColor: '#0080ff',
  tooltipColor: 'green',
  title: 'World of Warcraft tokens chart'
}
const lineChart = new LineChart('div#line-chart', config);

const WowTokenChart = () => {
  useEffect(() => {
    fetch('/api/wowToken/all')
    .then(resp => {
      if (resp.ok) {
        resp.json()
        .then(data => {
          // re-format tokens
          const originalData = reformatData(data.tokens);
          lineChart.initChart(originalData);
        });
      }
    })
  }, []);

  return <div id='line-chart-container'>
    <div id='line-chart'></div>
  </div>
}

export default WowTokenChart;