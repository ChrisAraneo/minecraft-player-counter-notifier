import { firstValueFrom, interval, mergeMap, tap } from 'rxjs';
import { MinecraftServerStatusApiClient } from './api/minecraft-server-status-api-client.class';
import { ConfigLoader } from './file-system/config-loader.class';
import { Config } from './models/config.type';
import { CurrentDirectoryProvider } from './file-system/current-directory-provider.class';
import { FileSystem } from './file-system/file-system.class';
import { Logger } from './utils/logger.class';
import { DiscordApiClient } from './api/discord-api-client.class';

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

    const discordApiClient: DiscordApiClient | null = config?.discord.enabled
        ? new DiscordApiClient(config, logger)
        : null;

    const apiClient = new MinecraftServerStatusApiClient(config);

    interval(config.interval)
        .pipe(
            tap(() => {
                ((config.servers as string[]) || []).forEach((server) => {
                    const getNumberOfOnlinePlayers = apiClient.getNumberOfOnlinePlayers(server);
                    const getListOfPlayerNames = apiClient.getPlayersList(server);

                    getNumberOfOnlinePlayers
                        .pipe(
                            tap((number) =>
                                logger.info(`Server ${server} has currently: ${number} players.`),
                            ),
                            mergeMap((number) =>
                                getListOfPlayerNames.pipe(
                                    tap((players) => {
                                        if (players.length > 0) {
                                            logger.info(
                                                `Players online: ${players
                                                    .map((player) => player.name)
                                                    .join(', ')}`,
                                            );
                                        } else {
                                            logger.warn(
                                                `Can't list names of online players on ${server}.`,
                                            );
                                        }

                                        if (discordApiClient) {
                                            discordApiClient.sendMessage(server, number, players);
                                        }
                                    }),
                                ),
                            ),
                        )
                        .subscribe(); // TODO Refactor into single subscription
                });
            }),
        )
        .subscribe();
})();
