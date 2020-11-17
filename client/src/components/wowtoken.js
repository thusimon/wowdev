import React, {useEffect, useState} from 'react';
import { showTokenGold } from '../utils/token';
import LineChart from './lineChart';
import './wowtoken.scss';

const WowToken = () => {
  const [message, setMessage] = useState({type: 0, msg: 'Loading...'});
  const [tokenValue, setTokenValue] = useState([]);
  const [refresh, setRefresh] = useState(0);
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
          setRefresh(1);
          return Promise.resolve();
        } else {
          setMessage({type: -1, msg: 'failed to obtain access token'});
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
            setMessage({type: 2, msg: 'WOW tokens'});
            setTokenValue(data);
            return Promise.resolve();
          })
        } else {
          return Promise.reject();
        }
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
            setMessage({type: -2, msg: 'failed to obtain access tokens with access token'});
          });
        })
      })
    }

    getWowTokensWithRetry();
  }, [refresh]);

  return <div className='token-table'>
    <table>
      <tbody>
        <tr>
          <td>CN: {showTokenGold(tokenValue[0])}</td>
          <td>US: {showTokenGold(tokenValue[1])}</td>
          <td>EU: {showTokenGold(tokenValue[2])}</td>
          <td>KR: {showTokenGold(tokenValue[3])}</td>
          <td>TW: {showTokenGold(tokenValue[4])}</td>
        </tr>
      </tbody>
    </table>
    <LineChart />
  </div>
}

export default WowToken;