export type Config = {
    'cache-ttl': number;
    discord?: {
        enabled: boolean;
        token: string;
    };
    servers: string[];
};
