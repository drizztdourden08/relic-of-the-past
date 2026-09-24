/* @layer shared-types @kind types */
/**
 * The Sanctuary invoke channels: the device-code sign-in, the signed-in identity and the bug
 * report submission. Split out of `InvokeContract` (which extends this) for the line cap; the
 * signatures still have their one source of truth here. The user code shown while the app
 * waits for the browser arrives on the `sanctuary:deviceCode` EVENT (see event-contract.ts).
 */
import type { Identity, SanctuaryUser, SubmitReportRequest } from '@shared/sanctuary';
import type { DebugReportSaveEntry } from '@shared/types/debug-report';

/** Why a sign-in ended without a token. */
type SanctuarySignInFailure = 'denied' | 'expired' | 'cancelled' | 'unavailable' | 'error';

type SanctuarySignInResult =
  | { ok: true }
  | { ok: false; reason: SanctuarySignInFailure; message?: string };

/** The signed-in identity as the Contributor tab shows it; null when no device token is held. */
type SanctuaryMe = {
  user: SanctuaryUser;
  identities: Identity[];
  /** This device's label as the API recorded it at confirm time. */
  deviceLabel: string;
};

/**
 * What the renderer hands over to file a report. The attachment sizes are filled in by the
 * main process once it has built the zip, so the request carries everything but that.
 */
type SanctuarySubmitInput = {
  request: Omit<SubmitReportRequest, 'attachment'>;
  /** The active profile when a debug report may be attached; null files the report plain. */
  profileId: string | null;
  saves: DebugReportSaveEntry[];
  /** Exactly the capture sessions the picker had checked. */
  sessionKeys: string[];
};

/**
 * A filed report. `uploaded` is false when nothing was attached or the zip upload failed; the
 * latter carries `error` and can be retried with `sanctuary:retryUpload` against the same
 * report id. A report that could not be filed at all answers with `error` alone.
 */
type SanctuarySubmitResult =
  | { reportId: string; issueUrl: string; sanctuaryUrl: string; attached: boolean; uploaded: boolean; error?: string }
  | { error: string };

type SanctuaryUploadResult = { uploaded: boolean; error?: string };

interface SanctuaryInvokeContract {
  /** Opens the browser on the site and polls until the device is confirmed, denied or expired. */
  'sanctuary:beginDeviceSignIn': () => Promise<SanctuarySignInResult>;
  /** Stops the poll; the pending begin resolves with reason 'cancelled'. */
  'sanctuary:cancelDeviceSignIn': () => Promise<void>;
  /** Drops the device token. The device row on the site stays until revoked there. */
  'sanctuary:signOut': () => Promise<void>;
  /** null when no token is held, or when the API no longer accepts it (the token is dropped then). */
  'sanctuary:me': () => Promise<SanctuaryMe | null>;
  'sanctuary:submitReport': (input: SanctuarySubmitInput) => Promise<SanctuarySubmitResult>;
  'sanctuary:retryUpload': (input: { reportId: string }) => Promise<SanctuaryUploadResult>;
}

export type {
  SanctuaryInvokeContract,
  SanctuarySignInFailure,
  SanctuarySignInResult,
  SanctuaryMe,
  SanctuarySubmitInput,
  SanctuarySubmitResult,
  SanctuaryUploadResult,
};
