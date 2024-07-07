import { DISCORD_TOKEN, RECIPIENTS } from './argument-keys.consts';
import { Process } from './process.class';

export class ProcessMock extends Process {
    get argv(): string[] {
        return [
            'C:\\nodejs\\node.exe',
            'C:\\minecraft-players-number-notifier\\dist\\mpnn.js',
            `${DISCORD_TOKEN}=01234543210`,
            `${RECIPIENTS}=rec1;rec2;rec3`,
        ];
    }

    get env(): { [key: string]: string | undefined } {
        return {
            [DISCORD_TOKEN]: '01234543210',
            [RECIPIENTS]: 'rec1;rec2;rec3',
        };
    }
}
