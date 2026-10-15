/* @layer bridge-wasm @kind constants */
const DEFAULT_ZELDA3_INI = `[General]
ExtendedAspectRatio = 4:3

[Graphics]
WindowSize = Auto
NewRenderer = 1
EnhancedMode7 = 1
NoSpriteLimits = 1
LinearFiltering = 0

[Sound]
EnableAudio = 1
AudioFreq = 44100
AudioChannels = 2
AudioSamples = 2048
EnableMSU = false

[Features]
TurnWhileDashing = 0
CollectItemsWithSword = 0
DisableLowHealthBeep = 0
SkipIntroOnKeypress = 1
DisableTelepathy = 0
`;

export { DEFAULT_ZELDA3_INI };
