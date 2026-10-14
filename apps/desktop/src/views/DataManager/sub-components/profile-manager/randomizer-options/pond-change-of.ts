/* @layer renderer-components @kind logic */
import { CAPACITY_POND } from '@rotp/randomizer';
import type { PondId, PondSetting } from '@rotp/randomizer';
import { withCapacityPondRule } from '@app/hooks/randomizer/capacity-pond-choices';
import { pondsWithEdit } from './ponds-with-edit';
import type { OptionTabContext } from './OptionTabBody.type';

const pondChangeOf = (context: OptionTabContext): ((id: PondId, pond: PondSetting) => void) | undefined => {
  const { onChange, choices, pondProfiles, pondShare } = context;
  if (onChange === undefined) return undefined;
  return (id, pond) => {
    const ponds = pondsWithEdit(pondProfiles, id, pond, pondShare);
    onChange(id === CAPACITY_POND.id || pondShare
      ? withCapacityPondRule({ ...choices, ponds }, 'pond')
      : { ...choices, ponds });
  };
};

export { pondChangeOf };
