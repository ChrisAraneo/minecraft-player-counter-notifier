import { Player } from './player.type';

export type ServerStatus = {
    server: string;
    online: number;
    players?: Player[];
};
