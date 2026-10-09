/* @layer shared-store @kind logic */
import type { Container, PackInstaller } from '@rotp/hub-contracts';
import { INSTALLERS } from './select-installer.constants';

const selectInstaller = (container: Container): PackInstaller => INSTALLERS[container];

export { selectInstaller };
