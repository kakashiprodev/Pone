/**
 * A simple toast service for PrimeVue
 * This is also a wrapper to easily use the toast service with a one-liner
 */

import { app } from "./../main";

const STD_LIFETIME = 3000;

export function info(
  body: string,
  title: string = "Info",
  duration: number = STD_LIFETIME,
): void {
  app.config.globalProperties.$toast.add({
    severity: "success",
    summary: title,
    detail: body,
    life: duration,
  });
}

export function error(
  body: string,
  title: string = "Error",
  duration: number = STD_LIFETIME,
): void {
  app.config.globalProperties.$toast.add({
    severity: "error",
    summary: title,
    detail: body,
    life: duration,
  });
}
