import { get, isArray, isNumber } from 'lodash';
import { RequestInfo, RequestInit, Response } from 'node-fetch';
import { Observable, from, map, of } from 'rxjs';
import { Config } from '../models/config.type';
import { Logger } from '../utils/logger.class';
import { Cache } from './cache.type';
import { NumberOfOnlinePlayersResult } from './number-of-online-players-result.type';
import { PlayersListResult } from './players-list-result.type';
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

    static clearCache(): void {
        MinecraftServerStatusApiClient.Cache = new Map<string, Cache>();
    }

    getPlayersList(server: string, now: Date = new Date()): Observable<PlayersListResult> {
        return this.getServerStatus(server, now).pipe(
            map((response) => {
                if (isArray(get(response, 'players.list'))) {
                    return {
                        success: true,
                        players: response.players.list,
                    };
                } else {
                    return {
                        success: false,
                    };
                }
            }),
        );
    }

    getNumberOfOnlinePlayers(
        server: string,
        now: Date = new Date(),
    ): Observable<NumberOfOnlinePlayersResult> {
        return this.getServerStatus(server, now).pipe(
            map((response) => {
                if (isNumber(get(response, 'players.online'))) {
                    return {
                        success: true,
                        online: response.players.online,
                    };
                } else {
                    return {
                        success: false,
                    };
                }
            }),
        );
    }

    private getServerStatus(server: string, now: Date): Observable<StatusResponse | null> {
        const cached = this.getCache(server);

        if (this.isCacheOutdated(cached, now)) {
            return from(
                new Promise<StatusResponse>(async (resolve) => {
                    let response: StatusResponse | null;

                    try {
                        response = await this.fetchServerStatus(server);
                    } catch (error: unknown) {
                        this.logger.error(`Error while fetching server status`);
                        response = null;
                    }

                    this.updateCache(server, now, response);
                    resolve(response);
                }),
            );
        } else {
            this.logger.debug(
                `Status cache didn't expire yet ${
                    new Date(cached?.timestamp || 0).toISOString() + ' < ' + now.toISOString()
                }`,
            );

            return of(cached?.response || null);
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
        return !cached?.timestamp || +cached.timestamp + this.CacheTTL < +now;
    }

    private updateCache(server: string, timestamp: Date, response: StatusResponse): void {
        MinecraftServerStatusApiClient.Cache.set(server, {
            timestamp: timestamp,
            response: response,
        });
    }
}
