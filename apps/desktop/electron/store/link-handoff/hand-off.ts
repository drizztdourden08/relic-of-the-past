/* @layer electron-main @kind logic */
import { connect } from 'net';
import type { InstallLink } from '@shared/store/deep-link';
import { ACK, formatHandoffMessage } from '../handoff-message';
import { HANDOFF_TIMEOUT_MS } from './link-handoff.constants';
import { pipePath } from './pipe-path';

const handOff = (link: InstallLink): Promise<boolean> =>
  new Promise((resolve) => {
    let answer = '';
    const socket = connect(pipePath());
    const finish = (accepted: boolean) => {
      clearTimeout(timer);
      socket.destroy();
      resolve(accepted);
    };
    const timer = setTimeout(() => finish(false), HANDOFF_TIMEOUT_MS);
    socket.setEncoding('utf8');
    socket.on('connect', () => socket.write(formatHandoffMessage(link)));
    socket.on('data', (chunk: string) => {
      answer += chunk;
      if (answer.includes('\n') || answer.length > ACK.length) finish(answer === ACK);
    });
    socket.on('error', () => finish(false));
    socket.on('end', () => finish(answer === ACK));
  });

export { handOff };
