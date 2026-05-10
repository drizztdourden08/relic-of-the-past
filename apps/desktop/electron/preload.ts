import { contextBridge } from 'electron';

contextBridge.exposeInMainWorld('api', {
  // Future bridge APIs will be exposed here
});
