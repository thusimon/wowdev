import { useEffect, useState } from 'react';
import { deserialize } from 'bson';
import LineChart from './lineChart';
import { filterDataByRange, reformatData } from '../utils/token';
import { getRangeByName } from '../utils/date';

import loadingIcon from '../assets/images/loading.svg';

import './wowTokenChart.scss';

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
  tooltipColor: 'green'
};

let originalData;

const WowTokenChart = () => {
  const [status, setStatus] = useState(0);
  useEffect(() => {
    const otp = encodeURIComponent(window.otp);
    fetch(`/api/wowToken/all?t=${otp}`)
    .then(resp => {
      if (resp.ok) {
        resp.arrayBuffer()
        .then(bson => {
          const data = deserialize(bson);
          // re-format tokens
          originalData = reformatData(data.tokens);
          if (!originalData) {
            return;
          }
          setTimeout(() => {
            setStatus(1);
            const timeRange = getRangeByName('month');
            const data = filterDataByRange(originalData, timeRange);
            const lineChart = new LineChart('div#line-chart', config);
            lineChart.initChart(data);
          }, 500);
        });
      }
    })
  }, []);

  const onSelectChange = (evt) => {
    if (!originalData) {
      return;
    }
    const rangeName = evt.target.value;
    const timeRange = getRangeByName(rangeName); 
    const data = filterDataByRange(originalData, timeRange);
    const lineChart = new LineChart('div#line-chart', config);
    lineChart.initChart(data);
  }

  return <div id='line-chart-container'>
    <div id='line-chart-caption-container'>
      <h2 id='caption'>World of Warcraft historical token price</h2>
      <select id='time-select' defaultValue='month' onChange={onSelectChange}>
        <option value='week'>This week</option>
        <option value='month'>This month</option>
        <option value='quarter'>This quarter</option>
        <option value='year'>This year</option>
        <option value='all'>All data</option>
      </select>
    </div>
    <div id='status-container' className={status===0 ? 'loading' : 'hide'}>
      <img src={loadingIcon} alt='loading'></img>
    </div>
    <div id='line-chart'>
    </div>
  </div>
};

export default WowTokenChart;
