// tslint:disable: no-bitwise

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

export const medianMinMax = (min: number, max: number): number => (max + min) / 2;

const logFactorialTable = [
  0.0,
  0.0,
  0.69314718055994529,
  1.791759469228055,
  3.1780538303479458,
  4.7874917427820458,
  6.5792512120101012,
  8.5251613610654147,
  10.604602902745251,
  12.801827480081469,
];

export const logFactorial = (k: number) => {
  return logFactorialTable[k];
};

export const logSqrt2PI = 0.91893853320467267;


/**
 * Credits: https://github.com/transitive-bullshit/random
 * License MIT © [Travis Fischer](https://transitivebullsh.it)
 * Adapted to my coding style
 */
export const randomPoisson = (lambda = 1): (() => number) => {
  if (lambda <= 1) {
    throw new Error('Lambda must be greater or equal than 1.');
  }

  if (lambda < 10) {
    const expMean = Math.exp(-lambda);

    return () => {
      let p = expMean;
      let x = 0;
      let u = Math.random();

      while (u > p) {
        u = u - p;
        p = (lambda * p) / ++x;
      }

      return x;
    };
  }

  const smu = Math.sqrt(lambda);
  const b = 0.931 + 2.53 * smu;
  const a = -0.059 + 0.02483 * b;
  const invAlpha = 1.1239 + 1.1328 / (b - 3.4);
  const vR = 0.9277 - 3.6224 / (b - 2);

  return () => {
    for (;;) {
      let u;
      let v = Math.random();

      if (v <= 0.86 * vR) {
        u = v / vR - 0.43;
        return Math.floor(
          ((2 * a) / (0.5 - Math.abs(u)) + b) * u + lambda + 0.445
        );
      }

      if (v >= vR) {
        u = Math.random() - 0.5;
      } else {
        u = v / vR - 0.93;
        u = (u < 0 ? -0.5 : 0.5) - u;
        v = Math.random() * vR;
      }

      const us = 0.5 - Math.abs(u);
      if (us < 0.013 && v > us) {
        continue;
      }

      const k = Math.floor(((2 * a) / us + b) * u + lambda + 0.445) | 0;
      v = (v * invAlpha) / (a / (us * us) + b);

      if (k >= 10) {
        const t =
          (k + 0.5) * Math.log(lambda / k) -
          lambda -
          logSqrt2PI +
          k -
          (1 / 12.0 - (1 / 360.0 - 1 / (1260.0 * k * k)) / (k * k)) / k;

        if (Math.log(v * smu) <= t) {
          return k;
        }
      } else if (k >= 0) {
        const f = logFactorial(k) ?? 0;

        if (Math.log(v) <= k * Math.log(lambda) - lambda - f) {
          return k;
        }
      }
    }
  };
};

export const randomExponential = (mu: number): number =>  Math.round((Math.log(1 - Math.random()) * (-mu)));
