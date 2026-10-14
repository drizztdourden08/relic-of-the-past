/* @layer renderer-components @kind component */
import { Box, Text } from '@drizztdourden08/tessera/primitives';
import type { ScreenAnnotations } from '@rotp/navigation';
import { styleForKind } from '@app/navigation-overlay/annotation-style';
import { CollapsiblePanel } from './CollapsiblePanel';
import { useNavigationOverlayStore } from '@app/stores/navigation-overlay-store';

const OverlayLegend = ({ annotations }: { annotations?: readonly ScreenAnnotations[] }) => {
  const hiddenKinds = useNavigationOverlayStore((s) => s.hiddenKinds);
  const present = [...new Set((annotations ?? []).flatMap((s) => s.items).map((a) => a.kind))]
    .filter((k) => !styleForKind(k).panelOnly);

  return (
    <CollapsiblePanel title="on this screen">
      {present.length === 0 && <Text className="nav-legend__note">nothing detected yet. Run the flood</Text>}
      {present.map((kind) => {
        const off = hiddenKinds.has(kind);
        const style = styleForKind(kind);
        return (
          <Box
            key={kind}
            className="nav-legend__row"
            title={off ? 'Hidden. Re-enable it in the navigation widget.' : undefined}
          >
            <Text data-tone={style.tone} className={off ? 'nav-legend__glyph nav-legend__glyph--off' : 'nav-legend__glyph'}>
              {style.glyph}
            </Text>
            <Text className={off ? 'nav-legend__off' : 'nav-legend__dim'}>{style.legend}</Text>
          </Box>
        );
      })}
    </CollapsiblePanel>
  );
};

export { OverlayLegend };
