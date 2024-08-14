import fs from 'fs/promises';
import { EOL } from 'os';

const LOG_PATH = process.env.LOG_PATH ?? '.';
const LOG_LEVEL = process.env.LOG_LEVEL?.toLowerCase() ?? 'debug';

export class ErrorWithLogging extends Error {
  constructor(
    message: string,
    type: 'warn' | 'error' | 'debug',
    module?: string,
  ) {
    super(message);
    this.name = this.constructor.name;
  }

  public async logErrorToFile(
    message: string,
    type: 'warn' | 'error' | 'debug',
    module?: string,
  ) {
    const logMessage = `[${new Date().toISOString()}] ${
      module ?? ''
    }: ${message}${EOL}`;
    let write = false;
    if (type === 'debug' && LOG_LEVEL === 'debug') write = true;
    else if (type === 'error' && LOG_LEVEL === 'error') write = true;
    else if (type === 'warn' && LOG_LEVEL === 'warn') write = true;
    console.error(logMessage);
    if (write) await fs.appendFile(LOG_PATH, logMessage, 'utf8');
  }
}
