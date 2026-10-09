/* @layer hub-core @kind logic */
import type { Request } from '@google-cloud/functions-framework';
import { currentJar } from './current-jar';
import type { JarSlot } from './session-jar.type';

const readSlot = (req: Request, slot: JarSlot): string | null => currentJar(req)[slot] ?? null;

export { readSlot };
