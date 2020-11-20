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

export { 
  getSimpleDateTime,
  getSimpleDate,
  getLastWeekFromDate
};