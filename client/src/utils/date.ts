const getSimpleDateTime = (d) => {
  const options = { year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit', hour12: false };
  return d.toLocaleDateString('en-US', options);
}

const getSimpleDate = d => {
  const options = { year: 'numeric', month: '2-digit', day: '2-digit' };
  return d.toLocaleDateString('en-US', options);
}

const getLastWeekFromDate = d => {
  return new Date(d.getFullYear(), d.getMonth(), d.getDate() - 7, d.getHours(), d.getMinutes(), d.getSeconds(), d.getMinutes());
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
  findNearestDate
};
