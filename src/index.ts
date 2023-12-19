import { firstValueFrom } from 'rxjs';
import { MinecraftServerStatusApiClient } from './api/minecraft-server-status-api-client.class';
import { ConfigLoader } from './file-system/config-loader.class';
import { Config } from './file-system/config.type';
import { CurrentDirectoryProvider } from './file-system/current-directory-provider.class';
import { FileSystem } from './file-system/file-system.class';
import { Logger } from './utils/logger.class';

(async (): Promise<void> => {
    const logger: Logger = new Logger();

    logger.info('Minecraft Players Number Notifier v0.01');

    const currentDirectoryProvider = new CurrentDirectoryProvider();
    const fileSystem = new FileSystem();
    const configLoader = new ConfigLoader(currentDirectoryProvider, fileSystem);

    const config: Config | void = await firstValueFrom(configLoader.readConfigFile()).catch(
        (error) => logger.error(error),
    );

    const apiClient = new MinecraftServerStatusApiClient();
    ((config && (config.servers as string[])) || []).forEach((server) => {
        apiClient.getNumberOfOnlinePlayers(server).subscribe((number) => {
            logger.info(`Server ${server} has currently: ${number} players.`);
        });

        apiClient.getPlayersList(server).subscribe((players) => {
            if (players.length > 0) {
                logger.info(`Players online: ${players.map((player) => player.name).join(', ')}`);
            } else {
                logger.warn(`Can't list names of online players on ${server}.`);
            }
        });
    });
})();
