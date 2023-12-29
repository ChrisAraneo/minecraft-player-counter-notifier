import fs, {
    MakeDirectoryOptions,
    NoParamCallback,
    PathLike,
    PathOrFileDescriptor,
    Stats,
    WriteFileOptions,
} from 'fs';
import { Abortable } from 'node:events';

export class FileSystem {
    readdir(
        path: PathLike,
        callback: (err: NodeJS.ErrnoException | null, files: string[]) => void,
    ): void {
        return fs.readdir(path, callback);
    }

    stat(
        path: PathLike,
        callback: (err: NodeJS.ErrnoException | null, stats: Stats) => void,
    ): void {
        return fs.stat(path, callback);
    }

    readFile(
        path: PathOrFileDescriptor,
        options:
            | ({
                  encoding: BufferEncoding;
                  flag?: string | undefined;
              } & Abortable)
            | BufferEncoding,
        callback: (err: NodeJS.ErrnoException | null, data: string) => void,
    ): void {
        return fs.readFile(path, options, callback);
    }

    writeFile(
        file: PathOrFileDescriptor,
        data: string | NodeJS.ArrayBufferView,
        options: WriteFileOptions,
        callback: NoParamCallback,
    ): void {
        return fs.writeFile(file, data, options, callback);
    }

    existsSync(path: PathLike): boolean {
        return fs.existsSync(path);
    }

    mkdirSync(
        path: PathLike,
        options: MakeDirectoryOptions & {
            recursive: true;
        },
        callback: (err: NodeJS.ErrnoException | null, path?: string | undefined) => void,
    ): void {
        return fs.mkdir(path, options, callback);
    }
}
