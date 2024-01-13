import { firstValueFrom } from 'rxjs';
import { CurrentDirectory } from '../current-directory/current-directory.class';
import { CurrentDirectoryMock } from '../current-directory/current-directory.mock.class';
import { FileSystem } from '../file-system/file-system.class';
import { FileSystemMock } from '../file-system/file-system.mock.class';
import { ConfigLoader } from './config-loader.class';
import { CONFIG_READING_ERROR_MESSAGE, INVALID_CONFIG_ERROR_MESSAGE } from './config-loader.consts';

describe('ConfigLoader', () => {
    let fileSystem: FileSystem;
    let currentDirectory: CurrentDirectory;
    let configLoader: ConfigLoader;

    beforeEach(() => {
        currentDirectory = new CurrentDirectoryMock();
    });

    describe('readConfigFile', () => {
        it('should return config object when file contains valid config', async () => {
            fileSystem = new FileSystemMock();
            configLoader = new ConfigLoader(currentDirectory, fileSystem);

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

        it('should throw error when file contains invalid properties or values', async () => {
            fileSystem = new InvalidConfigFileSystemMock();
            configLoader = new ConfigLoader(currentDirectory, fileSystem);

            try {
                await firstValueFrom(configLoader.readConfigFile());
            } catch (error: any) {
                expect(error?.message).toBe(INVALID_CONFIG_ERROR_MESSAGE);
            }
        });

        it('should throw error when file is invalid json', async () => {
            fileSystem = new InvalidJsonFileSystemMock();
            configLoader = new ConfigLoader(currentDirectory, fileSystem);

            try {
                await firstValueFrom(configLoader.readConfigFile());
            } catch (error: any) {
                expect(error?.message).toBe(CONFIG_READING_ERROR_MESSAGE);
            }
        });

        it('should throw error when result of reading file is empty', async () => {
            fileSystem = new EmptyConfigFileSystemMock();
            configLoader = new ConfigLoader(currentDirectory, fileSystem);

            try {
                await firstValueFrom(configLoader.readConfigFile());
            } catch (error: any) {
                expect(error?.message).toBe(CONFIG_READING_ERROR_MESSAGE);
            }
        });
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
