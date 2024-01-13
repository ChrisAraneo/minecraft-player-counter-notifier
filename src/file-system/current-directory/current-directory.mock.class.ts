import { CurrentDirectory } from './current-directory.class';

export class CurrentDirectoryMock extends CurrentDirectory {
    getCurrentDirectory(): string {
        return 'test-directory';
    }
}
