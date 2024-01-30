import { Player } from '../models/player.type';

export type PlayersListResult = {
    success: boolean;
    players?: Player[];
};
