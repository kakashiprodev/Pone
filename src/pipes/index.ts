/**
 * round a number to a given number of decimals
 */
export const round = (value: number, decimals: number = 3): number => {
  return Number(Math.round(Number(value + 'e' + decimals)) + 'e-' + decimals);
};

/**
 * divide by 1000 to get the value in tons
 */
export const toTons = (value: number): number => {
  return value / 1000;
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
