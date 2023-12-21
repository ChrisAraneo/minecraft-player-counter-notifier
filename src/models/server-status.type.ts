import { Player } from '../api/player.type';

export type ServerStatus = {
    server: string;
    online: number;
    players?: Player[];
};
