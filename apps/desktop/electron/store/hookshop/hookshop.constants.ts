/* @layer electron-main @kind constants */
const HOOKSHOP_LABEL = 'The Hookshop';
const INSTALL_JOB_PREFIX = 'catalog-install:';
const UNAUTHORIZED = 401;
const SIGNED_OUT_MESSAGE = 'Sign in to use the Hookshop.';
const SITE_SIGNED_OUT_MESSAGE = 'This device was signed out on the site. Sign in again.';
const GRANT_REFUSED = 'The Hookshop answered without the pack\'s kind, author or licence.';
const ANSWER_UNREADABLE = 'The Hookshop answered with something this app cannot read.';
const HOME_SHELVES = ['featured', 'popular', 'topRated', 'fresh'] as const;

export {
  HOOKSHOP_LABEL, INSTALL_JOB_PREFIX, UNAUTHORIZED, SIGNED_OUT_MESSAGE, SITE_SIGNED_OUT_MESSAGE, GRANT_REFUSED, ANSWER_UNREADABLE, HOME_SHELVES,
};
