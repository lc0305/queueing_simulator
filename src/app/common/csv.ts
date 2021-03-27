// tslint:disable-next-line: ban-types
export const toCSV = <H extends Object, V extends Object>(head: Array<H>, values: Array<Array<V>>, delimiter = ';'): string => {
  return head.join(delimiter) + '\n' + values.reduce((csvStr, row) => csvStr + row.join(delimiter) + '\n', '');
};

export const saveCSV = (filename: string, csvStr: string): void => {
  const blob = new Blob([csvStr], { type: 'text/csv;charset=utf-8;' });
  filename = `${filename}.csv`;
  if (navigator.msSaveBlob) {
    navigator.msSaveBlob(blob, filename);
  } else {
    const link = document.createElement('a');
    if (link.download !== undefined) {
      const url = URL.createObjectURL(blob);
      link.setAttribute('href', url);
      link.setAttribute('download', filename);
      link.style.visibility = 'hidden';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  }
};
