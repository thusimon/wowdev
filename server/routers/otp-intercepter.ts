import type { RequestHandler } from "express";
import otpManagerFactory from '../otp/otp-manager-factory';

const otpManager = otpManagerFactory.getOTPManager();

const otpIntercepter: RequestHandler  = (req, res, next) => {
  const env = process.env.NODE_ENV;
  if (env === 'development') {
    next();
  } else {
    const otpToken = decodeURIComponent(req.query.t as string);
    const err = {err: 'you don not have permission'};
    if (!otpToken) {
      // no otp;
      res.status(403).json(err);
    } else {
      const used = otpManager.useOTP(otpToken);
      if (!used) {
        res.status(403).json(err);
      } else {
        next();
      }
    }
  }
};

export default otpIntercepter;
