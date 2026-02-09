"use client";
import { useState, useRef } from "react";
import { Mic, MicOff, Play, Pause, RotateCcw } from "lucide-react";
import { captureTranscriptWhileRecording } from "../../keyword/utils/speechRecognitionCapture";

const RECORDING_DURATION_MS = 15000;

type Props = {
  audioBlob: Blob | null;
  setAudioBlob: (blob: Blob | null) => void;
  setAudioUrl: (url: string | null) => void;
  resetRecording: () => void;
  isPlaying: boolean;
  onPlayToggle: () => void;
  onRecordingComplete: (blob: Blob, transcriptPromise: Promise<string> | null) => void;
};

export default function RecordingControls({audioBlob, setAudioBlob, setAudioUrl, resetRecording, isPlaying, onPlayToggle, onRecordingComplete}: Props) {
  const [isRecording, setIsRecording] = useState(false);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const transcriptCaptureRef = useRef<ReturnType<typeof captureTranscriptWhileRecording> | null>(null);

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      transcriptCaptureRef.current = captureTranscriptWhileRecording(RECORDING_DURATION_MS);

      const recorder = new MediaRecorder(stream);
      const chunks: Blob[] = [];

      recorder.ondataavailable = (e) => chunks.push(e.data);
      recorder.onstop = () => {
        transcriptCaptureRef.current?.stop();
        const blob = new Blob(chunks, { type: "audio/webm" });
        const url = URL.createObjectURL(blob);
        setAudioBlob(blob);
        setAudioUrl(url);
        stream.getTracks().forEach((track) => track.stop());
        onRecordingComplete(blob, transcriptCaptureRef.current?.promise ?? null);
        transcriptCaptureRef.current = null;
      };

      recorder.start();
      mediaRecorderRef.current = recorder;
      setIsRecording(true);

      setTimeout(() => {
        if (recorder.state === "recording") recorder.stop();
      }, RECORDING_DURATION_MS);
    } catch (err) {
      alert("Không thể truy cập microphone. Vui lòng kiểm tra quyền truy cập.");
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
    }
  };

  if (!audioBlob) {
    return (
      <div className="flex justify-center gap-3 flex-wrap">
        <button
          type="button"
          onClick={startRecording}
          disabled={isRecording}
          className={`inline-flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium shadow-sm transition-colors ${
            isRecording
              ? "bg-red-600 text-white animate-pulse"
              : "bg-indigo-600 text-white hover:bg-indigo-700"
          }`}
        >
          {isRecording ? <MicOff className="h-5 w-5" /> : <Mic className="h-5 w-5" />}
          {isRecording ? "Đang ghi âm…" : "Bắt đầu ghi âm"}
        </button>

        {isRecording && (
          <button
            type="button"
            onClick={stopRecording}
            className="inline-flex items-center gap-2 px-4 py-2 bg-gray-600 text-white rounded-md text-sm font-medium hover:bg-gray-700 transition shadow-sm"
          >
            Dừng ghi âm
          </button>
        )}
      </div>
    );
  }

  return (
    <div className="flex justify-center gap-3 flex-wrap">
      <button
        type="button"
        onClick={onPlayToggle}
        className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-md text-sm font-medium hover:bg-indigo-700 transition shadow-sm"
      >
        {isPlaying ? <Pause className="h-5 w-5" /> : <Play className="h-5 w-5" />}
        {isPlaying ? "Tạm dừng" : "Nghe lại"}
      </button>

      <button
        type="button"
        onClick={resetRecording}
        className="inline-flex items-center gap-2 px-4 py-2 bg-amber-500 text-white rounded-md text-sm font-medium hover:bg-amber-600 transition shadow-sm"
      >
        <RotateCcw className="h-5 w-5" />
        Thu lại
      </button>
    </div>
  );
}