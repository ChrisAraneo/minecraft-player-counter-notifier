import { Client, Events, Partials } from 'discord.js';
import { Observable, forkJoin, from } from 'rxjs';
import { Config } from '../models/config.type';
import { Player } from '../models/player.type';
import { Logger } from '../utils/logger.class';
import { SendMessageResult } from './send-message-result.type';

export class DiscordApiClient {
    private client: Client;
    private recipientIds: string[] = [];

    constructor(
        private config: Config,
        private logger: Logger,
        private token: string,
        recipientIds: string[] = [],
    ) {
        if (this.config?.discord) {
            this.initializeClient();
            this.addRecipients(recipientIds);
            this.login();
            this.subscribeToReceivingMessages();
        }
    }

    sendMessage(
        server: string,
        numberOfPlayers: number,
        playersList: Player[],
    ): Observable<SendMessageResult[]> {
        return forkJoin(
            this.recipientIds.map((id) =>
                from(
                    new Promise<SendMessageResult>((resolve) => {
                        this.client.users
                            .fetch(id)
                            .then((user) => {
                                this.logger.info(`Sending message to user: ${user.id}`);

                                if (numberOfPlayers === 0) {
                                    try {
                                        user.send(`No players on server ${server}`);
                                    } catch (error: unknown) {
                                        resolve({ success: false, error });
                                    }
                                } else {
                                    const manWalkingEmoji = String.fromCodePoint(0x1f6b6);

                                    try {
                                        user.send(
                                            `${numberOfPlayers} players ${manWalkingEmoji} on server ${server}: ${playersList
                                                .map((player) => player.name)
                                                .join(',')}`,
                                        );
                                    } catch (error: unknown) {
                                        resolve({ success: false, error });
                                    }
                                }

                                resolve({ success: true });
                            })
                            .catch((error: unknown) => {
                                resolve({ success: false, error });
                            });
                    }),
                ),
            ),
        );
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

            const user = this.recipientIds.find((id) => id === message.author.id);

            if (!user) {
                this.addRecipient(message.author.id);
            }

            const name = message.author.globalName;
            const wavingHandEmoji = String.fromCodePoint(0x1f44b);
            const thumbsUpEmoji = String.fromCodePoint(0x1f44d);

            message.author
                .send(
                    `Hello ${name} ${wavingHandEmoji}! I will notify you if new players join the MC servers ${thumbsUpEmoji}`,
                )
                .then(() => {})
                .catch((error) => {
                    this.logger.error(`Could not send message to ${name}`, ...error);
                });
        });
    }

    private addRecipients(ids: string[]): void {
        ids.forEach((id) => this.addRecipient(id));
    }

    private addRecipient(id: string): void {
        this.logger.info(`Adding recipient with ID: ${id}`);
        this.recipientIds.push(id);
    }
}
