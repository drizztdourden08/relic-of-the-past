/* @layer electron-main @kind constants */
import { msg } from '@drizztdourden08/brock-core/i18n';
const HOOKSHOP_LABEL = 'The Hookshop';
const INSTALL_JOB_PREFIX = 'catalog-install:';
const UNAUTHORIZED = 401;
const SIGNED_OUT_MESSAGE = msg('main:hookshop.signedOut');
const SITE_SIGNED_OUT_MESSAGE = msg('main:hookshop.siteSignedOut');
const GRANT_REFUSED = msg('main:hookshop.grantRefused');
const ANSWER_UNREADABLE = msg('main:hookshop.answerUnreadable');
const HOME_SHELVES = ['featured', 'popular', 'topRated', 'fresh'] as const;

export {
  HOOKSHOP_LABEL, INSTALL_JOB_PREFIX, UNAUTHORIZED, SIGNED_OUT_MESSAGE, SITE_SIGNED_OUT_MESSAGE, GRANT_REFUSED, ANSWER_UNREADABLE, HOME_SHELVES,
};
