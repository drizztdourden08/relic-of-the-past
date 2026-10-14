/* @layer renderer-widgets @kind component */
import { useEffect, useMemo, useState } from 'react';
import { Box, TextInput } from '@drizztdourden08/tessera/primitives';
import { find } from '@rotp/game-data';
import type { CheckId } from '@rotp/game-data';
import { getCompletedChecks, onCompletedChecksChanged, planCheckGrant } from '@app/game';
import { trackerCheckRecords } from '@rotp/navigation';
import { getSessionState, subscribeSessionStore } from '@app/game/randomizer-client';
import { useWidgetPref } from '@drizztdourden08/brock-react';
import { DisabledOverlay } from '@drizztdourden08/tessera/composites';
import type { CheatTabProps } from '../../CheatsWidget.type';
import { NOT_PLANNED } from './ChecksTab.constants';
import { screenLabelOf } from './behavior/screen-label-of';
import { CheckEntry } from './sub-components/CheckEntry';
import './ChecksTab.css';

const ChecksTab = ({ gates }: CheatTabProps) => {
  const [search, setSearch] = useWidgetPref<string>('cheats', 'itemsSearch', '');
  const [completedChecks, setCompletedChecks] = useState<Set<CheckId>>(() => getCompletedChecks());
  const [sessionState, setSessionState] = useState(() => getSessionState());

  useEffect(() => onCompletedChecksChanged((checks) => setCompletedChecks(new Set(checks))), []);
  useEffect(() => subscribeSessionStore(setSessionState), []);

  const checkRecords = useMemo(() => find('check', () => true), []);
  const allChecks = useMemo(
    () => trackerCheckRecords(checkRecords, sessionState.placement),
    [checkRecords, sessionState.placement],
  );
  const filteredChecks = useMemo(() => {
    if (!search) return allChecks;
    const q = search.toLowerCase();
    return allChecks.filter((c) => c.name.toLowerCase().includes(q)
      || screenLabelOf(c).toLowerCase().includes(q));
  }, [search, allChecks]);

  const plans = useMemo(
    () => new Map(filteredChecks.map((check) => [check.id, planCheckGrant(check)] as const)),
    [filteredChecks, sessionState],
  );
  return (
    <DisabledOverlay active={!gates.allowed.items} message={gates.reason('items')} contained className="cheats-fill">
      <Box className="cheats-checks cheats-fill">
        <TextInput
          type="text"
          className="cheats-checks__search"
          placeholder="Search checks..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        <Box className="cheats-checks__list">
          {filteredChecks.map((check) => (
            <CheckEntry key={check.id} check={check} done={completedChecks.has(check.id)} plan={plans.get(check.id) ?? NOT_PLANNED} />
          ))}
        </Box>
      </Box>
    </DisabledOverlay>
  );
};

export { ChecksTab };
