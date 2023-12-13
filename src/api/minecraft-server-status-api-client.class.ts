import fetch from 'node-fetch';
import { StatusResponse } from './status-response.type';
import { Logger } from '../utils/logger.class';

export class MinecraftServerStatusApiClient {
    private static readonly CacheTTL: number = 30000;

    private static StatusEndpoint = `https://api.mcsrvstat.us/3`;
    private static Cache = new Map<string, { timestamp: Date; response: StatusResponse }>();

    constructor(private logger: Logger) {}

    async getNumberOfOnlinePlayers(server: string, now: Date = new Date()): Promise<number | void> {
        const cached = MinecraftServerStatusApiClient.Cache.get(server);

        if (cached?.timestamp && +cached.timestamp + MinecraftServerStatusApiClient.CacheTTL < +now) {
            return cached.response.players.online;
        }

        return await fetch(`${MinecraftServerStatusApiClient.StatusEndpoint}/${server}`)
            .then((response) => response.json() as unknown as StatusResponse)
            .then((json: StatusResponse) => {
                MinecraftServerStatusApiClient.Cache.set(server, { timestamp: now, response: json });

                return json.players.online;
            })
            .catch((error) => {
                this.logger.error(error);
            });
    }
}
