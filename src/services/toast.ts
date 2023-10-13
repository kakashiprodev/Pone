import { app } from './../main';

const STD_LIFETIME = 3000;

export function info(
  body: string,
  title: string = 'Info',
  duration: number = STD_LIFETIME,
): void {
  app.config.globalProperties.$toast.add({
    severity: 'success',
    summary: title,
    detail: body,
    life: duration,
  });
}

export function error(
  body: string,
  title: string = 'Error',
  duration: number = STD_LIFETIME,
): void {
  app.config.globalProperties.$toast.add({
    severity: 'error',
    summary: title,
    detail: body,
    life: duration,
  });
}
