/* @layer website-site @kind logic */
import type { Firefly, FireflyStyle } from '../Fireflies.type';

const fireflyStyleOf = (fly: Firefly): FireflyStyle => ({
  key: `${fly.x}-${fly.y}`,
  hue: fly.hue,
  style: {
    left: `${fly.x}%`,
    top: `${fly.y}%`,
    width: fly.size,
    height: fly.size,
    fontSize: fly.size,
    animationDuration: `${fly.drift}s, ${fly.flicker}s`,
    animationDelay: `${fly.delay}s, ${fly.delay}s`,
  },
});

export { fireflyStyleOf };
