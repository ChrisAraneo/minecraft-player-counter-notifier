import { DISCORD_TOKEN, RECIPIENTS } from './argument-keys.consts';
import { Process } from './process.class';
import { ProcessMock } from './process.mock.class';
import { ProgramArgumentsProvider } from './program-arguments-provider.class';

let process: Process;
let programArgumentsProvider: ProgramArgumentsProvider;

beforeEach(() => {
    process = new ProcessMock();
    programArgumentsProvider = new ProgramArgumentsProvider(process);
});

describe('ProgramArgumentsProvider', () => {
    it('#load should return list of arguments when program executed with valid arguments', async () => {
        const args = programArgumentsProvider.load();

        expect(args).toStrictEqual([
            { key: DISCORD_TOKEN, value: '01234543210' },
            { key: RECIPIENTS, value: ['rec1', 'rec2', 'rec3'] },
        ]);
    });
});
