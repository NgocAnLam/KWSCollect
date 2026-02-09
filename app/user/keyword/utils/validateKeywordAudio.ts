/**
 * Validate keyword recording trên frontend (không cần backend):
 * - Có nói hay không (im lặng / VAD)
 * - Có nói nhỏ hay không (âm lượng tối thiểu)
 *
 * Kiểm tra "sai script" dùng SpeechRecognition (chạy song song khi ghi âm) trong validateScript.
 */

const MIN_DURATION_SEC = 0.25;
const MIN_RMS_DB = -40;
const SILENCE_RMS_DB = -50;
const VAD_FRAME_MS = 30;
const VAD_VOICED_RATIO = 0.05;

export interface ValidateResult {
  accepted: boolean;
  reason?: string;
}

/**
 * Decode blob (webm) thành AudioBuffer, tính RMS (dB) và tỉ lệ frame có tiếng (VAD).
 */
async function decodeAndAnalyze(blob: Blob): Promise<{
  rmsDb: number;
  voicedRatio: number;
  durationSec: number;
}> {
  const arrayBuffer = await blob.arrayBuffer();
  const ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
  const buffer = await ctx.decodeAudioData(arrayBuffer.slice(0));
  ctx.close();

  const channel = buffer.numberOfChannels > 0 ? buffer.getChannelData(0) : new Float32Array(0);
  const n = channel.length;
  const sr = buffer.sampleRate;
  const durationSec = n / sr;

  if (n === 0) {
    return { rmsDb: -100, voicedRatio: 0, durationSec: 0 };
  }

  let sumSq = 0;
  for (let i = 0; i < n; i++) {
    const s = channel[i];
    sumSq += s * s;
  }
  const rms = Math.sqrt(sumSq / n) || 1e-10;
  const rmsDb = 20 * Math.log10(rms);

  const frameLen = Math.floor((sr * VAD_FRAME_MS) / 1000);
  if (frameLen < 1) {
    return { rmsDb, voicedRatio: rmsDb > SILENCE_RMS_DB ? 1 : 0, durationSec };
  }

  let voicedFrames = 0;
  let numFrames = 0;
  const frameEnergyThresh = 0.01;

  for (let start = 0; start + frameLen <= n; start += frameLen) {
    numFrames++;
    let energy = 0;
    for (let i = start; i < start + frameLen; i++) {
      const s = channel[i];
      energy += s * s;
    }
    energy = Math.sqrt(energy / frameLen);
    if (energy >= frameEnergyThresh) voicedFrames++;
  }
  const voicedRatio = numFrames > 0 ? voicedFrames / numFrames : 0;

  return { rmsDb, voicedRatio, durationSec };
}

/**
 * Validate audio blob: im lặng, quá ngắn, âm lượng quá nhỏ.
 * Script (nói đúng từ khóa hay không) không kiểm tra ở đây — cần ASR (backend hoặc WASM).
 */
export async function validateKeywordAudio(blob: Blob): Promise<ValidateResult> {
  if (!blob || blob.size === 0) {
    return { accepted: false, reason: "Không có dữ liệu audio." };
  }

  let rmsDb: number;
  let voicedRatio: number;
  let durationSec: number;
  try {
    const result = await decodeAndAnalyze(blob);
    rmsDb = result.rmsDb;
    voicedRatio = result.voicedRatio;
    durationSec = result.durationSec;
  } catch (e) {
    return { accepted: false, reason: "Không đọc được file audio. Vui lòng ghi lại." };
  }

  if (durationSec < MIN_DURATION_SEC) {
    return { accepted: false, reason: "Audio quá ngắn. Vui lòng nói rõ từ khóa." };
  }

  if (rmsDb < SILENCE_RMS_DB || voicedRatio < VAD_VOICED_RATIO) {
    return { accepted: false, reason: "Audio im lặng, vui lòng nói rõ hơn." };
  }

  if (rmsDb < MIN_RMS_DB) {
    return { accepted: false, reason: "Âm lượng quá nhỏ. Vui lòng nói gần micro hơn." };
  }

  return { accepted: true };
}
