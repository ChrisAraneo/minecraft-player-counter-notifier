import path from 'path';

export abstract class File<T> {
    constructor(
        protected path: string,
        protected content: T,
        protected modifiedDate: Date,
    ) {}

    getPath(): string {
        return this.path;
    }

    getFilename(): string {
        const basename = path.basename(this.path);
        const parts = basename.split('.');
        parts.pop();

        return parts.join('.');
    }

    getExtension(): string | null {
        const basename = path.basename(this.path);
        const parts = basename.split('.');

        if (parts.length < 2) {
            return null;
        }

        return parts[parts.length - 1];
    }

    getContent(): T {
        return this.content;
    }

    getModifiedDate(): Date {
        return this.modifiedDate;
    }

    setFilename(filename: string, extension: string | null = this.getExtension()): void {
        const basename = path.basename(this.path);
        const basenameIndex = this.path.lastIndexOf(basename);

        this.path =
            this.path.substring(0, basenameIndex) + filename + (extension ? '.' + extension : '');
    }

    setPath(path: string): void {
        this.path = path;
    }
}
