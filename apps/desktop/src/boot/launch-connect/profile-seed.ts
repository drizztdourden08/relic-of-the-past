/* @layer renderer-app @kind logic */
import type { CreateProfileOptions } from '@app/profiles/types';

/** The ROM, language and sound pack of the profile the launch started on, which a created profile shares. */
const baseOptionsOf = (active: Profile, name: string): Pick<CreateProfileOptions, 'name' | 'romFile' | 'language' | 'msuPack' | 'initialConfig'> => ({
  name,
  romFile: active.romFile,
  ...(active.language === undefined ? {} : { language: active.language }),
  ...(active.msuPack === undefined ? {} : { msuPack: active.msuPack }),
  initialConfig: { developerToolsEnabled: true, experimentalFeaturesEnabled: true },
});

export { baseOptionsOf };
