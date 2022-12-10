import crypto from 'crypto';

class OTP {
  token: string;
  timestamp: number;
  capacity: number;
  constructor(capacity: number) {
    this.token = crypto.randomBytes(16).toString("base64");;
    this.timestamp = new Date().getTime();
    this.capacity = capacity;
  }
}

export default OTP;
