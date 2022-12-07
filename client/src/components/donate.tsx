import { useState } from 'react';

import QRCode from '../assets/images/paypal_QR.png';
import './donate.scss';

const Donate = () => {
  const [toggle, setToggle] = useState(true);
  const [detail, setDetail] = useState(false);

  const onTitleClick = () => {
    setToggle(!toggle);
  };

  return <div id="donate-toggle-container">
    <div id='donate-thumbup'>
      <p id='title' onClick={onTitleClick}>Support me:) {toggle ? '▲' : '▼'}</p>
      <div id='donate-details' className={toggle ? 'toggle-more' : 'toggle-less'}>
        <div id='donate-gratitude' className={detail ? 'show-gratitude' : 'hide-gratitude'}>
          <p>Support me for the server expenses</p>
          <p>I will be more motivated to maintain the website and deliever better experience, thanks:)</p>
          <span>X</span>
        </div>
        <img src={QRCode} alt='paypal QR code' className={detail ? 'image-detail' : 'image-thumbup'}></img>
      </div>
    </div>
  </div>
}

export default Donate;
