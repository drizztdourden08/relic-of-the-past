/* @layer renderer-lib @kind logic */
import { roms } from '@rotp/roms';
import { platformFiles } from '../platform-files';

const listSupplements = () => roms.listSupplements(platformFiles());

export { listSupplements };
