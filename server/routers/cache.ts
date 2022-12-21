class Cache<T> {
  expireSpan: number = 60 * 60 * 1000;
  timestamp: number | null;
  value: T | null;
  constructor(expireSpan: number) {
    this.timestamp = null;
    this.value = null;
    this.expireSpan = expireSpan;
  }
  get() {
    if (!this.value || !this.timestamp) {
      return null;
    }
    const curTime = new Date().getTime();
    //const curHourTime = new Date(curTime.getFullYear(), curTime.getMonth(), curTime.getDate(), curTime.getHours(), 5, 0, 0);
    if (curTime - this.timestamp > this.expireSpan) {
      return null;
    }
    return this.value;
  }
  put(value: T, timestamp: number) {
    const curTime = new Date();
    this.timestamp = new Date(curTime.getFullYear(), curTime.getMonth(), curTime.getDate(), curTime.getHours(), 0, 0, 0).getTime();
    this.timestamp = timestamp;
    this.value = value;
  }
  clear() {
    this.timestamp = null;
    this.value = null;
  }
}

export default Cache;
