import express from 'express';
import fs from 'fs';
import handlebars from 'handlebars';
import otpManagerFactory from '../otp/otp-manager-factory';

const router = express.Router();

const getIndexTemplate = () => {
  let indexContent = null;
  return () => {
    if (indexContent) {
      return indexContent;
    }
    indexContent = fs.readFileSync('../client/build/index.html', 'utf8');
    return indexContent;
  }
}

const indexTemplateGetter = getIndexTemplate();

const indexTemplate = handlebars.compile(indexTemplateGetter(), {noEscape: true});

const otpManager = otpManagerFactory.getOTPManager();


const returnIndex = () => {
  otpManager.clearOTP();
  const otp = otpManager.addOTP(4);
  return indexTemplate({otp: otp.token});
}
router.get('/', (req, resp) => {
  resp.send(returnIndex());
});

router.get('/wowtoken', (req, resp) => {
  resp.send(returnIndex());
});

export default router;
