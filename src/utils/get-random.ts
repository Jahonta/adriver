const MIN_RANDOM = 100000;
const MAX_RANDOM = 999999;

export function getRandom(min = MIN_RANDOM, max = MAX_RANDOM) {
  return Math.floor(Math.random() * (max - min) + min);
}
