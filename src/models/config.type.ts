import { ConfigKey } from './config-key.type';

// TODO Config type -> Config class ?
export type Config = {
    [key: ConfigKey | string]: string | number | boolean | string[];
};
