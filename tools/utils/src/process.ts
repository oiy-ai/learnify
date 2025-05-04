import {
  type ChildProcess,
  execSync,
  spawn as RawSpawn,
  type SpawnOptions,
} from 'node:child_process';

import { Logger } from './logger';

const children = new Set<ChildProcess>();

export function spawn(
  tag: string,
  cmd: string | string[],
  options: SpawnOptions = {}
) {
  cmd = typeof cmd === 'string' ? cmd.split(' ') : cmd;
  const isYarnSpawn = cmd[0] === 'yarn';

  const spawnOptions: SpawnOptions = {
    stdio: isYarnSpawn
      ? ['inherit', 'inherit', 'inherit']
      : ['inherit', 'pipe', 'pipe'],
    shell: true,
    ...options,
    env: { ...process.env, ...options.env },
  };

  const logger = new Logger(tag);
  logger.info(cmd.join(' '));
  const childProcess = RawSpawn(cmd[0], cmd.slice(1), spawnOptions);
  children.add(childProcess);

  const drain = (_code: number | null, signal: any) => {
    children.delete(childProcess);

    // don't run repeatedly if this is the error event
    if (signal === undefined) {
      childProcess.removeListener('exit', drain);
    }
  };

  childProcess.stdout?.on('data', chunk => {
    logger.log(chunk);
  });

  childProcess.stderr?.on('data', chunk => {
    logger.error(chunk);
  });

  childProcess.once('error', e => {
    logger.error(e.toString());
    children.delete(childProcess);
  });

  childProcess.once('exit', (code, signal) => {
    if (code !== 0) {
      logger.error('Finished with non-zero exit code.');
    }

    drain(code, signal);
  });

  return childProcess;
}

export function execAsync(
  tag: string,
  cmd: string | string[],
  options?: SpawnOptions
): Promise<void> {
  return new Promise((resolve, reject) => {
    const childProcess = spawn(tag, cmd, options);

    childProcess.once('error', e => {
      reject(e);
    });

    childProcess.once('exit', code => {
      if (code === 0) {
        resolve();
      } else {
        reject(new Error(`Child process exits with non-zero code ${code}`));
      }
    });
  });
}

export function exec(
  tag: string,
  cmd: string,
  { silent }: { silent: boolean } = { silent: false }
): string {
  const logger = new Logger(tag);
  !silent && logger.info(cmd);
  const result = execSync(cmd, { encoding: 'utf8' }).trim();
  !silent && logger.log(result);
  return result;
}
