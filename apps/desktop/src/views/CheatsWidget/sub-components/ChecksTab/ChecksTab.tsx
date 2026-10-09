/* @layer renderer-widgets @kind component */
import { useEffect, useMemo, useState } from 'react';
import { Box, Button, Text, TextInput } from '@drizztdourden08/tessera/primitives';
import { find, getScreen } from '@rotp/game-data';
import type { CheckId, CheckRecord } from '@rotp/game-data';
import {
  getCompletedChecks, grantFromCheck, onCompletedChecksChanged, planCheckGrant,
} from '@app/game';
import type { CheckGrantPlan } from '@app/game';
import { trackerCheckRecords } from '@rotp/navigation';
import { getSessionState, subscribeSessionStore } from '@app/game/randomizer-client';
import { useWidgetPref } from '@drizztdourden08/brock-react';
import { DisabledOverlay } from '@drizztdourden08/tessera/composites';
import type { CheatTabProps } from '../../CheatsWidget.type';
import './ChecksTab.css';

const screenLabelOf = (check: CheckRecord): string => {
  if (!check.screenId) return '';
  const screen = getScreen(check.screenId);
  return screen.name;
};

const detailOf = (plan: CheckGrantPlan): string =>
  (plan.kind === 'blocked' ? `Cannot grant: ${plan.reason}` : `Gives: ${plan.itemLabel}`);

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
        {filteredChecks.map((check) => {
          const done = completedChecks.has(check.id);
          const plan = plans.get(check.id) ?? { kind: 'blocked' as const, reason: 'not planned' };
          const detail = detailOf(plan);
          return (
            <Box key={check.id} className={`cheats-checks__entry ${done ? 'cheats-checks__entry--completed' : ''}`}>
              <Box className="cheats-checks__text">
                <Text className="cheats-checks__name" title={`${screenLabelOf(check)} • ${check.kind}`}>
                  {check.name}
                </Text>
                <Text className={`cheats-checks__gives ${plan.kind === 'blocked' ? 'cheats-checks__gives--blocked' : ''}`}>
                  {detail}
                </Text>
              </Box>
              <Button
                size="sm"
                className="cheats-checks__grant-btn"
                disabled={done || plan.kind === 'blocked'}
                title={detail}
                onClick={() => grantFromCheck(check)}
              >
                Grant
              </Button>
            </Box>
          );
        })}
      </Box>
      </Box>
    </DisabledOverlay>
  );
};

export { ChecksTab };
