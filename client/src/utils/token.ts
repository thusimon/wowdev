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
  return [
    {zone: 'US', idx: 1},
    {zone: 'EU', idx: 2},
    {zone: 'TW', idx: 4},
    {zone: 'KR', idx: 3},
    {zone: 'CN', idx: 0},
  ].map(config => {
    return {
      zone: config.zone,
      values: data.map(d => ({ date: d.d, price: d.p[config.idx] / 10000 }))
    };
  });
}

const filterDataByRange = (data, range) => {
  const [low, up] = range;
  return data.map(zoneData => {
    const filteredValues = zoneData.values.filter(v => {
      const upFiltered = !up || v.date <= up;
      const lowFiltered = !low || v.date >= low;
      return upFiltered && lowFiltered;
    });
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
