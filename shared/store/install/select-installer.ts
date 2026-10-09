/* @layer shared-store @kind logic */
import type { Container } from '../types';
import type { PackInstaller } from './installer.type';
import { INSTALLERS } from './select-installer.constants';

const selectInstaller = (container: Container): PackInstaller => INSTALLERS[container];

export { selectInstaller };
