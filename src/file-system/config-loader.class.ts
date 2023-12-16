import Path from 'path';
import { JsonFile } from '../models/json-file.class';
import { CurrentDirectoryProvider } from './current-directory-provider.class';
import { JsonFileReader } from './json-file-reader.class';
import { FileSystem } from './file-system.class';
import { Observable, catchError, map } from 'rxjs';

export class ConfigLoader {
    private jsonFileReader: JsonFileReader;

    constructor(
        protected currentDirectoryProvider: CurrentDirectoryProvider,
        protected fileSystem: FileSystem,
    ) {
        this.jsonFileReader = new JsonFileReader(fileSystem);
    }

    readConfigFile(): Observable<object> {
        const currentDirectory = this.currentDirectoryProvider.getCurrentDirectory();
        const path = Path.normalize(`${currentDirectory}/config.json`);

        return this.jsonFileReader.readFile(path).pipe(
            catchError(() => {
                throw Error(
                    "Could not read config.json file. If it doesn't exist then create config.json file in the application directory.",
                );
            }),
            map((result) => {
                if (!result) {
                    throw Error('File config.json is empty or incorrect.');
                } else {
                    return (result as JsonFile)?.getContent();
                }
            }),
        );
    }
}
