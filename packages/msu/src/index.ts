/* @layer package @kind barrel */
export { ALTTP_DELUXE_VARIANT, alttpMsuConfig } from './alttp-msu-config';
export type { AlttpMusicContext, MsuChannelName } from './alttp-msu-config';
export { pushVolumes } from './live-settings/push-volumes';
export { groupVolume } from './msu-pack-loader/group-volume';
export type { PackSessionInput, Settings } from './msu-pack-loader/msu-pack-loader.type';
export { MSU1_BYTES_PER_FRAME, MSU1_CHANNELS, MSU1_HEADER_BYTES, MSU1_MAGIC_TEXT, msu1FrameCount } from './msu1-format';
export { msulInstaller } from './store/install/install-msul';
export type {
  MsuDebugEvent as MusicDebugEvent, MsuDebugOwner as MusicDebugOwner, MsuEngine, MsuHost,
  MsuLayerReport as LayerReport,
} from '@drizztdourden08/brock-msu';
export * as msu from '@drizztdourden08/brock-msu/packs';
export {
  assertSafeName, deleteMsuResume, effectivePackManifest, getTrackList, installMsulPack, isAudioFile,
  isInventoryName, isSafeName, listPackEntries, OPTIMIZE_SLICE_SECONDS, OPTIMIZE_TARGET_EXTENSION, packDir,
  readManifest, readMsuResume, readTrackFile, serializeManifest, sortInventory, supersededMap,
  synthesizeClassicManifest, trackNumberOf, withFileRenamed, withLoopSampleCarried, withSupersededRepointed,
  writeManifest, writeMsuResume, writeTrackFile,
} from '@drizztdourden08/brock-msu/packs';
export type {
  AudioProbe, InstallResult, MsuFileMetadata, OptimizeAnalysis, OptimizeCandidate, OptimizeConversion,
  OptimizeProgress, OptimizeRunResult, ProbedAudio,
} from '@drizztdourden08/brock-msu/packs';
export {
  createMsuEngine, decodeAudioFile, exportMsu1Pack, exportMsulPack, MSU1_SAMPLE_RATE,
} from '@drizztdourden08/brock-msu/player';
export {
  audibleLength, audioContext, clearMusicDebug, createTraceHandlers, getMusicDebugCounters, getMusicDebugEvents,
  initMusicDebug, isContinuousTarget, isMsuSessionActive, loadOriginalSound, msuChannelReport, msuPackSessionOwner,
  msuRestore, msuSnapshot, originalSoundState, PROBE_SECONDS, setMusicDebugArmed, soundKeyOf, startMsuSession,
  stopMsuSession, stopOriginalSound, subscribeMusicDebug,
} from '@drizztdourden08/brock-msu/session';
export type { MsuSession, MsuSessionOptions, MusicDebugCounter, PlayOutcome } from '@drizztdourden08/brock-msu/session';
