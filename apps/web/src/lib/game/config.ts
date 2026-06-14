/* @layer bridge-wasm @kind config */
// Default config for WASM builds
const DEFAULT_ZELDA3_INI = `[General]
Autosave = 0
ExtendedAspectRatio = 4:3

[Graphics]
WindowSize = Auto
Fullscreen = 0
WindowScale = 2
NewRenderer = 1
EnhancedMode7 = 1
NoSpriteLimits = 1
OutputMethod = SDL
LinearFiltering = 0

[Sound]
EnableAudio = 1
AudioFreq = 44100
AudioChannels = 2
AudioSamples = 2048
EnableMSU = false

[Features]
ItemSwitchLR = 0
TurnWhileDashing = 0
CollectItemsWithSword = 0
DisableLowHealthBeep = 0
SkipIntroOnKeypress = 0
DisableTelepathy = 0
`;

export { DEFAULT_ZELDA3_INI };
