"use client";
import { useState, useRef } from "react";
import { Mic, MicOff, Play, Pause, RotateCcw } from "lucide-react";

type Props = {
  audioBlob: Blob | null;
  setAudioBlob: (blob: Blob | null) => void;
  setAudioUrl: (url: string | null) => void;
  resetRecording: () => void;
  isPlaying: boolean;
  onPlayToggle: () => void;
};

export default function RecordingControls({audioBlob, setAudioBlob, setAudioUrl, resetRecording, isPlaying, onPlayToggle,}: Props) {
  const [isRecording, setIsRecording] = useState(false);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const recorder = new MediaRecorder(stream);
      const chunks: Blob[] = [];

      recorder.ondataavailable = (e) => chunks.push(e.data);
      recorder.onstop = () => {
        const blob = new Blob(chunks, { type: "audio/webm" });
        const url = URL.createObjectURL(blob);
        setAudioBlob(blob);
        setAudioUrl(url);
        stream.getTracks().forEach((track) => track.stop());
      };

      recorder.start();
      mediaRecorderRef.current = recorder;
      setIsRecording(true);

      setTimeout(() => {
        if (recorder.state === "recording") recorder.stop();
      }, 15000);
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
      <div className="flex justify-center gap-6 flex-wrap">
        <button
          onClick={startRecording}
          disabled={isRecording}
          className={`flex items-center gap-3 px-8 py-4 rounded-2xl font-semibold text-lg shadow-lg transition-all ${
            isRecording
              ? "bg-red-600 text-white animate-pulse"
              : "bg-emerald-600 text-white hover:bg-emerald-700 hover:scale-105"
          }`}
        >
          {isRecording ? <MicOff className="h-8 w-8" /> : <Mic className="h-8 w-8" />}
          {isRecording ? "Đang ghi âm..." : "Bắt đầu ghi âm"}
        </button>

        {isRecording && (
          <button
            onClick={stopRecording}
            className="flex items-center gap-3 px-8 py-4 bg-gray-600 text-white rounded-2xl font-semibold hover:bg-gray-700 transition shadow-lg"
          >
            Dừng ghi âm
          </button>
        )}
      </div>
    );
  }


  return (
    <div className="flex justify-center gap-6 flex-wrap">
      <button
        onClick={onPlayToggle}
        className="flex items-center gap-3 px-8 py-4 bg-indigo-600 text-white rounded-2xl font-semibold hover:bg-indigo-700 transition shadow-lg hover:scale-105"
      >
        {isPlaying ? <Pause className="h-8 w-8" /> : <Play className="h-8 w-8" />}
        {isPlaying ? "Tạm dừng" : "Nghe lại bản thu"}
      </button>

      <button
        onClick={resetRecording}
        className="flex items-center gap-3 px-8 py-4 bg-orange-600 text-white rounded-2xl font-semibold hover:bg-orange-700 transition shadow-lg hover:scale-105"
      >
        <RotateCcw className="h-8 w-8" />
        Thu lại từ đầu
      </button>
    </div>
  );
}