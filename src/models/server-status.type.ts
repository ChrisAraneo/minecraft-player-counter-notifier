import { Player } from './player.type';

export interface ServerStatus {
  server: string;
  online: number;
  players?: Player[];
}
