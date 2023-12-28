import { firstValueFrom } from 'rxjs';
import { ConfigLoader } from './config-loader.class';
import { CurrentDirectoryProvider } from './current-directory-provider.class';
import { CurrentDirectoryProviderMock } from './current-directory-provider.mock.class';
import { FileSystem } from './file-system.class';
import { FileSystemMock } from './file-system.mock.class';

let fileSystem: FileSystem;
let currentDirectoryProvider: CurrentDirectoryProvider;
let configLoader: ConfigLoader;

beforeEach(() => {
    fileSystem = new FileSystemMock();
    currentDirectoryProvider = new CurrentDirectoryProviderMock();
    configLoader = new ConfigLoader(currentDirectoryProvider, fileSystem);
});

describe('ConfigLoader', () => {
    it('#readConfigFile should read config.json', async () => {
        const config = await firstValueFrom(configLoader.readConfigFile());

        expect(config).toStrictEqual({
            'cache-ttl': 30000,
            discord: true,
            interval: 60000,
            'log-level': 'debug',
            recipients: [],
            servers: ['0.0.0.0'],
        });
    });
});
