/* @layer renderer-widgets @kind component */
/**
 * The check list, with a Grant button that hands over what THIS run put at each location. The row
 * names the item it will give, so a randomized file shows the seed's item and never the vanilla
 * one the location used to hold.
 */
import { useEffect, useMemo, useState } from 'react';
import { Box, Button, Text, TextInput } from '@ds/primitives';
import { find, getScreen } from '@shared/game/data';
import type { CheckId, CheckRecord } from '@shared/game/data';
import {
  getCompletedChecks, grantFromCheck, onCompletedChecksChanged, planCheckGrant,
} from '@app/lib/game';
import type { CheckGrantPlan } from '@app/lib/game';
import { getSessionState, subscribeSessionStore } from '@app/lib/game/randomizer-client';
import { useWidgetPref } from '@app/hooks/useWidgetPref';

/** Screen display label for a check. A few pure progress-buffer events carry no screen at all. */
const screenLabelOf = (check: CheckRecord): string => {
  if (!check.screenId) return '';
  const screen = getScreen(check.screenId);
  return screen.vanillaName ?? screen.randomizerName;
};

const detailOf = (plan: CheckGrantPlan): string =>
  (plan.kind === 'blocked' ? `Cannot grant: ${plan.reason}` : `Gives: ${plan.itemLabel}`);

const CheckGrantList = () => {
  const [search, setSearch] = useWidgetPref<string>('cheats', 'itemsSearch', '');
  const [completedChecks, setCompletedChecks] = useState<Set<CheckId>>(() => getCompletedChecks());
  const [sessionState, setSessionState] = useState(() => getSessionState());

  useEffect(() => onCompletedChecksChanged((checks) => setCompletedChecks(new Set(checks))), []);
  useEffect(() => subscribeSessionStore(setSessionState), []);

  const allChecks = useMemo(() => find('check', () => true), []);
  const filteredChecks = useMemo(() => {
    if (!search) return allChecks;
    const q = search.toLowerCase();
    return allChecks.filter((c) => c.randomizerName.toLowerCase().includes(q)
      || screenLabelOf(c).toLowerCase().includes(q));
  }, [search, allChecks]);

  // Resolving a row's item walks the item records, so the whole visible list is planned once per
  // session instead of once per render. The session is the only input that changes the answer.
  const plans = useMemo(
    () => new Map(filteredChecks.map((check) => [check.id, planCheckGrant(check)] as const)),
    [filteredChecks, sessionState],
  );
  return (
    <Box>
      <TextInput
        type="text"
        className="cheats-input cheats-search"
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
                  {check.randomizerName}
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
  );
};

export { CheckGrantList };
