import { MakeDirectoryOptions, PathLike } from 'fs';
import { FileSystem } from '@chris.araneo/file-system';

export class FileSystemMock extends FileSystem {
    readdir(
        _path: PathLike,
        callback: (err: NodeJS.ErrnoException | null, files: string[]) => void,
    ): void {
        callback(null, [
            'test.txt',
            'test2.txt',
            'test3.txt',
            'test.json',
            'test2.json',
            'test3.json',
        ]);
    }

    stat(path: string, callback: (error: any, data?: any) => any): void {
        if (
            this.isCorrectTextFile(path) ||
            this.isCorrectEncryptedFile(path) ||
            this.isCorrectJsonFile(path) ||
            this.isCorrectConfigFile(path)
        ) {
            callback(null, {
                mtime: '2023-10-27T21:33:39.661Z',
            });
        } else {
            callback('Error');
        }
    }

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    readFile(path: string, _options, callback: (error: any, data?: any) => any): void {
        if (this.isCorrectTextFile(path)) {
            callback(null, 'Hello World!');
        } else if (this.isCorrectEncryptedFile(path)) {
            callback(null, 'U2FsdGVkX19B53TiyfRaPnNzSe5uo2K8dIO/fD5h+slCLO30KJAjw4HGKxqRBgGC');
        } else if (this.isCorrectConfigFile(path)) {
            callback(
                null,
                `{
                    "cache-ttl": 30000,
                    "discord": true,
                    "interval": 60000,
                    "log-level": "debug",
                    "recipients": [],
                    "servers": ["0.0.0.0"]
                }`,
            );
        } else if (this.isCorrectJsonFile(path)) {
            callback(null, '{"name":"Joel"}');
        } else {
            callback('Error');
        }
    }

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    writeFile(_path, _data, _options, _callback): Promise<void> {
        _callback();

        return;
    }

    existsSync(path: PathLike): boolean {
        return path !== 'notExistingDir';
    }

    mkdirSync(
        path: PathLike,
        options?: MakeDirectoryOptions & {
            recursive: true;
        },
        callback?: (err: NodeJS.ErrnoException | null, path?: string) => void,
    ): void {
        return callback(null, path as string);
    }

    private isCorrectTextFile(path: string): boolean {
        return ['test.txt', 'test2.txt', 'test3.txt'].includes(path);
    }

    private isCorrectEncryptedFile(path: string): boolean {
        return ['test.mbe', 'directory/test.mbe'].includes(path);
    }

    private isCorrectJsonFile(path: string): boolean {
        return ['test.json', 'test2.json', 'test3.json'].includes(path);
    }

    private isCorrectConfigFile(path: string): boolean {
        return path.includes('config.json');
    }
}
