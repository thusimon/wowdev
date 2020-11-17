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

export { showTokenGold };