import React, {useEffect, useState} from 'react';

const LineChart = () => {
  const [wowTokens, setWowTokens] = useState([]);
  useEffect(() => {
    fetch('/api/wowToken/all')
    .then(resp => {
      if (resp.ok) {
        resp.json()
        .then(data => {
          console.log(data);
          setWowTokens(data);
        });
      }
    })
  }, []);

  return <div>Line Chart</div>
}

export default LineChart;