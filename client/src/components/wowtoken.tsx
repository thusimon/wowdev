import { useEffect, useState } from 'react';
import { showTokenGold } from '../utils/token';
import { deserialize } from 'bson';
import WowTokenChart from './wowTokenChart';
import Donate from './donate';

import './wowtoken.scss';

const WowToken = () => {
  const [message, setMessage] = useState({type: 0, msg: 'Loading...'});
  const [tokenValue, setTokenValue] = useState<number[]>([]);
  useEffect(() => {
    const otp = encodeURIComponent(window.otp);
    const getWowTokens = () => {
      return fetch(`/api/wowToken?t=${otp}`)
      .then(resp => {
        if (resp.ok) {
          return resp.arrayBuffer()
          .then(bson => {
            const data = deserialize(bson) as number[];
            setMessage({type: 2, msg: `successfully get ${data.length} regions of WOW tokens`});
            setTokenValue(data);
            return Promise.resolve();
          });
        } else {
          setTokenValue([-2, -2, -2, -2, -2]);
          return Promise.reject();
        }
      })
      .catch(err => {
        return Promise.reject();
      });
    }
    getWowTokens();
  }, []);

  return <div className='token-main'>
    <Donate />
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
