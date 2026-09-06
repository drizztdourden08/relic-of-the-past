/* @layer shared-types @kind constants */
/**
 * The MSU-1 `.pcm` container, as the format defines it. Shared because both sides read the
 * header: the renderer decodes the audio, the main process reads the loop point from the first
 * eight bytes. The rate and channel count are FIXED by the format (44100 Hz 16-bit signed stereo,
 * little-endian, left channel first), hence constants and not fields.
 */
const MSU1_MAGIC_TEXT = 'MSU1';
const MSU1_HEADER_BYTES = 8;
const MSU1_SAMPLE_RATE = 44100;
const MSU1_CHANNELS = 2;
/** One frame is a left+right pair of int16. */
const MSU1_BYTES_PER_FRAME = 4;

/** Sample frames of audio in a `.pcm` of this byte length. */
const msu1FrameCount = (byteLength: number): number =>
  Math.max(0, Math.floor((byteLength - MSU1_HEADER_BYTES) / MSU1_BYTES_PER_FRAME));

export {
  MSU1_MAGIC_TEXT, MSU1_HEADER_BYTES, MSU1_SAMPLE_RATE, MSU1_CHANNELS, MSU1_BYTES_PER_FRAME,
  msu1FrameCount,
};
