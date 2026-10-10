/* @layer renderer-components @kind constants */
const HERO_FILES = import.meta.glob('../../../../assets/home-hero/hero-art-*.png', {
  eager: true,
  import: 'default',
});

export { HERO_FILES };
