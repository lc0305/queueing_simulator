export const round = (value: number, decimalPoints: number): number => {
  const factor = Math.pow(10, decimalPoints);
  return Math.round(value * factor) / factor;
};

export const numberOr = <T>(value: any,  or: T): number | T => (typeof value === 'number') ? value : or;
