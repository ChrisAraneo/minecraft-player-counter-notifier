import process from 'node:process';

export class Process {
    get argv(): string[] {
        return [...process.argv];
    }

    get env(): { [key: string]: string | undefined } {
        return process.env;
    }

    uptime(): number {
        return process.uptime();
    }
}
