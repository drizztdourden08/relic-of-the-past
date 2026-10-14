/* @layer shared-asset-extraction @kind types */
import type { AssetBuilder } from '../../asset-builder';
import type { GbaRomReader } from '../../rom/gba-rom';
import type { RomData } from '../../rom/rom-types';
import type {
  GbaAlttpDungeonSource,
  GbaAlttpTextMessage,
  GbaEntityHandlerRecord,
  GbaRoomTagHandlerRecord,
  extractDungeonSpriteGraphics,
  extractPalaceSnes4bppTiles,
  extractPalaceSpritePalettes,
} from '../../sources/gba-alttp';
import type { encodePortText } from '../encode-port-text';

type SupplementContext = {
  rom: GbaRomReader;
  snes: RomData;
  assets: AssetBuilder;
  source: GbaAlttpDungeonSource;
  rooms: ReturnType<GbaAlttpDungeonSource['palaceRooms']>;
  roomIds: ReadonlySet<number>;
  paletteIds: number[];
  topology: ReturnType<GbaAlttpDungeonSource['palaceTopology']>;
  spriteGraphics: ReturnType<typeof extractDungeonSpriteGraphics>;
  spritePalettes: ReturnType<typeof extractPalaceSpritePalettes>;
  bgTiles: ReturnType<typeof extractPalaceSnes4bppTiles>;
  text: GbaAlttpTextMessage[];
  portText: ReturnType<typeof encodePortText>;
  handlers: GbaEntityHandlerRecord[];
  roomTagHandlers: GbaRoomTagHandlerRecord[];
};

type SupplementBuilders = Record<string, () => void>;

export type { SupplementBuilders, SupplementContext };
