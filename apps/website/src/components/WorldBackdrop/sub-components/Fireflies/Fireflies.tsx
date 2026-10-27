/* @layer website-site @kind component */
import { Box } from '../../../../design';
import { useFireflyStyles } from './behavior/useFireflyStyles';
import './Fireflies.css';

const Fireflies = () => {
  const flies = useFireflyStyles();

  return (
    <Box className="landing-fireflies" aria-hidden="true">
      {flies.map(({ key, hue, style }) => (
        <Box key={key} as="span" className="landing-fireflies__fly" data-hue={hue} style={style} />
      ))}
    </Box>
  );
};

export { Fireflies };
