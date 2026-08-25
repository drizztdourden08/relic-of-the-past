/* @layer shared-types @kind constants */
/**
 * The MSU-1 `.pcm` container, as the format defines it.
 *
 * Shared rather than renderer-local because both sides read this header now: the renderer decodes
 * the audio, and the main process reads the loop point out of the first eight bytes to describe a
 * pack without shipping it. Two copies of a format constant is the kind of duplication that goes
 * wrong quietly, so there is one.
 *
 * The rate and channel count are FIXED by the format — an MSU-1 track is always 44100 Hz 16-bit
 * signed stereo, little-endian, left channel first. That is why they are constants and not fields.
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
