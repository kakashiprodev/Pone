/**
 * A simple toast service for PrimeVue
 * This is also a wrapper to easily use the toast service with a one-liner
 */
import { info as _info, error as _error, warn as _warn } from './../../main';
const STD_LIFETIME = 5000;

export function info(
  body: string,
  title: string = 'Info',
  duration: number = STD_LIFETIME,
): void {
  _info(body, title, duration);
}

export function error(
  body: string,
  title: string = 'Error',
  duration: number = STD_LIFETIME,
): void {
  _error(body, title, duration);
}

export function warn(
  body: string,
  title: string = 'Warning',
  duration: number = STD_LIFETIME,
): void {
  _warn(body, title, duration);
}
