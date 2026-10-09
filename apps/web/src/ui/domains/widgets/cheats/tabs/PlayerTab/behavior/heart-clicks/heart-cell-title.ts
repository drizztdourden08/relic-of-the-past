/* @layer renderer-widgets @kind logic */
import { HEART_UNITS } from '../../PlayerTab.constants';

const heartCellTitle = (cell: number, capacity: number): string => {
  const owned = Math.floor(capacity / HEART_UNITS);
  return cell < owned ? `Heart ${cell + 1}` : `Click: ${cell + 1} hearts (raises containers)`;
};

export { heartCellTitle };
