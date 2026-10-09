/* @layer tests @kind helper */
import { all } from '@shared/game/data';
import { AREA_PATH, NAME_PATH } from './id-ref-display.constants';

const sample = (() => {
  const screens = all('screen') as unknown as readonly Record<string, unknown>[];
  const areas = all('area') as unknown as readonly Record<string, unknown>[];
  const row = screens.find((entry) => typeof entry[AREA_PATH] === 'string');
  if (!row) throw new Error('no screen carries an area reference');
  const id = String(row[AREA_PATH]);
  const area = areas.find((entry) => String(entry.id) === id);
  if (!area) throw new Error(`no area ${id}`);
  return { row, id, name: String(area[NAME_PATH]) };
})();

export { sample };
