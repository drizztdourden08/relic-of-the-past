/* @layer renderer-components @kind component */
/** Home tab header panel: mode badge, dense profile facts, profile actions. */
import { Box } from '../../../../../../design-system/primitives/Box';
import { Button } from '../../../../../../design-system/primitives/Button';
import { Text } from '../../../../../../design-system/primitives/Text';
import { ModeBadge } from '../../../../compounds/ModeBadge';
import { SaveFileChecksStrips } from './SaveFileChecksStrips';
import type { ProfileModeId } from '../../../../compounds/ModeBadge';
import type { SaveFileChecks, SummaryFact } from './home-tab.type';
import './HomeTabSummary.css';

interface HomeTabSummaryProps {
  mode: ProfileModeId;
  facts: SummaryFact[];
  randomizerFacts: SummaryFact[] | null;
  /** Offline per-save-file checks readout; null hides the strips. */
  saveFileChecks: SaveFileChecks[] | null;
  canRevealFolder: boolean;
  onOpenFolder: () => void;
  onImportSram: () => void;
}

const valueClass = (fact: SummaryFact): string => {
  let cls = 'home-summary__value';
  if (fact.mono) cls += ' home-summary__value--mono';
  if (fact.capitalize) cls += ' home-summary__value--capitalize';
  return cls;
};

const renderFacts = (facts: SummaryFact[]) => facts.map((fact) => (
  <Box key={fact.label} className="home-summary__fact">
    <Text className="home-summary__label">{fact.label}</Text>
    <Text className={valueClass(fact)} title={fact.title}>{fact.value}</Text>
  </Box>
));

const HomeTabSummary = (props: HomeTabSummaryProps) => {
  const { mode, facts, randomizerFacts, saveFileChecks, canRevealFolder, onOpenFolder, onImportSram } = props;
  return (
    <Box className="home-summary">
      <ModeBadge mode={mode} className="home-summary__badge" />

      <Box className="home-summary__rows">
        <Box className="home-summary__row">{renderFacts(facts)}</Box>
        {randomizerFacts && (
          <Box className="home-summary__row home-summary__row--randomizer">
            {renderFacts(randomizerFacts)}
            {saveFileChecks && <SaveFileChecksStrips files={saveFileChecks} />}
          </Box>
        )}
      </Box>

      <Box className="home-summary__actions">
        {canRevealFolder && (
          <Button
            variant="secondary"
            size="sm"
            icon="📂"
            onClick={onOpenFolder}
            title="Open this profile's folder in the system file manager"
          >
            Open folder
          </Button>
        )}
        <Button
          variant="secondary"
          size="sm"
          icon="📥"
          onClick={onImportSram}
          title="Import a raw SRAM save (.srm) from another emulator"
        >
          Import save
        </Button>
      </Box>
    </Box>
  );
};

export { HomeTabSummary };
export type { HomeTabSummaryProps };
