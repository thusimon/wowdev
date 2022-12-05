import React, { useEffect, useState } from 'react';
import { showTokenGold } from '../utils/token';
import WowTokenChart from './wowTokenChart';
import './wowtoken.scss';

const WowToken = () => {
  const [message, setMessage] = useState({type: 0, msg: 'Loading...'});
  const [tokenValue, setTokenValue] = useState([]);
  useEffect(() => {
    const getAuthorize = () => {
      // get access token via authroize flow
      // window.location.href='/api/oauth2/authorize';

      // get access token via credential flow
      return fetch('/api/oauth2/credflow')
      .then(resp => {
        if (resp.ok) {
          // we can refresh the page
          setMessage({type: 1, msg: 'obtain access token successfully'});
          return Promise.resolve();
        } else {
          setMessage({type: -1, msg: '!!!failed to obtain access token, blizzard API authentication failed!!!'});
          return Promise.reject();
        }
      })
    }

    const getWowTokens = () => {
      return fetch('/api/wowToken')
      .then(resp => {
        if (resp.ok) {
          return resp.json()
          .then(data => {
            setMessage({type: 2, msg: `successfully get ${data.length} regions of WOW tokens`});
            setTokenValue(data);
            return Promise.resolve();
          })
        } else {
          return Promise.reject();
        }
      })
      .catch(err => {
        return Promise.reject();
      });
    }

    const getWowTokensWithRetry = () => {
      return getWowTokens()
      .then(() => {
        // good do nothing;
      })
      .catch(() => {
        // retry for one time
        return getAuthorize()
        .then(() => {
          return getWowTokens()
          .catch(() => {
            setMessage({type: -2, msg: '!!!failed to obtain World of Warcraft tokens prices!!!'});
          });
        })
      })
    }

    getWowTokensWithRetry();
  }, []);

  return <div className='token-main'>
    <h2>World of Warcraft real-time token price</h2>
    <table>
      <tbody>
        <tr>
          <td>US: {showTokenGold(tokenValue[1])}</td>
          <td>EU: {showTokenGold(tokenValue[2])}</td>
          <td>TW: {showTokenGold(tokenValue[4])}</td>
          <td>KR: {showTokenGold(tokenValue[3])}</td>
          <td>CN: {showTokenGold(tokenValue[0])}</td>
        </tr>
      </tbody>
    </table>
    <WowTokenChart />
    <div className={message.type < 0 ? 'error' : 'hide'}>
      {message.msg}
    </div>
  </div>
}

export default WowToken;
