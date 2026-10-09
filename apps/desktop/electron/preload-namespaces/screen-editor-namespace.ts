/* @layer electron-preload @kind logic */
import type { PreloadNamespace } from '@drizztdourden08/brock-electron/preload';
import type { InvokeArg } from './namespace-args.type';

const screenEditorNamespace: PreloadNamespace = {
  id: 'screenEditor',
  build: ({ invoke }) => ({
    writeScreen: (args: InvokeArg<'screenEditor:writeScreen'>) => invoke('screenEditor:writeScreen', args),
    writeConnections: (args: InvokeArg<'screenEditor:writeConnections'>) => invoke('screenEditor:writeConnections', args),
    writeConnectionPair: (args: InvokeArg<'screenEditor:writeConnectionPair'>) => invoke('screenEditor:writeConnectionPair', args),
    writeCheck: (args: InvokeArg<'screenEditor:writeCheck'>) => invoke('screenEditor:writeCheck', args),
    allocateGeography: (args: InvokeArg<'screenEditor:allocateGeography'>) => invoke('screenEditor:allocateGeography', args),
    allocateTag: (args: InvokeArg<'screenEditor:allocateTag'>) => invoke('screenEditor:allocateTag', args),
    writeTag: (args: InvokeArg<'screenEditor:writeTag'>) => invoke('screenEditor:writeTag', args),
    deleteTag: (args: InvokeArg<'screenEditor:deleteTag'>) => invoke('screenEditor:deleteTag', args),
    allocateItemGroup: (args: InvokeArg<'screenEditor:allocateItemGroup'>) => invoke('screenEditor:allocateItemGroup', args),
    writeItemGroup: (args: InvokeArg<'screenEditor:writeItemGroup'>) => invoke('screenEditor:writeItemGroup', args),
    deleteItemGroup: (args: InvokeArg<'screenEditor:deleteItemGroup'>) => invoke('screenEditor:deleteItemGroup', args),
    allocateEnumeration: (args: InvokeArg<'screenEditor:allocateEnumeration'>) => invoke('screenEditor:allocateEnumeration', args),
    writeEnumeration: (args: InvokeArg<'screenEditor:writeEnumeration'>) => invoke('screenEditor:writeEnumeration', args),
    deleteEnumeration: (args: InvokeArg<'screenEditor:deleteEnumeration'>) => invoke('screenEditor:deleteEnumeration', args),
    allocateCheck: (args: InvokeArg<'screenEditor:allocateCheck'>) => invoke('screenEditor:allocateCheck', args),
    writeCheckRecord: (args: InvokeArg<'screenEditor:writeCheckRecord'>) => invoke('screenEditor:writeCheckRecord', args),
    deleteCheck: (args: InvokeArg<'screenEditor:deleteCheck'>) => invoke('screenEditor:deleteCheck', args),
    allocateItem: (args: InvokeArg<'screenEditor:allocateItem'>) => invoke('screenEditor:allocateItem', args),
    writeItemRecord: (args: InvokeArg<'screenEditor:writeItemRecord'>) => invoke('screenEditor:writeItemRecord', args),
    deleteItem: (args: InvokeArg<'screenEditor:deleteItem'>) => invoke('screenEditor:deleteItem', args),
    allocateDungeon: (args: InvokeArg<'screenEditor:allocateDungeon'>) => invoke('screenEditor:allocateDungeon', args),
    writeDungeonRecord: (args: InvokeArg<'screenEditor:writeDungeonRecord'>) => invoke('screenEditor:writeDungeonRecord', args),
    deleteDungeon: (args: InvokeArg<'screenEditor:deleteDungeon'>) => invoke('screenEditor:deleteDungeon', args),
    allocateActor: (args: InvokeArg<'screenEditor:allocateActor'>) => invoke('screenEditor:allocateActor', args),
    writeActorRecord: (args: InvokeArg<'screenEditor:writeActorRecord'>) => invoke('screenEditor:writeActorRecord', args),
    deleteActor: (args: InvokeArg<'screenEditor:deleteActor'>) => invoke('screenEditor:deleteActor', args),
    writeAreaRecord: (args: InvokeArg<'screenEditor:writeAreaRecord'>) => invoke('screenEditor:writeAreaRecord', args),
    deleteArea: (args: InvokeArg<'screenEditor:deleteArea'>) => invoke('screenEditor:deleteArea', args),
    writeLocationRecord: (args: InvokeArg<'screenEditor:writeLocationRecord'>) => invoke('screenEditor:writeLocationRecord', args),
    deleteLocation: (args: InvokeArg<'screenEditor:deleteLocation'>) => invoke('screenEditor:deleteLocation', args),
  }),
};

export { screenEditorNamespace };
