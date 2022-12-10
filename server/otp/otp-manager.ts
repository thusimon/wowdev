import OTP from './otp';


class OTPManager {
  static OTP_TIME_TOLERANCE: number = 1000 * 12; //12 seconds
  OTPPool: OTP[];
  constructor() {
    this.OTPPool = [];
  }

  addOTP(capacity: number = 3) {
    const otp = new OTP(capacity)
    this.OTPPool.push(otp);
    return otp;
  }

  getOTP(token: string): OTP {
    return this.OTPPool.find(otp => otp.token === token);
  }

  getOTPIndex(token: string): number {
    return this.OTPPool.findIndex(otp => otp.token === token);
  }

  useOTP(token: string): boolean {
    const otpIndex = this.getOTPIndex(token);
    if (otpIndex < 0) {
      // didn't find any otp, return false;
      return false;
    }
    const otp = this.OTPPool[otpIndex];
    otp.capacity--;
    const currentTime = new Date().getTime();
    if (otp.capacity < 0 || otp.timestamp + OTPManager.OTP_TIME_TOLERANCE < currentTime) {
      // remove this otp and return false;
      this.OTPPool.splice(otpIndex, 1);
      return false;
    }
    return true;
  }

  clearOTP() {
    // we can use a timer to clear it every X seconds, it would be more secure
    // but it is acceptable that we clear it every time we visit the homepage
    const currentTime = new Date().getTime();
    for (let i = this.OTPPool.length - 1; i >= 0; --i) {
      const otp = this.OTPPool[i];
      if (otp.timestamp + OTPManager.OTP_TIME_TOLERANCE < currentTime) {
        this.OTPPool.splice(i, 1);
      }
    }
  }
};

export default OTPManager;
