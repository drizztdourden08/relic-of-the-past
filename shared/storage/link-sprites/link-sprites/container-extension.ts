/* @layer shared-storage @kind logic */
import { isRspName } from '../parse-rsp';

const containerExtension = (name: string): 'rsp' | 'zspr' => (isRspName(name) ? 'rsp' : 'zspr');

export { containerExtension };
