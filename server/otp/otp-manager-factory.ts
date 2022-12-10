import OTPManager from "./otp-manager";

const OTPManagerFactory = () => {
  let otpManager: OTPManager = null;
  return {
    getOTPManager: () => {
      if(!otpManager) {
        otpManager = new OTPManager();
      }
      return otpManager;
    }
  }
}

export default OTPManagerFactory();
