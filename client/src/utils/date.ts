const getSimpleDateTime = (d) => {
  const options = { year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit', hour12: false };
  return d.toLocaleDateString('en-US', options);
}

const getSimpleDate = d => {
  const options = { year: 'numeric', month: '2-digit', day: '2-digit' };
  return d.toLocaleDateString('en-US', options);
}

const getSimpleTime = d => {
  const options = { hour: '2-digit', minute: '2-digit', hour12: false };
  return d.toLocaleDateString('en-US', options);
}

const getLastWeekFromDate = d => {
  return new Date(d.getFullYear(), d.getMonth(), d.getDate() - 7, d.getHours(), d.getMinutes(), d.getSeconds(), d.getMinutes());
}

const getLatestPortionFromDate = (low, up, portion) => {
  return [up - (up - low) * portion, up];
}

const DAY_SPAN = 60 * 60 * 24 * 1000;
const WEEK_SPAN = DAY_SPAN * 7;
const MONTH_SPAN = DAY_SPAN * 30;
const QUARTER_SPAN = MONTH_SPAN * 3;
const YEAR_SPAN = QUARTER_SPAN * 4;

const getRangeByName = (name) => {
  let span = MONTH_SPAN;
  switch (name) {
    case 'week': {
      span = WEEK_SPAN;
      break;
    }
    case 'month': {
      span = MONTH_SPAN;
      break;
    }
    case 'quarter': {
      span = QUARTER_SPAN;
      break;
    }
    case 'year': {
      span = YEAR_SPAN;
      break;
    }
    case 'all': {
      return [null, null];
    }
    default: {
      span = MONTH_SPAN;
      break;
    }
  }
  const currentTime = new Date().getTime();
  return [currentTime - span, null];
}

// date is alreay sorted ascend
const findNearestDate = (date, d) => {
  const upperIndex = date.findIndex(v => v >= d);
  if (upperIndex === 0) {
    return date[0];
  } else if (upperIndex > 0) {
    const upper = date[upperIndex];
    const lower = date[upperIndex - 1];
    const lowerDiff = d - lower;
    const upperDiff = upper - d;
    return lowerDiff > upperDiff ? upper : lower;
  } else {
    return d;
  }
}

export { 
  getSimpleDateTime,
  getSimpleDate,
  getLastWeekFromDate,
  getLatestPortionFromDate,
  findNearestDate,
  getRangeByName
};
