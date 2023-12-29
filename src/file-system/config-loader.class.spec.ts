import { firstValueFrom } from 'rxjs';
import { ConfigLoader } from './config-loader.class';
import { CONFIG_READING_ERROR_MESSAGE, INVALID_CONFIG_ERROR_MESSAGE } from './config-loader.consts';
import { CurrentDirectoryProvider } from './current-directory-provider.class';
import { CurrentDirectoryProviderMock } from './current-directory-provider.mock.class';
import { FileSystem } from './file-system.class';
import { FileSystemMock } from './file-system.mock.class';

let fileSystem: FileSystem;
let currentDirectoryProvider: CurrentDirectoryProvider;
let configLoader: ConfigLoader;

beforeEach(() => {
    currentDirectoryProvider = new CurrentDirectoryProviderMock();
});

describe('ConfigLoader', () => {
    it('#readConfigFile should return config object when file contains valid config', async () => {
        fileSystem = new FileSystemMock();
        configLoader = new ConfigLoader(currentDirectoryProvider, fileSystem);

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

    it('#readConfigFile should throw error when file contains invalid properties or values', async () => {
        fileSystem = new InvalidConfigFileSystemMock();
        configLoader = new ConfigLoader(currentDirectoryProvider, fileSystem);

        try {
            await firstValueFrom(configLoader.readConfigFile());
        } catch (error: any) {
            expect(error?.message).toBe(INVALID_CONFIG_ERROR_MESSAGE);
        }
    });

    it('#readConfigFile should throw error when file is invalid json', async () => {
        fileSystem = new InvalidJsonFileSystemMock();
        configLoader = new ConfigLoader(currentDirectoryProvider, fileSystem);

        try {
            await firstValueFrom(configLoader.readConfigFile());
        } catch (error: any) {
            expect(error?.message).toBe(CONFIG_READING_ERROR_MESSAGE);
        }
    });

    it('#readConfigFile should throw error when result of reading file is empty', async () => {
        fileSystem = new EmptyConfigFileSystemMock();
        configLoader = new ConfigLoader(currentDirectoryProvider, fileSystem);

        try {
            await firstValueFrom(configLoader.readConfigFile());
        } catch (error: any) {
            expect(error?.message).toBe(CONFIG_READING_ERROR_MESSAGE);
        }
    });
});

class InvalidConfigFileSystemMock extends FileSystemMock {
    readFile(_path: string, _options, callback: (error: any, data?: any) => any): void {
        callback(null, `{"interval": null, "recipients": false,"servers": ["1.1.1.1"]}`);
    }
}

class InvalidJsonFileSystemMock extends FileSystemMock {
    readFile(_path: string, _options, callback: (error: any, data?: any) => any): void {
        callback(null, `Hello World!`);
    }
}

class EmptyConfigFileSystemMock extends FileSystemMock {
    readFile(_path: string, _options, callback: (error: any, data?: any) => any): void {
        callback(null, undefined);
    }
}
