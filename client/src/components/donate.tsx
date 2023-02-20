import { useState } from 'react';

import QRCode from '../assets/images/paypal_QR.png';
import './donate.scss';

const Donate = () => {
  const [toggle, setToggle] = useState(false);
  const [detail, setDetail] = useState(false);

  const onTitleClick = () => {
    setToggle(!toggle);
  };

  const onImageClick = () => {
    setDetail(true);
  }

  const onCloseClick = () => {
    setDetail(false);
    setToggle(false);
  }

  const getDetailClass = () => {
    if (!detail) {
      return toggle ? 'toggle-more' : 'toggle-less';
    } else {
      return 'show-gratitude'
    }
  }
  return <div id="donate-toggle-container">
    <div id='donate-thumbup'>
      <p id='title' onClick={onTitleClick}>Support me:) {toggle ? '▲' : '▼'}</p>
    </div>
    <div id='donate-details' className={getDetailClass()}>
      <div id='donate-gratitude' className={detail ? 'show-gratitude-instruct' : 'hide-gratitude-instruct'}>
        <span>Support me for server expenses and delivering better experience</span>
        <button id='close' onClick={onCloseClick}>X</button>
      </div>
      <img src={QRCode} alt='paypal QR code' className={detail ? 'image-detail' : 'image-thumbup'} onClick={onImageClick}></img>
    </div>
  </div>
}

export default Donate;
