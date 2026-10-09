/* @layer shared-asset-extraction @kind data */
const kEffectByteLength = [1, 1, 2, 3, 0, 1, 2, 1, 2, 1, 1, 3, 0, 1, 2, 3, 1, 3, 3, 0, 1, 3, 0, 3, 3, 3, 1];

const kEffectNames = [
  'Instrument', 'Pan', 'PanFade', 'Vibrato', 'VibratoOff',
  'SongVolume', 'SongVolumeFade', 'Tempo', 'TempoFade',
  'Transpose', 'ChannelTranpose', 'Tremolo', 'TremoloOff',
  'Volume', 'VolumeFade', 'Call', 'VibratoFade',
  'PitchEnvelopeTo', 'PitchEnvelopeFrom', 'PitchEnvelopeOff',
  'FineTune', 'EchoEnable', 'EchoOff', 'EchoSetup', 'EchoVolumeFade',
  'PitchSlide', 'PercussionDefine',
];

const kKeys = ['C-', 'C#', 'D-', 'D#', 'E-', 'F-', 'F#', 'G-', 'G#', 'A-', 'A#', 'B-'];

export { kEffectByteLength, kEffectNames, kKeys };
