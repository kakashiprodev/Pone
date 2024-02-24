/**
 * Pipes will be used to transform data in the frontend without hassle
 */

/**
 * round a number to a given number of decimals
 */
export const round = (value: number, decimals: number = 3): number => {
  return Number(Math.round(Number(value + 'e' + decimals)) + 'e-' + decimals);
};

/**
 * round array of numbers to a given number of decimals
 */
export const roundArray = (
  values: number[],
  decimals: number = 3,
): number[] => {
  return values.map((value) => round(value, decimals));
};

/**
 * divide by 1000 to get the value in tons
 */
export const toTons = (value: number, execute = true): number => {
  if (!execute) return value;
  return value / 1000;
};

/**
 * divide by 1000 to get the value in tons as array
 */
export const toTonsArray = (values: number[], execute = true): number[] => {
  if (!execute) return values;
  return values.map((value) => toTons(value, execute));
};

/**
 * round a number to a given number of decimals
 * and return a string with filled zeros as decimals if needed
 * also add thousand separators
 */
export const roundStringWithDecimals = (
  value: number,
  decimals: number = 3,
): string => {
  const rounded = round(value, decimals);
  return rounded.toLocaleString('de-DE', {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  });
};

/**
 * get a float number and check if it seems periodic
 * with 00000 or 99999 and will cut that after getting periodic
 */
export const roundString = (value: number): string => {
  return value + '';
};

/**
 * A date formatter to get a date in the format of 'MM.yyyy'
 */
export const dateToMonthYear = (date: Date | string): string => {
  return new Date(date).toLocaleDateString('de-DE', {
    month: '2-digit',
    year: 'numeric',
  });
};

/**
 * A date formatter to get a date in the format of 'yyyy'
 */
export const dateToYear = (date: Date | string): string => {
  return new Date(date).toLocaleDateString('de-DE', {
    year: 'numeric',
  });
};
