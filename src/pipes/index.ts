/**
 * round a number to a given number of decimals
 */
export const round = (value: number, decimals: number = 2): number => {
  return Number(Math.round(Number(value + "e" + decimals)) + "e-" + decimals);
};

/**
 * get a float number and check if it seems periodic
 * with 00000 or 99999 and will cut that after getting periodic
 */
export const roundString = (value: number): string => {
  return value + "";
};
