const showTokenGold = (token) => {
  if (typeof token === 'number') {
    if (token>0) {
      return token/10000 + ' G';
    } else {
      return 'Error';
    }
  } else {
    return 'Loading...'
  }
}
// original data:
/**
 * [
 *   {d: date, p:[CN,US,EU,KR,TW]},
 *   ... 
 * ]
 */
// the data would be like:
/**
 * [
 *   {
 *     zone: CN,
 *     values: [
 *       {date: 11111, price: 2222},
 *       {date: 11111, price: 2222},
 *       ...
 *     ]
 *   },
 *   ...
 * ]
 */
const reformatData = (data) => {
  return ['CN', 'US', 'EU', 'KR', 'TW'].map((zone, idx) => {
    return {
      zone,
      values: data.map(d => ({date: d.d, price: d.p[idx] > 0 ? d.p[idx]/10000 : d.p[idx-1]/10000}))
    }
  })
}

const filterDataByRange = (data, range) => {
  const [low, up] = range;
  return data.map(zoneData => {
    const filteredValues = zoneData.values.filter(v => v.date <= up && v.date >= low);
    return {
      zone: zoneData.zone,
      values: filteredValues
    }
  })
}

export {
  showTokenGold,
  reformatData,
  filterDataByRange
};
