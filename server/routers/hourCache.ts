class HourCache<T> {
  static HourSpan: number = 60 * 60 * 1000;
  timestamp: number | null;
  value: T | null;
  constructor() {
    this.timestamp = null;
    this.value = null;
  }
  get() {
    if (!this.value || !this.timestamp) {
      return null;
    }
    const curTime = new Date().getTime();
    //const curHourTime = new Date(curTime.getFullYear(), curTime.getMonth(), curTime.getDate(), curTime.getHours(), 5, 0, 0);
    if (curTime - this.timestamp > HourCache.HourSpan) {
      return null;
    }
    return this.value;
  }
  put(value: T) {
    const curTime = new Date();
    this.timestamp = new Date(curTime.getFullYear(), curTime.getMonth(), curTime.getDate(), curTime.getHours(), 0, 0, 0).getTime();
    this.value = value;
  }
  clear() {
    this.timestamp = null;
    this.value = null;
  }
}

export default HourCache;
