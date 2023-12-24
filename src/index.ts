import process from 'node:process';
import {
    MonoTypeOperatorFunction,
    Observable,
    OperatorFunction,
    firstValueFrom,
    from,
    interval,
    mergeMap,
    tap,
} from 'rxjs';
import { DiscordApiClient } from './api/discord-api-client.class';
import { MinecraftServerStatusApiClient } from './api/minecraft-server-status-api-client.class';
import { ConfigLoader } from './file-system/config-loader.class';
import { CurrentDirectoryProvider } from './file-system/current-directory-provider.class';
import { FileSystem } from './file-system/file-system.class';
import { Config } from './models/config.type';
import { Player } from './models/player.type';
import { ServerStatus } from './models/server-status.type';
import { Store } from './store/store.class';
import { Logger } from './utils/logger.class';

const DISCORD_TOKEN = 'DISCORD_TOKEN';

function getDiscordToken(): string | null {
    return (
        process.argv
            .slice(2, process.argv.length)
            .map((arg) => arg.split('='))
            .filter((item) => (item?.length > 0 ? item[0] === DISCORD_TOKEN : false))
            .map((item) => (item?.length > 1 ? (item[1] as string) : null))?.[0] || null
    );
}

(async (): Promise<void> => {
    const logger: Logger = new Logger();

    logger.info('Minecraft Players Number Notifier v0.01');

    const currentDirectoryProvider = new CurrentDirectoryProvider();
    const fileSystem = new FileSystem();
    const configLoader = new ConfigLoader(currentDirectoryProvider, fileSystem);

    const config: Config | void = await firstValueFrom(configLoader.readConfigFile()).catch(
        (error) => logger.error(error),
    );

    if (!config) {
        return;
    }

    const store = new Store();
    const token: string | null = getDiscordToken();

    const discordApiClient: DiscordApiClient | null = config.discord
        ? new DiscordApiClient(config, logger, token)
        : null;

    const apiClient = new MinecraftServerStatusApiClient(config);

    function logNumberOfPlayers(server: string): MonoTypeOperatorFunction<unknown> {
        return tap((number) => logger.info(`Server ${server} has currently: ${number} players.`));
    }

    function logPlayerNames(
        getListOfPlayerNames: Observable<Player[]>,
        server: string,
    ): OperatorFunction<number, Player[]> {
        return mergeMap((online: number) =>
            getListOfPlayerNames.pipe(
                tap((players) => {
                    if (players.length > 0) {
                        logger.info(
                            `Players online: ${players.map((player) => player.name).join(', ')}`,
                        );
                    } else {
                        logger.warn(`Can't list names of online players on ${server}.`);
                    }
                }),
                tap((players: Player[]) => {
                    store.updateServerStatus({ server, online, players });
                }),
            ),
        );
    }

    function sendNotifications(status: ServerStatus): void {
        if (discordApiClient) {
            discordApiClient.sendMessage(status.server, status.online, status.players);
        }
    }

    interval(config.interval)
        .pipe(
            mergeMap(() => {
                return from((config.servers as string[]) || []);
            }),
            tap((server: string) => {
                const getNumberOfOnlinePlayers = apiClient.getNumberOfOnlinePlayers(server);
                const getListOfPlayerNames = apiClient.getPlayersList(server);

                firstValueFrom(
                    getNumberOfOnlinePlayers.pipe(
                        logNumberOfPlayers(server),
                        logPlayerNames(getListOfPlayerNames, server),
                    ),
                );
            }),
        )
        .subscribe();

    store
        .getServerStatuses()
        .pipe(mergeMap((statuses) => from(statuses)))
        .subscribe((status) => sendNotifications(status));
})();
