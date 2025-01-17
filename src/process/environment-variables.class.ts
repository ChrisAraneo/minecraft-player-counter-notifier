import { isString } from 'lodash';

import { Process } from './process.class';

export class EnvironmentVariables {
  constructor(private readonly process: Process) {}

  get(): Record<string, string | string[] | undefined> {
    const env = this.process.env;
    const keys = Object.keys(env || {});
    const result: Record<string, string | string[] | undefined> = {};

    keys.forEach((key) => {
      let value: string | string[] | undefined = env[key];

      if (isString(value) && value.indexOf(';') >= 0) {
        value = value.split(';');
      }

      result[key] = value;
    });

    return result;
  }
}
