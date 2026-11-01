/* @layer root-config @kind types */
import type { FileUpload, FileVersion, SanctuaryFile } from '@rotp/hub-contracts';
import type { Member, Route } from '@rotp/hub-server';

type UploadRouteContext = Parameters<Route['handler']>[0];

type MemberFile = { member: Member; file: SanctuaryFile };

type UploadingFile = MemberFile & { upload: FileUpload };

type MemberVersion = MemberFile & { version: FileVersion };

type UploadingVersion = MemberVersion & { upload: FileUpload };

type PartsDoneRecorder = (partsDone: number) => Promise<unknown>;

type UploadTarget = { key: string; bytes: number; upload: FileUpload };

export type { UploadRouteContext, MemberFile, UploadingFile, MemberVersion, UploadingVersion, PartsDoneRecorder, UploadTarget };
