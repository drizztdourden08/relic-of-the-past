/* @layer shared-types @kind logic */
/**
 * Request/response IPC channels: `ipcRenderer.invoke` ↔ `ipcMain.handle`.
 * This interface is the SINGLE SOURCE OF TRUTH for every invoke channel's
 * argument + return signature. Both the preload bridge and the main-process
 * handlers are type-checked against it.
 */
import type { Profile, AppState } from '@shared/types/profile';
import type { NormalSaveInfo, AutoSaveInfo, QuickSaveSlotInfo } from '@shared/types/saves';
import type { PlaySession } from '@shared/types/session';
import type { ShadowCastingProject, ScreenShadowData } from '@shared/types/shadow-casting';
import type { LanguagePack, LanguageSummary } from '@shared/types/language';
import type { RefreshRateInfo, SyncedRateStatus } from '@shared/types/display';
import type { DataLocation, StorageSummary, FileStat } from '@shared/platform';
import type { SystemDiagnostics } from '@shared/types/diagnostics';
import type { SimRunConfig } from '@shared/game/simulation';
import type { CreateIssueRequest, CreateIssueResult } from '@shared/types/github-issue';
import type {
  AllocateEnumerationArgs, AllocateEnumerationResult, AllocateGeographyArgs, AllocateGeographyResult,
  AllocateItemGroupArgs, AllocateItemGroupResult, AllocateRecordArgs, AllocateRecordResult, AllocateTagArgs,
  AllocateTagResult, DeleteEnumerationArgs, DeleteItemGroupArgs, DeleteRecordArgs, DeleteTagArgs,
  WriteConnectionPairArgs, WriteConnectionPairResult, WriteConnectionsArgs, WriteEnumerationArgs, WriteItemGroupArgs,
  WriteRecordArgs, WriteRecordResult, WriteScreenArgs, WriteTagArgs,
} from './screen-editor-contract';
import type {
  ActorRecord, AreaRecord, CheckRecord, DungeonRecord, ItemRecord, LocationRecord,
} from '@shared/game/data/types';
import type { EntityKind } from '@shared/game/data';
import type { UiViewsMap } from './ui-views-contract';
import type { ReviewEntry, ReviewFile } from './review-contract';
import type { DetectionContext, DraftRecommendation, PassResult, Recommendation } from './recommendation-contract';
import type { ControllerInvokeContract } from './controller-contract';
import type { MsuInvokeContract } from './msu-contract';
import type { FfmpegInvokeContract } from './ffmpeg-contract';
import type { UpdateInfo, UpdaterCapabilities, UpdaterPrefs, VersionOption } from './updater-contract';


type Result = { success: boolean; error?: string };
type TriggerCal = { base: number; max: number; deadzone: number };
type ReviewMap = Record<string, { status: string; comment?: string }>;

interface InvokeContract extends ControllerInvokeContract, MsuInvokeContract, FfmpegInvokeContract {
  // App
  'app:getUserDataPath': () => Promise<string>;

  // Diagnostics — host hardware/OS readout for the About page's debug info
  'diagnostics:getSystem': () => Promise<SystemDiagnostics>;

  // Storage — data location, reveal in OS file manager, per-domain usage summary
  'storage:getLocation': () => Promise<DataLocation>;
  'storage:reveal': () => Promise<void>;
  'storage:revealProfile': (profileId: string) => Promise<Result>;
  'storage:getSummary': () => Promise<StorageSummary>;

  // Generic file store — POSIX paths relative to the Data root
  'file:readBytes': (path: string) => Promise<ArrayBuffer | null>;
  'file:readText': (path: string) => Promise<string | null>;
  'file:writeBytes': (path: string, data: ArrayBuffer) => Promise<void>;
  'file:writeText': (path: string, data: string) => Promise<void>;
  'file:list': (dir: string) => Promise<string[]>;
  'file:remove': (path: string) => Promise<void>;
  'file:exists': (path: string) => Promise<boolean>;
  'file:mkdir': (dir: string) => Promise<void>;
  'file:stat': (path: string) => Promise<FileStat | null>;

  // WASM core bytes — renderer instantiates non-streaming (file:// can't fetch)
  'wasm:readBytes': () => Promise<ArrayBuffer>;

  // Window queries
  'window:isMaximized': () => Promise<boolean>;
  'window:setAlwaysOnTop': (value: boolean) => Promise<boolean>;
  'window:setAudioMuted': (value: boolean) => Promise<boolean>;
  'window:isAudioMuted': () => Promise<boolean>;
  'window:isFullscreen': () => Promise<boolean>;

  // Display — refresh rate of the screen the window is on
  'display:getRefreshRate': () => Promise<RefreshRateInfo>;
  'display:getSyncedRateStatus': () => Promise<SyncedRateStatus>;
  'display:setSyncedRatePreference': (enabled: boolean, targetHz: number) => Promise<SyncedRateStatus>;
  'display:applyRefreshRate': (hz: number) => Promise<SyncedRateStatus>;

  // Dialog
  'dialog:openRom': () => Promise<string | null>;
  'dialog:pickFile': (extensions: string[]) => Promise<{ name: string; data: ArrayBuffer } | null>;
  'dialog:saveFile': (name: string, data: ArrayBuffer, extensions: string[]) => Promise<{ saved: boolean; name?: string; error?: string }>;

  // Profiles
  'profiles:list': () => Promise<Profile[]>;
  'profiles:create': (name: string, romFile: string, language?: string, msuPack?: string) => Promise<Profile>;
  'profiles:delete': (id: string) => Promise<void>;
  'profiles:setLast': (id: string) => Promise<void>;
  'profiles:getAppState': () => Promise<AppState>;
  'profiles:updateLastPlayed': (id: string) => Promise<void>;
  'profiles:update': (id: string, patch: Partial<Profile>) => Promise<Profile | null>;

  // ROMs
  'roms:list': () => Promise<string[]>;
  'roms:listWithStatus': () => Promise<RomInfo[]>;
  'roms:import': (romPath: string) => Promise<ImportResult>;
  'roms:importUrl': (url: string) => Promise<ImportResult>;
  'roms:delete': (romFile: string) => Promise<void>;
  'roms:getInfo': (romFile: string) => Promise<{ name: string; size: number; hash: string; created: string; modified: string } | null>;

  // Assets
  'assets:check': (romFile: string) => Promise<boolean>;
  'assets:load': (romFile: string) => Promise<ArrayBuffer | null>;
  'assets:extract': (romFile: string) => Promise<Result>;

  // Saves — quick states
  'saves:writeSram': (profileId: string, data: ArrayBuffer) => Promise<void>;
  'saves:readSram': (profileId: string) => Promise<ArrayBuffer | null>;
  'saves:writeState': (profileId: string, slot: number, data: ArrayBuffer) => Promise<void>;
  'saves:readState': (profileId: string, slot: number) => Promise<ArrayBuffer | null>;
  'saves:listStates': (profileId: string) => Promise<number[]>;
  'saves:writeScreenshot': (profileId: string, slot: number, data: ArrayBuffer) => Promise<void>;
  'saves:readScreenshot': (profileId: string, slot: number) => Promise<string | null>;
  'saves:getSlotInfos': (profileId: string) => Promise<QuickSaveSlotInfo[]>;

  // Saves — normal (named)
  'saves:normal:create': (profileId: string, name: string, data: ArrayBuffer, screenshot?: ArrayBuffer) => Promise<NormalSaveInfo>;
  'saves:normal:list': (profileId: string) => Promise<NormalSaveInfo[]>;
  'saves:normal:load': (profileId: string, id: string) => Promise<ArrayBuffer | null>;
  'saves:normal:screenshot': (profileId: string, id: string) => Promise<string | null>;
  'saves:normal:overwrite': (profileId: string, id: string, data: ArrayBuffer, screenshot?: ArrayBuffer) => Promise<NormalSaveInfo | null>;
  'saves:normal:delete': (profileId: string, id: string) => Promise<void>;
  'saves:normal:rename': (profileId: string, id: string, newName: string) => Promise<NormalSaveInfo | null>;

  // Saves — auto
  'saves:auto:create': (profileId: string, trigger: 'timer' | 'quit', data: ArrayBuffer, screenshot?: ArrayBuffer) => Promise<AutoSaveInfo>;
  'saves:auto:list': (profileId: string) => Promise<AutoSaveInfo[]>;
  'saves:auto:load': (profileId: string, id: string) => Promise<ArrayBuffer | null>;
  'saves:auto:screenshot': (profileId: string, id: string) => Promise<string | null>;
  'saves:auto:delete': (profileId: string, id: string) => Promise<void>;
  'saves:auto:prune': (profileId: string, maxEntries: number) => Promise<void>;

  // Config (per-profile settings)
  'config:read': (profileId: string) => Promise<Record<string, unknown> | null>;
  'config:write': (profileId: string, settings: Record<string, unknown>) => Promise<void>;

  // Languages
  'languages:list': () => Promise<LanguageSummary[]>;
  'languages:extract': (romFile: string, langCode: string) => Promise<Result>;
  'languages:extractFromFile': (filePath: string, langCode: string) => Promise<Result>;
  'languages:extractFromUrl': (url: string, langCode: string) => Promise<Result>;
  'languages:delete': (langCode: string) => Promise<void>;
  'languages:getLanguage': (langCode: string) => Promise<LanguagePack | null>;

  // Sessions + tracker
  'sessions:list': (profileId: string) => Promise<PlaySession[]>;
  'sessions:save': (profileId: string, session: PlaySession) => Promise<void>;
  'tracker:save': (profileId: string, state: unknown) => Promise<void>;
  'tracker:load': (profileId: string) => Promise<unknown>;

  // Input — profiles + calibration + HID
  'inputProfiles:read': (profileId: string) => Promise<unknown[]>;
  'inputProfiles:write': (profileId: string, profiles: unknown[]) => Promise<void>;
  'stickCalibration:read': () => Promise<Record<string, unknown>>;
  'stickCalibration:write': (store: Record<string, unknown>) => Promise<void>;
  'triggerCalibration:read': () => Promise<Record<string, TriggerCal>>;
  'triggerCalibration:write': (deviceKey: string, axisIndex: number, cal: TriggerCal) => Promise<void>;

  // Sprites
  'sprites:extract': (romFile: string) => Promise<{ success: boolean; count?: number; error?: string }>;
  'sprites:check': (romFile: string) => Promise<{ extracted: boolean; count: number }>;
  'sprites:delete': (romFile: string) => Promise<Result>;
  'sprites:getPath': (romFile: string, file: string) => Promise<string>;

  // Review data (dev tooling)
  'spriteDebug:load': () => Promise<ReviewMap>;
  'spriteDebug:save': (data: ReviewMap) => Promise<void>;
  'spriteReview:load': () => Promise<ReviewMap>;
  'spriteReview:save': (data: ReviewMap) => Promise<void>;
  'connectionReview:load': () => Promise<unknown>;
  'connectionReview:save': (data: unknown) => Promise<void>;
  'navReview:load': () => Promise<unknown>;
  'navReview:save': (data: unknown) => Promise<void>;

  // Data Inspector / table view state — whole-file, app-level (not per profile),
  // debounced by the renderer repo. See shared/ipc/ui-views-contract.ts.
  'uiViews:load': () => Promise<UiViewsMap>;
  'uiViews:save': (data: UiViewsMap) => Promise<void>;

  // Data Inspector review layer — a personal curation status/note/timestamps
  // pair per record, one file per collection (Data/review/<kind>.json), never
  // inside the committed dataset. Generalizes the three legacy single-purpose
  // files above (spriteReview/connectionReview/navReview, now superseded) to
  // all eleven collections. The main process merges one entry per call rather
  // than trusting a whole map from the renderer — see review-contract.ts.
  'review:load': (kind: EntityKind) => Promise<ReviewFile>;
  'review:save': (kind: EntityKind, id: string, entry: ReviewEntry) => Promise<void>;

  // Recommendation store — one file per collection (Data/recommendations/<kind>.json).
  // The COLLECTION lives in the main process: folding a pass and recording a verdict
  // are both read-modify-write over a whole file, and splitting either across an IPC
  // round trip would let two callers interleave. See recommendation-contract.ts.
  'recommendations:load': (kind: EntityKind) => Promise<readonly Recommendation[]>;
  'recommendations:applyPass': (kind: EntityKind, context: DetectionContext,
    detectorIds: readonly string[], drafts: readonly DraftRecommendation[]) => Promise<PassResult>;
  'recommendations:decide': (kind: EntityKind, id: string,
    state: 'accepted' | 'dismissed') => Promise<readonly Recommendation[]>;

  // Test automation
  'test:getArgs': () => Promise<{ autoState: number | string | null; screenshot: string | null }>;
  'test:screenshot': (name: string) => Promise<string>;

  // Debug dumps
  'debug:getDumpLayersSlot': () => Promise<number | null>;
  'debug:getHoverTile': () => Promise<{ col: number; row: number } | null>;
  'debug:dumpLayers': (data: unknown) => Promise<string>;
  'debug:getDumpNavSlot': () => Promise<number | string | null>;
  'debug:dumpNav': (data: unknown) => Promise<string>;
  'debug:getSimRunConfig': () => Promise<SimRunConfig | null>;
  'debug:writeSimRun': (data: unknown) => Promise<string>;

  // Simulator run log (detailed JSONL sink)
  'sim:appendLog': (args: { runId: string; line: string }) => Promise<Result>;
  'sim:openLog': (args: { runId: string }) => Promise<Result>;

  // Shadow casting (nested namespace in the friendly API)
  'shadow-casting:load': () => Promise<ShadowCastingProject>;
  'shadow-casting:save': (data: ShadowCastingProject) => Promise<{ success: boolean }>;
  'shadow-casting:get-screen': (screenId: number) => Promise<ScreenShadowData | null>;

  // Screen editor (dev-only, nested namespace). Record payloads carry no id and
  // no source text — the main process allocates the id and serializes the record
  // with the dataset's own emitter. See shared/ipc/screen-editor-contract.ts.
  'screenEditor:writeScreen': (args: WriteScreenArgs) => Promise<WriteRecordResult>;
  'screenEditor:writeConnections': (args: WriteConnectionsArgs) => Promise<WriteRecordResult>;
  'screenEditor:writeConnectionPair': (args: WriteConnectionPairArgs) => Promise<WriteConnectionPairResult>;
  'screenEditor:writeCheck': (args: { filePath: string; code: string; checkId: string | null }) => Promise<Result>;
  'screenEditor:allocateGeography': (args: AllocateGeographyArgs) => Promise<AllocateGeographyResult>;
  'screenEditor:allocateTag': (args: AllocateTagArgs) => Promise<AllocateTagResult>;
  'screenEditor:writeTag': (args: WriteTagArgs) => Promise<WriteRecordResult>;
  'screenEditor:deleteTag': (args: DeleteTagArgs) => Promise<WriteRecordResult>;
  'screenEditor:allocateItemGroup': (args: AllocateItemGroupArgs) => Promise<AllocateItemGroupResult>;
  'screenEditor:writeItemGroup': (args: WriteItemGroupArgs) => Promise<WriteRecordResult>;
  'screenEditor:deleteItemGroup': (args: DeleteItemGroupArgs) => Promise<WriteRecordResult>;
  'screenEditor:allocateEnumeration': (args: AllocateEnumerationArgs) => Promise<AllocateEnumerationResult>;
  'screenEditor:writeEnumeration': (args: WriteEnumerationArgs) => Promise<WriteRecordResult>;
  'screenEditor:deleteEnumeration': (args: DeleteEnumerationArgs) => Promise<WriteRecordResult>;

  // The six collections that came after the record facade. Uniform by
  // construction (record in, id back), so they share one generic payload trio.
  // `writeCheckRecord` carries the suffix its five siblings do because
  // `writeCheck` above is the older text-based channel and still has callers.
  'screenEditor:allocateCheck': (a: AllocateRecordArgs<CheckRecord>) => Promise<AllocateRecordResult<CheckRecord>>;
  'screenEditor:writeCheckRecord': (args: WriteRecordArgs<CheckRecord>) => Promise<WriteRecordResult>;
  'screenEditor:deleteCheck': (args: DeleteRecordArgs) => Promise<WriteRecordResult>;
  'screenEditor:allocateItem': (a: AllocateRecordArgs<ItemRecord>) => Promise<AllocateRecordResult<ItemRecord>>;
  'screenEditor:writeItemRecord': (args: WriteRecordArgs<ItemRecord>) => Promise<WriteRecordResult>;
  'screenEditor:deleteItem': (args: DeleteRecordArgs) => Promise<WriteRecordResult>;
  'screenEditor:allocateDungeon': (a: AllocateRecordArgs<DungeonRecord>) => Promise<AllocateRecordResult<DungeonRecord>>;
  'screenEditor:writeDungeonRecord': (args: WriteRecordArgs<DungeonRecord>) => Promise<WriteRecordResult>;
  'screenEditor:deleteDungeon': (args: DeleteRecordArgs) => Promise<WriteRecordResult>;
  'screenEditor:allocateActor': (a: AllocateRecordArgs<ActorRecord>) => Promise<AllocateRecordResult<ActorRecord>>;
  'screenEditor:writeActorRecord': (args: WriteRecordArgs<ActorRecord>) => Promise<WriteRecordResult>;
  'screenEditor:deleteActor': (args: DeleteRecordArgs) => Promise<WriteRecordResult>;
  // Area and location already mint through `allocateGeography`, which asks for a
  // display name rather than a whole record — so they gain only the other two.
  'screenEditor:writeAreaRecord': (args: WriteRecordArgs<AreaRecord>) => Promise<WriteRecordResult>;
  'screenEditor:deleteArea': (args: DeleteRecordArgs) => Promise<WriteRecordResult>;
  'screenEditor:writeLocationRecord': (args: WriteRecordArgs<LocationRecord>) => Promise<WriteRecordResult>;
  'screenEditor:deleteLocation': (args: DeleteRecordArgs) => Promise<WriteRecordResult>;

  // GitHub bug reporting — anonymous relay, see cloud-functions/report-issue
  'github:createIssue': (req: CreateIssueRequest) => Promise<CreateIssueResult>;

  // Auto-updater (nested namespace)
  /** What this build can do about updates: check only, or check and install. */
  'updater:capabilities': () => Promise<UpdaterCapabilities>;
  /** Opens the release page for a version, for builds that cannot install one. */
  'updater:openReleasePage': (version: string | null) => Promise<void>;
  'updater:check': () => Promise<UpdateInfo | null>;
  'updater:getAvailable': () => Promise<UpdateInfo | null>;
  /** Every installable release, newest first, for the version picker. */
  'updater:listVersions': () => Promise<VersionOption[]>;
  /** null installs the newest release; a version string installs that exact build. */
  'updater:apply': (version: string | null) => Promise<void>;
  'updater:getPrefs': () => Promise<UpdaterPrefs>;
  'updater:setPrefs': (prefs: UpdaterPrefs) => Promise<void>;
  'updater:getVersion': () => Promise<string>;
}

export type { InvokeContract };
