/* @layer renderer-app @kind constants */
import { defineChannels, event, invoke } from '@drizztdourden08/brock-core';
import type { EventContract as RotpEvent, InvokeContract as RotpInvoke } from '@app/ipc';

const APP_CHANNELS = defineChannels({
  readMsulFile: invoke<RotpInvoke['msu:readMsulFile']>()('msu:readMsulFile'),
  analyzeMsuOptimize: invoke<RotpInvoke['msu:optimize:analyze']>()('msu:optimize:analyze'),
  runMsuOptimize: invoke<RotpInvoke['msu:optimize:run']>()('msu:optimize:run'),
  probeAudioFile: invoke<RotpInvoke['ffmpeg:probeAudio']>()('ffmpeg:probeAudio'),
  loadRecommendations: invoke<RotpInvoke['recommendations:load']>()('recommendations:load'),
  applyRecommendationPass: invoke<RotpInvoke['recommendations:applyPass']>()('recommendations:applyPass'),
  decideRecommendation: invoke<RotpInvoke['recommendations:decide']>()('recommendations:decide'),
  getTestArgs: invoke<RotpInvoke['test:getArgs']>()('test:getArgs'),
  getDumpLayersSlot: invoke<RotpInvoke['debug:getDumpLayersSlot']>()('debug:getDumpLayersSlot'),
  getHoverTile: invoke<RotpInvoke['debug:getHoverTile']>()('debug:getHoverTile'),
  writeDumpLayers: invoke<RotpInvoke['debug:dumpLayers']>()('debug:dumpLayers'),
  getDumpNavSlot: invoke<RotpInvoke['debug:getDumpNavSlot']>()('debug:getDumpNavSlot'),
  writeDumpNav: invoke<RotpInvoke['debug:dumpNav']>()('debug:dumpNav'),
  getSimRunConfig: invoke<RotpInvoke['debug:getSimRunConfig']>()('debug:getSimRunConfig'),
  writeSimRun: invoke<RotpInvoke['debug:writeSimRun']>()('debug:writeSimRun'),
  appendSimLog: invoke<RotpInvoke['sim:appendLog']>()('sim:appendLog'),
  openSimLog: invoke<RotpInvoke['sim:openLog']>()('sim:openLog'),
  finalizeDebugCaptureSession: invoke<RotpInvoke['debug-capture:finalizeSession']>()('debug-capture:finalizeSession'),
  listDebugCaptureSessions: invoke<RotpInvoke['debug-capture:listSessions']>()('debug-capture:listSessions'),
  deleteDebugCaptureSession: invoke<RotpInvoke['debug-capture:deleteSession']>()('debug-capture:deleteSession'),
  hubSignOut: invoke<RotpInvoke['hub:signOut']>()('hub:signOut'),
  hubMe: invoke<RotpInvoke['hub:me']>()('hub:me'),
  submitSanctuaryReport: invoke<RotpInvoke['sanctuary:submitReport']>()('sanctuary:submitReport'),
  saveArchipelagoFiles: invoke<RotpInvoke['archipelago:save-files']>()('archipelago:save-files'),
  storeDuplicate: invoke<RotpInvoke['store:duplicate']>()('store:duplicate'),
  startLanDiscovery: invoke<RotpInvoke['lan:discovery:start']>()('lan:discovery:start'),
  stopLanDiscovery: invoke<RotpInvoke['lan:discovery:stop']>()('lan:discovery:stop'),
  onMsuOptimizeProgress: event<RotpEvent['msu:optimize:progress']>()('msu:optimize:progress'),
  onLanSighting: event<RotpEvent['lan:sighting']>()('lan:sighting'),
});

const APP_INVOKE_MAP = APP_CHANNELS.maps.invoke;

const APP_SEND_MAP = APP_CHANNELS.maps.send;

const APP_EVENT_MAP = APP_CHANNELS.maps.events;

export { APP_CHANNELS, APP_INVOKE_MAP, APP_SEND_MAP, APP_EVENT_MAP };
