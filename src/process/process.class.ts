import process from 'node:process';

export class Process {
    get argv(): string[] {
        return [...process.argv];
    }

    uptime(): number {
        return process.uptime();
    }
}
