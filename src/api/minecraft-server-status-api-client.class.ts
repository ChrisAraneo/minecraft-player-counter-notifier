import { get, isArray, isBoolean, isNumber, isString } from 'lodash';
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

    getPlayersList(server: string, now: Date = new Date()): Observable<PlayersListResult> {
        return this.getServerStatus(server, now).pipe(
            map((response) => {
                if (this.isStatusResponse(response) && isArray(response?.players?.list)) {
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
                if (this.isStatusResponse(response) && isNumber(response?.players?.online)) {
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

                    if (response !== null) {
                        this.updateCache(server, now, response);
                        resolve(response);
                    } else {
                        resolve(cached?.response || null);
                    }
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

                if (this.isStatusResponse(json)) {
                    return json;
                } else {
                    throw Error('Json does not contain supported status response'); // TODO Update unit tests...
                }
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

    private isStatusResponse(json: unknown): json is StatusResponse {
        return [
            isString(get(json, 'ip')),
            isNumber(get(json, 'port')),
            isBoolean(get(json, 'debug.ping')),
            isBoolean(get(json, 'debug.query')),
            isBoolean(get(json, 'debug.srv')),
            isBoolean(get(json, 'debug.querymismatch')),
            isBoolean(get(json, 'debug.ipinsrv')),
            isBoolean(get(json, 'debug.cnameinsrv')),
            isBoolean(get(json, 'debug.animatedmotd')),
            isBoolean(get(json, 'debug.cachehit')),
            isNumber(get(json, 'debug.cachetime')),
            isNumber(get(json, 'debug.cacheexpire')),
            isNumber(get(json, 'debug.apiversion')),
            isArray(get(json, 'debug.apiversion')),
            this.isStringArray(get(json, 'motd.raw')),
            this.isStringArray(get(json, 'motd.clean')),
            this.isStringArray(get(json, 'motd.html')),
            isNumber(get(json, 'players.online')),
            isNumber(get(json, 'players.max')),
            isString(get(json, 'version')),
            isBoolean(get(json, 'online')),
            isNumber(get(json, 'protocol.version')),
            isString(get(json, 'protocol.name')),
            isString(get(json, 'hostname')),
            isString(get(json, 'icon')),
            isString(get(json, 'map.raw')),
            isString(get(json, 'map.clean')),
            isString(get(json, 'map.html')),
            isBoolean(get(json, 'eula_blocked')),
        ].every((value) => value === true);
    }

    private isStringArray(a: unknown): a is string[] {
        return isArray(a) && a.every((i) => isString(i));
    }
}
