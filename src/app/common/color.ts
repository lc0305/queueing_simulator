// tslint:disable: no-bitwise
import * as MurmurHash3 from 'imurmurhash';

export const randomColor = (): string => '#' + ((1 << 24) * Math.random() | 0).toString(16);

const seed = 1337;
const hasher = new MurmurHash3();
// tslint:disable-next-line: ban-types
export const toColor = <T extends Object>(value: T): string => {
  const hashLower24 = Math.abs(hasher.reset(seed).hash(value.toString()).result()) & 0xFFFFFF;
  return '#' + hashLower24.toString(16).toUpperCase();
};
