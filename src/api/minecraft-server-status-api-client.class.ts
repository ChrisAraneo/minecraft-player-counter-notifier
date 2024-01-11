import { RequestInfo, RequestInit, Response } from 'node-fetch';
import { Observable, from, map, of } from 'rxjs';
import { Config } from '../models/config.type';
import { Player } from '../models/player.type';
import { Logger } from '../utils/logger.class';
import { Cache } from './cache.type';
import { StatusResponse } from './status-response.type';

export class MinecraftServerStatusApiClient {
    private static StatusEndpoint = `https://api.mcsrvstat.us/3`;
    private static Cache = new Map<string, Cache>();

    private readonly CacheTTL: number;

    constructor(
        private config: Config,
        private logger: Logger,
        private fetch: (url: URL | RequestInfo, init?: RequestInit) => Promise<Response>,
    ) {
        this.CacheTTL = this.config['cache-ttl'];
    }

    getPlayersList(server: string, now: Date = new Date()): Observable<Player[]> {
        return this.getServerStatus(server, now).pipe(
            map((response) => response.players.list || []),
        );
    }

    getNumberOfOnlinePlayers(server: string, now: Date = new Date()): Observable<number> {
        return this.getServerStatus(server, now).pipe(map((response) => response.players.online));
    }

    private getServerStatus(server: string, now: Date): Observable<StatusResponse> {
        const cached = this.getCache(server);

        if (this.isCacheOutdated(cached, now)) {
            return from(
                this.fetchServerStatus(server).then((response) => {
                    this.updateCache(server, now, response);

                    return response;
                }),
            );
        } else {
            this.logger.debug(
                `Status cache didn't expire yet ${
                    new Date(cached?.timestamp || 0).toISOString() + ' < ' + now.toISOString()
                }`,
            );

            return of(cached?.response);
        }
    }

    private async fetchServerStatus(server: string): Promise<StatusResponse> {
        const url = `${MinecraftServerStatusApiClient.StatusEndpoint}/${server}`;

        this.logger.debug(`GET ${url}`);

        return this.fetch(url)
            .then((response) => response.json() as unknown as StatusResponse)
            .then((json) => {
                this.logger.debug(`GET response`, json);

                return json;
            });
    }

    private getCache(server: string): Cache | undefined {
        return MinecraftServerStatusApiClient.Cache.get(server);
    }

    private isCacheOutdated(cached: Cache | undefined, now: Date): boolean {
        return !cached?.timestamp || +cached.timestamp + this.CacheTTL > +now;
    }

    private updateCache(server: string, timestamp: Date, response: StatusResponse): void {
        MinecraftServerStatusApiClient.Cache.set(server, {
            timestamp: timestamp,
            response: response,
        });
    }
}
