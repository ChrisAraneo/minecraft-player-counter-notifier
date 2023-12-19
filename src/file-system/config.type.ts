export type Config = {
    servers: string[];
    discord?: {
        enabled: boolean;
        token: string;
    };
};
