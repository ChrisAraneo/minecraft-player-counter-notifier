import { Process } from './process.class';

export class EnvironmentVariables {
    constructor(private readonly process: Process) {}

    get(): { [key: string]: string | string[] | undefined } {
        const env = this.process.env;
        const keys = Object.keys(env || {});
        const result = {};

        keys.forEach((key) => {
            let value: string | string[] = env[key];

            if (value.indexOf(';') >= 0) {
                value = value.split(';');
            }

            result[key] = value;
        });

        return result;
    }
}
