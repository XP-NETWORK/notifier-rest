import BN from 'bignumber.js';

export function getRandomArbitrary() {
  const dateNow = +new Date();
  const randomNumberBasedOnDate = Math.floor(Math.random() * dateNow);
  return new BN(randomNumberBasedOnDate);
}
