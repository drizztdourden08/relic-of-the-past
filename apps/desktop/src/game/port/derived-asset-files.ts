/* @layer bridge-wasm @kind logic */
import { ASSETS_DIR } from '@drizztdourden08/brock-port-kit';
import type { RomDerived } from '@drizztdourden08/brock-port-kit';
import { SUPPLEMENT_IDS } from '@rotp/asset-extraction';
import type { AssetSourceId } from '@rotp/asset-extraction';
import { assets, roms } from '@rotp/roms';

const ofBaseRom: RomDerived = (file) => SUPPLEMENT_IDS.map((id) => `${ASSETS_DIR}/${assets.sidecarName(file, id)}`);

const ofSupplementRom = (id: AssetSourceId): RomDerived => async (_file, files) =>
  (await roms.listRoms(files, 'snes-alttp')).map((base) => `${ASSETS_DIR}/${assets.sidecarName(base, id)}`);

const derivedAssetFiles = { ofBaseRom, ofSupplementRom };

export { derivedAssetFiles };
