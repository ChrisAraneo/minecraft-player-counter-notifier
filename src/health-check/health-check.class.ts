import express from 'express';
import * as core from 'express-serve-static-core';
import { Process } from '../process/process.class';
import { Logger } from '../utils/logger.class';

export class HealthCheck {
    private server: core.Express;

    constructor(
        private readonly endpoint: string,
        private readonly port: number,
        private readonly process: Process,
        private readonly logger: Logger,
    ) {
        this.server = express();
    }

    async listen(): Promise<void> {
        this.server.get(this.endpoint, async (_, response) => {
            const healthcheck = {
                uptime: this.process.uptime(),
                message: 'OK',
                timestamp: Date.now(),
            };

            try {
                response.send(healthcheck);
                this.logger.debug(`Health OK`);
            } catch (error) {
                healthcheck.message = error;
                response.status(503).send();
            }
        });

        this.server.listen(this.port, () => {
            this.logger.info(`Health check server has started at port ${this.port}`);
        });
    }
}
