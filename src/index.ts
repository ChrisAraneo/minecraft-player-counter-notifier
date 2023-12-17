import { MinecraftServerStatusApiClient } from './api/minecraft-server-status-api-client.class';
import { ConfigLoader } from './file-system/config-loader.class';
import { CurrentDirectoryProvider } from './file-system/current-directory-provider.class';
import { Logger } from './utils/logger.class';
import { FileSystem } from './file-system/file-system.class';
import { EMPTY, catchError, firstValueFrom } from 'rxjs';

(async () => {
    const logger: Logger = new Logger();

    logger.info('Minecraft Player Number Notifier v0.01');

    const currentDirectoryProvider = new CurrentDirectoryProvider();
    const fileSystem = new FileSystem();
    const configLoader = new ConfigLoader(currentDirectoryProvider, fileSystem);

    const config: any = await firstValueFrom(
        configLoader.readConfigFile().pipe(
            catchError((error) => {
                logger.error(error);

                return EMPTY;
            }),
        ),
    );

    const apiClient = new MinecraftServerStatusApiClient();
    (config.servers as string[]).forEach((server) => {
        apiClient.getPlayersList(server).subscribe((players) => {
            logger.info(`Server ${server} has currently: ${players.length} players.`);
            logger.info(`Players online: ${players.map((player) => player.name).join(', ')}`);
        });
    });
})();
