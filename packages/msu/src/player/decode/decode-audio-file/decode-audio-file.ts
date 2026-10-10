/* @layer renderer-lib @kind logic */
import { decodeOpuz } from '../decode-opuz';
import { parseMsu1, hasMsu1Magic } from '../parse-msu1';
import { hasOpuzMagic } from '../parse-opuz';
import type { DecodedAudio } from './decode-audio-file.type';
import { isOpuzName } from './is-opuz-name';

const decodeMsu1 = (ctx: BaseAudioContext, bytes: Uint8Array): DecodedAudio => {
  const { channels, loopSample, sampleRate } = parseMsu1(bytes);
  const [firstChannel] = channels;
  if (firstChannel === undefined) throw new Error('An MSU-1 file decoded to no channels');
  const buffer = ctx.createBuffer(channels.length, firstChannel.length, sampleRate);
  channels.forEach((data, i) => buffer.copyToChannel(data, i));
  return { buffer, loopSample };
};

const decodeMedia = async (ctx: BaseAudioContext, bytes: Uint8Array): Promise<DecodedAudio> => {
  const detachableCopy = new Uint8Array(bytes.byteLength);
  detachableCopy.set(bytes);
  const buffer = await ctx.decodeAudioData(detachableCopy.buffer);
  return { buffer, loopSample: 0 };
};

const decodeAudioFile = async (ctx: BaseAudioContext, fileName: string, bytes: Uint8Array): Promise<DecodedAudio> => {
  if (hasMsu1Magic(bytes)) return decodeMsu1(ctx, bytes);
  if (hasOpuzMagic(bytes) || isOpuzName(fileName)) return decodeOpuz(ctx, bytes);
  return decodeMedia(ctx, bytes);
};

export { decodeAudioFile };
