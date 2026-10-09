/* @layer electron-main @kind logic */
import { errMessage } from './err-message';

const fail = (err: unknown): { success: false; error: string } => ({ success: false, error: errMessage(err) });

export { fail };
