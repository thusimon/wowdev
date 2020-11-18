import React, {useEffect, useState} from 'react';
import LineChart from './lineChart';
import { reformatData } from '../utils/token';

const config = {
  svgWidth: 1000,
  svgHeight: 800,
  marginTop: 50,
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
  const [wowTokens, setWowTokens] = useState([]);
  useEffect(() => {
    fetch('/api/wowToken/all')
    .then(resp => {
      if (resp.ok) {
        resp.json()
        .then(data => {
          lineChart.initChart();
          // re-format tokens
          const dataToDraw = reformatData(data.tokens);
          setWowTokens(dataToDraw);
          lineChart.updateChart(dataToDraw);
        });
      }
    })
  }, []);

  return <div id='line-chart'></div>
}

export default WowTokenChart;