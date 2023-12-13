import fetch from 'node-fetch';
import { StatusResponse } from './status-response.type';
import { Logger } from '../utils/logger.class';

export class McApiClient {
    private static readonly CacheTTL: number = 30000;

    private static StatusEndpoint = `https://api.mcsrvstat.us/3`;
    private static Cache = new Map<string, { timestamp: Date; response: StatusResponse }>();

    constructor(private logger: Logger) {}

    async getNumberOfOnlinePlayers(server: string, now: Date = new Date()): Promise<number | void> {
        const cached = McApiClient.Cache.get(server);

        if (cached?.timestamp && +cached.timestamp + McApiClient.CacheTTL < +now) {
            return cached.response.players.online;
        }

        return await fetch(`${McApiClient.StatusEndpoint}/${server}`)
            .then((response) => response.json() as unknown as StatusResponse)
            .then((json: StatusResponse) => {
                McApiClient.Cache.set(server, { timestamp: now, response: json });

                return json.players.online;
            })
            .catch((error) => {
                this.logger.error(error);
            });
    }
}
