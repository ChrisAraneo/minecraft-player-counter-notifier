export type Config = {
    'cache-ttl': number;
    'log-level': string;
    servers: string[];
    interval: number;
    recipients: string[];
    discord: boolean;
};
