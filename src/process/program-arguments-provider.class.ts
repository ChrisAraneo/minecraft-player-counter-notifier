import { ArgumentKey } from './argument-key.type';
import { DISCORD_TOKEN, RECIPIENTS } from './argument-keys.consts';
import { Argument } from './argument.type';
import { Process } from './process.class';
import {
    INCORRECT_ARGUMENT_KEY_ERROR_MESSAGE,
    INCORRECT_ARGUMENT_VALUE_ERROR_MESSAGE,
} from './program-arguments-provider.consts';

export class ProgramArgumentsProvider {
    private arguments?: string[];

    constructor(private process: Process) {
        this.initialize();
    }

    load(): Argument[] {
        return this.arguments.map((argument) => {
            const parts = argument.split('=');

            if (parts.length > 1) {
                const key: string = parts[0];

                if (!this.isArgumentKeyValid(key)) {
                    throw Error(INCORRECT_ARGUMENT_KEY_ERROR_MESSAGE);
                }

                const valueParts = parts[1].split(';');

                return {
                    key: key,
                    value: valueParts.length > 1 ? valueParts : valueParts[0],
                };
            } else {
                throw Error(INCORRECT_ARGUMENT_VALUE_ERROR_MESSAGE);
            }
        });
    }

    private initialize(): void {
        if (!this.arguments) {
            this.arguments = this.process.argv.slice(2, process.argv.length);
        }
    }

    private isArgumentKeyValid(key: string): key is ArgumentKey {
        return key === DISCORD_TOKEN || key === RECIPIENTS;
    }
}
