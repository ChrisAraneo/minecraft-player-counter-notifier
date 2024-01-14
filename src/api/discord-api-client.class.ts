import { Client, Events, Partials } from 'discord.js';
import { BehaviorSubject, Subscription, debounceTime } from 'rxjs';
import { Config } from '../models/config.type';
import { Player } from '../models/player.type';
import { Logger } from '../utils/logger.class';
import { DiscordApiMessage } from './discord-api-message.class';

export class DiscordApiClient {
    private client: Client;
    private recipientIds: string[] = [];
    private messagesToSend = new BehaviorSubject<DiscordApiMessage[]>([]);
    private subscription = new Subscription();

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
            this.subscribeToMessagesToSend();
        }
    }

    sendMessage(server: string, numberOfPlayers: number, playersList: Player[]): void {
        this.recipientIds.forEach((id) => {
            this.client.users.fetch(id).then((user) => {
                this.pushMessageToSend(
                    new DiscordApiMessage(user.id, server, numberOfPlayers, playersList),
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

    private pushMessageToSend(message: DiscordApiMessage): void {
        const currentMessages = this.messagesToSend.getValue();
        const found = currentMessages.find((item) => item.getId() === message.getId());

        if (!found) {
            this.logger.info(`Adding message to queue: ${message.getId()}`);
            this.messagesToSend.next([...currentMessages, message]);
        }
    }

    private subscribeToMessagesToSend(): void {
        this.subscription.add(
            this.messagesToSend
                .asObservable()
                .pipe(debounceTime(1000))
                .subscribe((messages) => {
                    Promise.all(
                        messages.map(
                            (message) =>
                                new Promise<void>((resolve) => {
                                    const recipientId = message.getRecipientId();

                                    this.client.users.fetch(recipientId).then((user) => {
                                        this.logger.info(
                                            `Sending message ${message.getId()} to user: ${
                                                user.id
                                            }`,
                                        );

                                        user.send(message.getMessage())
                                            .then(() => {
                                                this.logger.info(
                                                    `Message ${message.getId()} successfully sent to user: ${
                                                        user.id
                                                    }`,
                                                );

                                                resolve();
                                            })
                                            .catch(() => {
                                                this.logger.error(
                                                    `Error while sending message ${message.getId()} to user: ${
                                                        user.id
                                                    }`,
                                                );
                                                // TODO Error handling
                                                resolve();
                                            });
                                    });
                                }),
                        ),
                    ).then(() => {
                        this.messagesToSend.next(
                            this.messagesToSend.getValue().filter((item) => {
                                return !messages
                                    .map((message) => message.getId())
                                    .find((id) => id === item.getId());
                            }),
                        );
                    });
                }),
        );
    }
}
