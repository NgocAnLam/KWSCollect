"use client";

import { useEffect, useRef, useState } from "react";
import MicTestCard from "./components/MicTestCard";
import VolumeMeter, { VolumeMeterHandle } from "./components/VolumeMeter";

interface MicTestProps {onPassed: () => void}

export default function MicTest({ onPassed }: MicTestProps) {
  const [isRecording, setIsRecording] = useState(false);
  const [volume, setVolume] = useState(0);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);

  // Các ref để quản lý media
  const streamRef = useRef<MediaStream | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const recorderRef = useRef<MediaRecorder | null>(null);
  const audioCtxRef = useRef<AudioContext | null>(null);
  const chunksRef = useRef<BlobPart[]>([]);
  const rafRef = useRef<number | null>(null);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  const volumeMeterRef = useRef<VolumeMeterHandle>(null);

  const startRecording = async () => {
    try {
      setAudioUrl(null);
      chunksRef.current = [];

      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      streamRef.current = stream;

      const audioCtx = new AudioContext();
      await audioCtx.resume();
      audioCtxRef.current = audioCtx;

      const analyser = audioCtx.createAnalyser();
      analyser.fftSize = 512;
      analyserRef.current = analyser;

      const source = audioCtx.createMediaStreamSource(stream);
      source.connect(analyser);

      const recorder = new MediaRecorder(stream, {
        mimeType: "audio/webm;codecs=opus",
      });
      recorderRef.current = recorder;

      recorder.ondataavailable = (e) => {
        if (e.data.size > 0) chunksRef.current.push(e.data);
      };

      recorder.onstop = () => {
        const blob = new Blob(chunksRef.current, {
          type: "audio/webm;codecs=opus",
        });
        console.log("Audio blob size:", blob.size);
        if (blob.size > 1000) {
          setAudioUrl(URL.createObjectURL(blob));
        } else {
          alert("Không ghi được âm thanh. Vui lòng thử lại.");
        }
      };

      recorder.start();
      setIsRecording(true);
      measureVolume();

      timeoutRef.current = setTimeout(stopRecording, 5000);
    } catch (err) {
      alert("Không thể truy cập micro. Vui lòng kiểm tra quyền truy cập.");
      console.error(err);
    }
  };

  const stopRecording = () => {
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    if (recorderRef.current && recorderRef.current.state !== "inactive") {
      recorderRef.current.stop();
    }
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((t) => t.stop());
      streamRef.current = null;
    }
    if (audioCtxRef.current) {
      audioCtxRef.current.close();
      audioCtxRef.current = null;
    }
    if (rafRef.current) cancelAnimationFrame(rafRef.current);
    setIsRecording(false);
    setVolume(0);
  };

  const measureVolume = () => {
    if (!analyserRef.current) return;

    const bufferLength = analyserRef.current.frequencyBinCount;
    const data = new Uint8Array(bufferLength);
    analyserRef.current.getByteFrequencyData(data);
    const avg = data.reduce((a, b) => a + b, 0) / bufferLength;
    const normalized = Math.min(100, (avg / 128) * 100);
    volumeMeterRef.current?.setVolume(normalized);
    setVolume(prev => {
      const diff = Math.abs(prev - normalized);
      if (diff > 2) return normalized;
      return prev;
    });

    if (normalized > 15) onPassed();

    rafRef.current = requestAnimationFrame(measureVolume);
  };

  useEffect(() => () => stopRecording(), []);

  return (
    <div className="max-w-3xl mx-auto px-4 py-4 w-full space-y-4">
      <div className="mb-4">
        <p className="text-xs text-gray-500 px-0.5">
          Kiểm tra micro và mức âm thanh trước khi thu âm. Nói to để xác nhận micro hoạt động.
        </p>
      </div>
      <MicTestCard
        isRecording={isRecording}
        volume={volume}
        audioUrl={audioUrl}
        volumeMeterRef={volumeMeterRef}
        onStartStop={isRecording ? stopRecording : startRecording}
      />
    </div>
  );
}