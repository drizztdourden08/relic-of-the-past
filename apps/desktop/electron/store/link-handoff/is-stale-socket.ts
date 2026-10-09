/* @layer electron-main @kind logic */
import { connect } from 'net';

const isStaleSocket = async (path: string): Promise<boolean> =>
  process.platform !== 'win32' && !(await new Promise<boolean>((resolve) => {
    const probe = connect(path, () => { probe.destroy(); resolve(true); });
    probe.on('error', () => resolve(false));
  }));

export { isStaleSocket };
