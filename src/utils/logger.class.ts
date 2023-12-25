import { Logger as WinstonLogger, format, createLogger, transports } from 'winston';
import { LogLevel } from './log-level.type';
const { combine, timestamp, printf, colorize, prettyPrint, simple } = format;

export class Logger {
    private logger: WinstonLogger;

    constructor(private level: LogLevel) {
        this.initialize();
    }

    debug(message: string, ...meta: any[]): void {
        this.logger.debug(message, ...meta);
    }

    info(message: string, ...meta: any[]): void {
        this.logger.info(message, ...meta);
    }

    warn(message: string, ...meta: any[]): void {
        this.logger.warn(message, ...meta);
    }

    error(message: string, ...meta: any[]): void {
        this.logger.error(message, ...meta);
    }

    private initialize(): void {
        this.logger = createLogger({
            level: this.level,
            format: combine(
                timestamp({
                    format: 'YYYY-MM-DD HH:MM:SS',
                }),
                prettyPrint(),
                format.splat(),
                simple(),
                printf((msg) => {
                    const message = msg.message;
                    const splat = msg[Symbol.for('splat')];

                    return colorize().colorize(
                        msg.level,
                        `[${msg.timestamp}] [${msg.level.toLocaleUpperCase()}] - ${message}${
                            splat ? ' ' + JSON.stringify(splat) : ''
                        }`,
                    );
                }),
            ),
            transports: [new transports.Console()],
        });
    }
}
