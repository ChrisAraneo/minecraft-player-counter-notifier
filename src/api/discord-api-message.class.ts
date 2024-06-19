import crypto from 'crypto';
import { Player } from '../models/player.type';

export class DiscordApiMessage {
    private id: string;
    private message: string;

    constructor(
        private recipientId: string,
        private server: string,
        private numberOfPlayers: number = 0,
        private playersList: Player[] = [],
    ) {
        this.initializeId();
        this.initializeMessage();
    }

    getId(): string {
        return `${this.id}`;
    }

    getRecipientId(): string {
        return `${this.recipientId}`;
    }

    getMessage(): string {
        return `${this.message}`;
    }

    private initializeId(): void {
        const string = `${this.recipientId};${this.server};${
            this.numberOfPlayers
        };${this.playersList.join(',')};`;
        const md5Hasher = crypto.createHmac('md5', 'notasecret');

        this.id = md5Hasher.update(string).digest('hex');
    }

    private initializeMessage(): void {
        if (this.numberOfPlayers === 0) {
            this.message = `No players on server ${this.server}`;
        } else {
            const manWalkingEmoji = String.fromCodePoint(0x1f6b6);

            this.message = `${this.numberOfPlayers} player${
                this.numberOfPlayers === 1 ? '' : 's'
            } ${manWalkingEmoji} on server ${this.server}: ${this.playersList
                .map((player) => player.name)
                .join(', ')}`;
        }
    }
}
