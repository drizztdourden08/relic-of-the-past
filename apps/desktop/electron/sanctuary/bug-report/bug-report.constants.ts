/* @layer electron-main @kind constants */
const SIGNED_OUT_ERROR = 'Sign in to the Sanctuary in Settings, Contributing, to send a report from the app.';

const FILE_FAILED_ERROR = 'Could not file the report.';

const BAD_CONTACT_ERROR = 'The contact email is not a valid address.';

const NO_UPLOAD_URL_ERROR = 'The upload could not start.';

const TOO_LARGE_ERROR = 'The debug files were too large to attach.';

const MAX_DEBUG_INFO_CHARS = 20000;

const NORMAL_SAVES_IN_REPORT = 5;

const AUTO_SAVES_IN_REPORT = 2;

const CAPTURE_BUDGET_BYTES = 30 * 1024 * 1024;

const ZIP_PREFIX = 'rotp-report-';

export {
  SIGNED_OUT_ERROR, FILE_FAILED_ERROR, BAD_CONTACT_ERROR, NO_UPLOAD_URL_ERROR, TOO_LARGE_ERROR,
  MAX_DEBUG_INFO_CHARS, NORMAL_SAVES_IN_REPORT, AUTO_SAVES_IN_REPORT, CAPTURE_BUDGET_BYTES, ZIP_PREFIX,
};
