/* @layer renderer-components @kind constants */
const DATE_FORMAT: Intl.DateTimeFormatOptions = {
  year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit',
};

const NAME_MAX_LENGTH = 64;

export { DATE_FORMAT, NAME_MAX_LENGTH };
