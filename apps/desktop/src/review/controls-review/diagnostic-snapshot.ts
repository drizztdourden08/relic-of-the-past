/* @layer renderer-app @kind logic */
import type { AppReviewTour } from '@drizztdourden08/brock-react';

const rectOf = (node: Element | null) => {
  if (!node) return null;
  const rect = node.getBoundingClientRect();
  return {
    x: Math.round(rect.x), y: Math.round(rect.y), width: Math.round(rect.width), height: Math.round(rect.height),
  };
};

const visibilityOf = (node: Element | null) => {
  if (!node) return null;
  const style = getComputedStyle(node);
  return {
    display: style.display,
    visibility: style.visibility,
    opacity: style.opacity,
    rect: rectOf(node),
  };
};

const controlsReviewDiagnostic = (tour: AppReviewTour, label: string, extra: Record<string, unknown> = {}): void => {
  const active = document.activeElement;
  const input = document.querySelector<HTMLInputElement>('input[aria-label="Profile name"]');
  const controls = document.querySelector('.controls-settings');
  const main = document.querySelector('.controls-settings__main');
  const body = document.querySelector('.controls-settings__body');
  const route = document.querySelector('[data-screen], [data-route], [data-page]');
  const splash = document.querySelector('#boot-splash, .boot-bar, [data-boot-overlay], html.booting');
  const sides = ['start', 'end'].map((side) => {
    const node = document.querySelector(`.controls-settings__side--${side}`);
    return {
      side,
      open: node?.classList.contains('controls-settings__side--open') ?? false,
      visibility: visibilityOf(node),
      panel: visibilityOf(node?.querySelector('.side-panel') ?? null),
    };
  });
  const activeTab = document.querySelector<HTMLElement>('.controls-settings__main [role="tab"][aria-selected="true"]');

  const record = JSON.stringify({
    label,
    atMs: Math.round(performance.now()),
    viewport: { width: window.innerWidth, height: window.innerHeight, dpr: window.devicePixelRatio },
    route: route ? {
      screen: route.getAttribute('data-screen'),
      route: route.getAttribute('data-route'),
      page: route.getAttribute('data-page'),
    } : { pathname: window.location.pathname, controlsPagePresent: controls !== null },
    controls: visibilityOf(controls),
    main: visibilityOf(main),
    tabs: visibilityOf(document.querySelector('.controls-settings__main .tabs')),
    body: body ? { visibility: visibilityOf(body), overflowY: getComputedStyle(body).overflowY } : null,
    sides,
    activeTab: activeTab ? { id: activeTab.id, selected: activeTab.getAttribute('aria-selected') } : null,
    renameInput: input ? { present: true, focused: active === input, visibility: visibilityOf(input) } : { present: false },
    activeElement: active ? {
      tag: active.tagName,
      id: (active as HTMLElement).id || null,
      className: typeof (active as HTMLElement).className === 'string' ? (active as HTMLElement).className : null,
      ariaLabel: active.getAttribute('aria-label'),
    } : null,
    splash: visibilityOf(splash),
    ...extra,
  });
  console.info('[controls-review-diag]', record);
  const id = `diagnostic-${label.replace(/[^a-z0-9-]/gi, '-')}`;
  tour.check(id, true, record, record);
};

export { controlsReviewDiagnostic };
