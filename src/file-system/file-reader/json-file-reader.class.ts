import { Observable, map } from 'rxjs';
import { JsonFile } from '../../models/json-file.class';
import { FileReader } from './file-reader.class';
import { JSON_FILE_PARSING_ERROR_MESSAGE } from './json-file-reader.consts';
import { ReadFileResult } from './read-file-result.type';

export class JsonFileReader extends FileReader<JsonFile> {
    readFile(path: string): Observable<JsonFile> {
        return this._readFile(path, 'utf-8').pipe(
            map((result: ReadFileResult) => {
                let content: object | undefined;

                try {
                    content = JSON.parse(result.data);
                } catch (error: unknown) {
                    throw Error(JSON_FILE_PARSING_ERROR_MESSAGE);
                }

                return new JsonFile(result.path, content, result.modifiedDate);
            }),
        );
    }
}
