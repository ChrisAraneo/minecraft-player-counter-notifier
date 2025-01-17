import { StatusResponse } from './status-response.type';

export interface Cache {
  timestamp: Date;
  response: StatusResponse;
}
