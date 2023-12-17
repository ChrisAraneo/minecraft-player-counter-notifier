import { Player } from "./player.type";

export type StatusResponse = {
    ip: string;
    port: number;
    debug: {
        ping: boolean;
        query: boolean;
        srv: boolean;
        querymismatch: boolean;
        ipinsrv: boolean;
        cnameinsrv: boolean;
        animatedmotd: boolean;
        cachehit: boolean;
        cachetime: number;
        cacheexpire: number;
        apiversion: number;
        dns: {
            srv: any[];
            srv_a: any[];
        };
    };
    motd: {
        raw: string[];
        clean: string[];
        html: string[];
    };
    players: {
        online: number;
        max: number;
        list?: Player[]
    };
    version: string;
    online: boolean;
    protocol: {
        version: number;
        name: string;
    };
    hostname: string;
    icon: string;
    map: {
        raw: string;
        clean: string;
        html: string;
    };
    eula_blocked: boolean;
};
