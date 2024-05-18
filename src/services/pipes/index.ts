/**
 * Pipes will be used to transform data in the frontend without hassle
 */
import { globalStore } from '@/main';

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
export const toTons = (value: number): number => {
  if (globalStore.displayInTons) {
    return value / 1000;
  } else {
    return value;
  }
};

/**
 * get unit in tons or kg. depending on global settings
 */
export const getGlobalUnit = (): string => {
  if (globalStore.displayInTons) {
    return 't';
  } else {
    return 'kg';
  }
};

/**
 * divide by 1000 to get the value in tons as array
 */
export const toTonsArray = (values: number[]): number[] => {
  if (!globalStore.displayInTons) return values;
  return values.map((value) => value / 1000);
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

export const toReadableDate = (date: string | Date | null) => {
  if (date) {
    return new Date(date).getTime();
  }
  return '';
};
