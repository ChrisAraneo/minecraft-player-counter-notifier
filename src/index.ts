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
import { ConfigLoader } from './file-system/config-loader/config-loader.class';
import { CurrentDirectory } from './file-system/current-directory/current-directory.class';
import { FileSystem } from './file-system/file-system/file-system.class';
import { Config } from './models/config.type';
import { Player } from './models/player.type';
import { ServerStatus } from './models/server-status.type';
import { DISCORD_TOKEN, RECIPIENTS } from './process/argument-keys.consts';
import { Process } from './process/process.class';
import { ProgramArguments } from './process/program-arguments.class';
import { Store } from './store/store.class';
import { LogLevel } from './utils/log-level.type';
import { Logger } from './utils/logger.class';

(async (): Promise<void> => {
    const process = new Process();
    const programArguments = new ProgramArguments(process);
    const currentDirectory = new CurrentDirectory();
    const fileSystem = new FileSystem();
    const configLoader = new ConfigLoader(currentDirectory, fileSystem);
    const config: Config | void = await firstValueFrom(configLoader.readConfigFile()).catch(
        (error) => logger.error(error),
    );
    const store = new Store();

    if (!config) {
        return;
    }

    const logger: Logger = new Logger(config?.['log-level'] as LogLevel);

    logger.info('Minecraft Players Number Notifier v0.01');
    logger.info(`Program arguments: ${JSON.stringify(process.argv)}`);

    const args = programArguments.load();
    const token: string | null = (args.find((item) => item.key === DISCORD_TOKEN)?.value ||
        null) as string | null;
    const predefinedRecipients = (args.find((item) => item.key === RECIPIENTS)?.value || []) as
        | string
        | string[];
    const discordApiClient: DiscordApiClient | null = config.discord
        ? new DiscordApiClient(
              config,
              logger,
              token,
              Array.isArray(predefinedRecipients)
                  ? [...predefinedRecipients]
                  : [predefinedRecipients],
          )
        : null;
    const apiClient = new MinecraftServerStatusApiClient(config, logger);

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
