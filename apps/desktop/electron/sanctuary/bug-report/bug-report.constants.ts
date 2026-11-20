/* @layer electron-main @kind constants */
import { msg } from '@drizztdourden08/brock-core/i18n';
const SIGNED_OUT_ERROR = msg('main:sanctuary.report.signedOut');

const FILE_FAILED_ERROR = msg('main:sanctuary.report.fileFailed');

const BAD_CONTACT_ERROR = msg('main:sanctuary.report.badContact');

const NO_UPLOAD_URL_ERROR = msg('main:sanctuary.report.noUploadUrl');

const TOO_LARGE_ERROR = msg('main:sanctuary.report.tooLarge');

const MAX_DEBUG_INFO_CHARS = 20000;

const NORMAL_SAVES_IN_REPORT = 5;

const AUTO_SAVES_IN_REPORT = 2;

const ZIP_PREFIX = 'rotp-report-';

const SANCTUARY_LINK_LABEL = msg('main:sanctuary.report.linkSanctuary');

const ISSUE_LINK_LABEL = msg('main:sanctuary.report.linkIssue');

export {
  SIGNED_OUT_ERROR, FILE_FAILED_ERROR, BAD_CONTACT_ERROR, NO_UPLOAD_URL_ERROR, TOO_LARGE_ERROR,
  MAX_DEBUG_INFO_CHARS, NORMAL_SAVES_IN_REPORT, AUTO_SAVES_IN_REPORT, ZIP_PREFIX, SANCTUARY_LINK_LABEL, ISSUE_LINK_LABEL,
};
