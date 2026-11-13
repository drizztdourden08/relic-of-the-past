/* @layer renderer-components @kind hook */
import { useSettings } from '@drizztdourden08/brock-react';
import type { AppSettings } from '@app/settings.type';

const usePictureAlign = (): AppSettings['pictureAlign'] => useSettings<AppSettings>().settings.pictureAlign;

export { usePictureAlign };
