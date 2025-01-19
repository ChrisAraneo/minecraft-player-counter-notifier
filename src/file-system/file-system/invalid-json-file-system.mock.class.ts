import { FileSystemMock } from './file-system.mock.class';

export class InvalidJsonFileSystemMock extends FileSystemMock {
  override readFile(
    _path: string,
    _options: unknown,
    callback: (err: NodeJS.ErrnoException | null, data: string) => void,
  ): void {
    callback(null, `Hello World!`);
  }
}
