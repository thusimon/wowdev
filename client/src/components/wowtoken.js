import React, {useEffect, useState} from 'react';
const WowToken = () => {
  const [tokenValue, setTokenValue] = useState({type: -1, msg: 'Loading...'});
  const [refresh, setRefresh] = useState(0);
  useEffect(() => {
    const getWowTokenCN = () => {
      fetch('/api/wowToken')
      .then(resp => {
        if (resp.ok) {
          resp.json()
          .then(data => {
            setTokenValue({type: 0, msg: data.price/10000});
          })
        } else {
          // get access token via authroize flow
          // window.location.href='/api/oauth2/authorize';

          // get access token via credential flow
          fetch('/api/oauth2/credflow')
          .then(resp => {
            if (resp.ok) {
              // we can refresh the page
              setRefresh(1);
            } else {
              resp.json()
              .then(data => {
                setTokenValue({type: -2, msg: data.err});
              });
            }
          })
        }
      });
    }
    getWowTokenCN();
  }, [refresh]);

  let result;
  if (tokenValue.type === -1) {
    result = <div>Loading...</div>
  } else if (tokenValue.type === -2){
    result = <div>Error: {tokenValue.msg}</div>
  } else {
    result = <div>Token price: {tokenValue.msg} G</div>
  }
  return result;
}

export default WowToken;