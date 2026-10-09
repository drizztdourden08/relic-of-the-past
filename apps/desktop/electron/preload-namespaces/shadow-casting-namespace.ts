/* @layer electron-preload @kind logic */
import type { PreloadNamespace } from '@drizztdourden08/brock-electron/preload';
import type { InvokeArg } from './namespace-args.type';

const shadowCastingNamespace: PreloadNamespace = {
  id: 'shadowCasting',
  build: ({ invoke }) => ({
    load: () => invoke('shadow-casting:load'),
    save: (data: InvokeArg<'shadow-casting:save'>) => invoke('shadow-casting:save', data),
    getScreen: (screenId: InvokeArg<'shadow-casting:get-screen'>) => invoke('shadow-casting:get-screen', screenId),
  }),
};

export { shadowCastingNamespace };
