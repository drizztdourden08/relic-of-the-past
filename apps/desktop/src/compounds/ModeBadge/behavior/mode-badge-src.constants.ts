/* @layer renderer-components @kind constants */
const BADGE_FILES = import.meta.glob('../../../../assets/mode-badges/mode-*.png', {
  eager: true,
  import: 'default',
});

export { BADGE_FILES };
