import { Player } from '../models/player.type';

export interface PlayersListResult {
  success: boolean;
  players?: Player[];
}
