/* @layer electron-main @kind types */
interface ProbeStream {
  codec_type?: string;
  sample_rate?: string;
  channels?: number;
  bit_rate?: string;
  duration?: string;
}

interface ProbeReport {
  streams?: ProbeStream[];
  format?: { duration?: string; bit_rate?: string };
}

export type { ProbeReport };
