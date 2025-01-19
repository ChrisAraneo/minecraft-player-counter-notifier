import { FileSystemMock } from './file-system.mock.class';

export class InvalidConfigFileSystemMock extends FileSystemMock {
  override readFile(
    _path: string,
    _options: unknown,
    callback: (err: NodeJS.ErrnoException | null, data: string) => void,
  ): void {
    callback(
      null,
      `{"interval": null, "recipients": false,"servers": ["1.1.1.1"]}`,
    );
  }
}
