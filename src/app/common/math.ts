export const round = (value: number, decimalPoints: number): number => {
  const factor = Math.pow(10, decimalPoints);
  return Math.round(value * factor) / factor;
};

export const numberOr = <T>(value: any, or: T): number | T => (typeof value === 'number') ? value : or;

/**
 * Credits: joshuakcockrell
 * https://stackoverflow.com/questions/25582882/javascript-math-random-normal-distribution-gaussian-bell-curve
 * Adapted to my coding style
 */
export const randomNormal = (): number => {
  let u = 0;
  let v = 0;
  while (u === 0) {
    u = Math.random();
  }
  while (v === 0) {
    v = Math.random();
  }
  return (Math.sqrt(-2.0 * Math.log(u)) * Math.cos(2.0 * Math.PI * v)) / 10.0 + 0.5;
};

export const randomNormalMinMax = (min: number, max: number, skew = 1): number => {
  let num = randomNormal();
  while (num < 0 || 1 < num) {
    num = randomNormal();
  }
  num = Math.pow(num, skew);
  return num * (max - min) + min;
};

export const stdevMinMax = (min: number, max: number, z = 3.6): number => ((max - min) / 2) / z;

export const medianMinMax = (min: number, max: number): number => ((max - min) / 2) + min;
