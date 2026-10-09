/* @layer renderer-components @kind types */
import type { StoreKind } from '@rotp/hub-contracts';
import type { LanguageSet } from '@rotp/languages';
import type { ZipEntry } from '@rotp/hub-contracts';
import type { MsuPackManifest } from '@rotp/game-data';
import type { SetFontAssets } from '../../packs/language/behavior/language-behavior.type';
import type { PackSource } from '../../packs/pack-source.type';

type PackContentsProps = {
  kind: StoreKind;
  source: PackSource;
  className?: string;
};

type LanguagePack = {
  set: LanguageSet;
  font: SetFontAssets | null;
};

type MusicPack = {
  manifest: MsuPackManifest;
  entries: ReadonlyMap<string, ZipEntry>;
};

type PackRead<T> = {
  data: T | null;
  error: string | null;
  loading: boolean;
};

type PackSourceProps = {
  source: PackSource;
};

type ContentsStatusProps = {
  error: string | null;
};

export type { ContentsStatusProps, LanguagePack, MusicPack, PackContentsProps, PackRead, PackSourceProps };
