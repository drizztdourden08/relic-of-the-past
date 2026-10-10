/* @layer renderer-widgets @kind logic */
const annotationStateClass = (state: string, settled: boolean): string => {
  if (state === 'blocked') return 'nav-screen-panel__state nav-screen-panel__state--blocked';
  return settled ? 'nav-screen-panel__state nav-screen-panel__state--settled' : 'nav-screen-panel__state';
};

export { annotationStateClass };
