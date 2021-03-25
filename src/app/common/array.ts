// tslint:disable: no-bitwise

export const insertSorted = (array: Array<number>, value: number): void => {
  array.splice(sortedIndex(array, value), 0, value);
};

export const sortedIndex = (array: Array<number>, value: number): number => {
  let low = 0;
  let high = array.length;

  while (low < high) {
    const mid = (low + high) >>> 1;
    if (array[mid] < value) {
      low = mid + 1;
    } else {
      high = mid;
    }
  }
  return low;
};
