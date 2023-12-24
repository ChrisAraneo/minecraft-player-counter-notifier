import { Client, Events, Partials } from 'discord.js';
import { Config } from '../models/config.type';
import { Logger } from '../utils/logger.class';
import { Player } from '../models/player.type';

export class DiscordApiClient {
    private client: Client;
    private userIds: string[] = [];

    constructor(
        private config: Config,
        private logger: Logger,
        private token: string,
    ) {
        if (this.config?.discord) {
            this.initializeClient();
            this.login();
            this.subscribeToReceivingMessages();
        }
    }

    sendMessage(server: string, numberOfPlayers: number, playersList: Player[]): void {
        this.userIds.forEach((id) => {
            this.client.users.fetch(id).then((user) => {
                this.logger.info(`Sending message to user ${user.id}`);

                user.send(
                    `${numberOfPlayers}\t players on server ${server} (${playersList
                        .map((player) => player.name)
                        .join(',')})`,
                );
            });
        });
    }

    private initializeClient(): void {
        this.logger.info(`Discord bot is enabled. Initializing...`);
        this.client = new Client({
            partials: [Partials.User, Partials.Channel, Partials.Reaction],
            intents: ['Guilds', 'GuildMessages'],
        });
    }

    private login(): Promise<void> {
        return new Promise((resolve, reject) => {
            try {
                this.client.once(Events.ClientReady, (client) => {
                    this.logger.info(`Discord bot is ready. Logged as: ${client.user.tag}`);
                    resolve();
                });
                this.client.login(this.token);
            } catch (error) {
                reject(error);
            }
        });
    }

    private subscribeToReceivingMessages(): void {
        this.client.on(Events.MessageCreate, (message) => {
            if (message.author.bot) {
                return;
            }

            const user = this.userIds.find((id) => id === message.author.id);

            if (!user) {
                this.userIds.push(message.author.id);
            }

            const name = message.author.globalName;

            message.author
                .send(`Hello ${name}! I will notify you if new players join the MC servers.`)
                .then(() => {})
                .catch((error) => {
                    this.logger.error(`Could not send message to ${name}`, ...error);
                });
        });
    }
}
