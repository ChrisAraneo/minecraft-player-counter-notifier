import { Observable, forkJoin } from 'rxjs';
import { File } from '../../models/file.class';
import { FileSystem } from '../file-system/file-system.class';
import {
    FILE_CONTENT_READING_ERROR_MESSAGE,
    FILE_INFORMATION_READING_ERROR_MESSAGE,
} from './file-reader.consts';
import { ReadFileResult } from './read-file-result.type';

export abstract class FileReader<T extends File<any>> {
    constructor(protected fileSystem: FileSystem) {}

    readFiles(paths: string[]): Observable<T[]> {
        return forkJoin(paths.map((path: string) => this.readFile(path)));
    }

    protected _readFile(path: string, encoding: BufferEncoding): Observable<ReadFileResult> {
        return new Observable((subscriber) => {
            this.fileSystem.stat(path, (error: unknown, stats) => {
                if (error) {
                    subscriber.error(
                        `${FILE_INFORMATION_READING_ERROR_MESSAGE} (${path}): ${JSON.stringify(
                            error,
                        )}`,
                    );
                } else {
                    this.fileSystem.readFile(path, encoding, (error: unknown, data: string) => {
                        if (error) {
                            subscriber.error(
                                `${FILE_CONTENT_READING_ERROR_MESSAGE} (${path}): ${JSON.stringify(
                                    error,
                                )}`,
                            );
                        } else {
                            subscriber.next({ path, data, modifiedDate: new Date(stats.mtime) });
                            subscriber.complete();
                        }
                    });
                }
            });
        });
    }

    abstract readFile(path: string): Observable<T>;
}
