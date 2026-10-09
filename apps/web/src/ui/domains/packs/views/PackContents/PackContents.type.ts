/* @layer renderer-components @kind types */
import type { StoreKind } from '@shared/store/types';
import type { LanguageSet } from '@shared/game/language';
import type { ZipEntry } from '@shared/store/manifest/zip-directory';
import type { MsuPackManifest } from '@shared/types/msu-manifest';
import type { SetFontAssets } from '../../language/behavior/language-behavior.type';
import type { PackSource } from '../../pack-source.type';

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
