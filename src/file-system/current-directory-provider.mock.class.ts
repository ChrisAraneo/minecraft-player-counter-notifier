import { CurrentDirectoryProvider } from './current-directory-provider.class';

export class CurrentDirectoryProviderMock extends CurrentDirectoryProvider {
    getCurrentDirectory(): string {
        return 'test-directory';
    }
}
