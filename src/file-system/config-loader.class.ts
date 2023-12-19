import Path from 'path';
import { JsonFile } from '../models/json-file.class';
import { CurrentDirectoryProvider } from './current-directory-provider.class';
import { JsonFileReader } from './json-file-reader.class';
import { FileSystem } from './file-system.class';
import { Observable, catchError, map } from 'rxjs';
import { Config } from './config.type';

export class ConfigLoader {
    private jsonFileReader: JsonFileReader;

    constructor(
        protected currentDirectoryProvider: CurrentDirectoryProvider,
        protected fileSystem: FileSystem,
    ) {
        this.jsonFileReader = new JsonFileReader(fileSystem);
    }

    readConfigFile(): Observable<Config> {
        const currentDirectory = this.currentDirectoryProvider.getCurrentDirectory();
        const path = Path.normalize(`${currentDirectory}/config.json`);

        return this.jsonFileReader.readFile(path).pipe(
            catchError(() => {
                throw Error(
                    "Could not read config.json file. If it doesn't exist then create config.json file in the application directory.",
                );
            }),
            map((result: unknown) => {
                if (!result) {
                    throw Error('File config.json is empty.');
                }

                const content: unknown = (result as JsonFile)?.getContent();

                if (this.isConfig(content)) {
                    return content;
                } else {
                    throw Error('File config.json contains invalid config.');
                }
            }),
        );
    }

    private isConfig(object: unknown): object is Config {
        const validServers = this.isStringArray((<Config>object).servers);
        const validDiscord =
            (<Config>object).discord === undefined ||
            (<Config>object).discord === null ||
            (typeof (<Config>object).discord === 'object' &&
                typeof (<Config>object).discord.token === 'string' &&
                typeof (<Config>object).discord.enabled === 'boolean');

        return validServers && validDiscord;
    }

    private isStringArray(object: unknown): object is string[] {
        return Array.isArray(object) && object.every((i) => typeof i === 'string');
    }
}
