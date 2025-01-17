import { DISCORD_TOKEN, RECIPIENTS } from './argument-keys.consts';
import { EnvironmentVariables } from './environment-variables.class';
import { Process } from './process.class';
import { ProcessMock } from './process.mock.class';

describe('EnvironmentVariables', () => {
  let process: Process;
  let environmentVariables: EnvironmentVariables;

  beforeEach(() => {
    process = new ProcessMock();
    environmentVariables = new EnvironmentVariables(process);
  });

  describe('get', () => {
    it('should return list of environment variables when program executed with environment variables', async () => {
      const args = environmentVariables.get();

      expect(args).toStrictEqual({
        [DISCORD_TOKEN]: '01234543210',
        [RECIPIENTS]: ['rec1', 'rec2', 'rec3'],
      });
    });
  });
});
