import { firstValueFrom, lastValueFrom } from 'rxjs';
import { FileSystem } from '../file-system/file-system.class';
import { FileSystemMock } from '../file-system/file-system.mock.class';
import { FILE_INFORMATION_READING_ERROR_MESSAGE } from './file-reader.consts';
import { JsonFileReader } from './json-file-reader.class';
import { JSON_FILE_PARSING_ERROR_MESSAGE } from './json-file-reader.consts';

describe('JsonFileReader', () => {
    let fileSystem: FileSystem;
    let reader: JsonFileReader;

    beforeEach(() => {
        fileSystem = new FileSystemMock();
        reader = new JsonFileReader(fileSystem);
    });

    describe('readFile', async () => {
        it('should read text file', async () => {
            jest.spyOn(fileSystem, 'readFile');

            await lastValueFrom(reader.readFile('test.json'));

            const call = jest.mocked(fileSystem.readFile).mock.calls[0];
            expect(call[0]).toBe('test.json');
            expect(call[1]).toBe('utf-8');
            expect(typeof call[2]).toBe('function');
        });

        it('should throw error when file is invalid json', async () => {
            try {
                await firstValueFrom(reader.readFile('test.txt'));
            } catch (error: any) {
                expect(error?.message).toBe(JSON_FILE_PARSING_ERROR_MESSAGE);
            }
        });

        it('should throw error when file does not exist', async () => {
            try {
                await firstValueFrom(reader.readFile('not-existing-file.bin'));
            } catch (error: any) {
                expect(error).toContain(FILE_INFORMATION_READING_ERROR_MESSAGE);
            }
        });
    });

    describe('readFiles', async () => {
        it('should read multiple text files', async () => {
            jest.spyOn(fileSystem, 'readFile');

            await lastValueFrom(reader.readFiles(['test.json', 'test2.json', 'test3.json']));

            const calls = jest.mocked(fileSystem.readFile).mock.calls;
            expect(calls.length).toBe(3);
        });
    });
});
