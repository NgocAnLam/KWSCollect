// app/user/hooks/useKeywordRecorder.ts
"use client";

import { useEffect, useRef, useState } from "react";

type RecordStatus = "idle" | "recording" | "processing" | "accepted" | "rejected";

interface RecordItem {
  audioUrl: string | null;
  blob: Blob | null;
  status: RecordStatus;
}

interface Keyword {
  id: number;
  text: string;
}

// Response từ API /keyword/
interface KeywordListResponse {
  keywords: Keyword[];
  total: number;
}

const REPEATS = 5;

export function useKeywordRecorder(userId: number | null, onComplete?: () => void) {
  const [keywords, setKeywords] = useState<Keyword[]>([]);
  const [currentKeywordIdx, setCurrentKeywordIdx] = useState(0);
  const [records, setRecords] = useState<RecordItem[]>(
    Array(REPEATS).fill(null).map(() => ({ audioUrl: null, blob: null, status: "idle" }))
  );
  const [completedCounts, setCompletedCounts] = useState<number[]>([]);
  const [volumes, setVolumes] = useState<number[]>(Array(REPEATS).fill(0));

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const audioCtxRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const rafRef = useRef<number | null>(null);

  // Fetch danh sách keywords từ server
  useEffect(() => {
    const fetchKeywords = async () => {
      try {
        const res = await fetch(`${process.env.NEXT_PUBLIC_USER_KEYWORD_URL}`);
        if (!res.ok) {
          throw new Error(`Không thể tải danh sách từ khóa (HTTP ${res.status})`);
        }

        const response: KeywordListResponse = await res.json();

        setKeywords(response.keywords);
        setCompletedCounts(Array(response.keywords.length).fill(0));
        setLoading(false);
      } catch (err: any) {
        console.error("Lỗi fetch keywords:", err);
        setError(err.message || "Không thể kết nối đến server");
        setLoading(false);
      }
    };

    fetchKeywords();
  }, []);

  const currentKeyword = keywords[currentKeywordIdx]?.text || "";
  const currentKeywordId = keywords[currentKeywordIdx]?.id;

  const totalRecordings = keywords.length * REPEATS;
  const totalCompleted = completedCounts.reduce((a, b) => a + b, 0);
  const progressPercent =
    keywords.length > 0 ? Math.round((totalCompleted / totalRecordings) * 100) : 0;

  const isCurrentDone = records.every((r) => r.status === "accepted");
  const isAllDone = totalCompleted === totalRecordings;

  const cleanup = () => {
    if (mediaRecorderRef.current?.state !== "inactive") {
      mediaRecorderRef.current?.stop();
    }
    streamRef.current?.getTracks().forEach((t) => t.stop());
    if (audioCtxRef.current) audioCtxRef.current.close();
    if (rafRef.current) cancelAnimationFrame(rafRef.current);
    setVolumes(Array(REPEATS).fill(0));
  };

  const startRecording = async (rowIndex: number) => {
    cleanup();

    setRecords((prev) =>
      prev.map((r, i) => (i === rowIndex ? { ...r, status: "recording" } : r))
    );

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      streamRef.current = stream;

      const audioCtx = new AudioContext();
      await audioCtx.resume();
      audioCtxRef.current = audioCtx;

      const analyser = audioCtx.createAnalyser();
      analyser.fftSize = 256;
      analyser.smoothingTimeConstant = 0.85;
      analyserRef.current = analyser;

      const source = audioCtx.createMediaStreamSource(stream);
      source.connect(analyser);

      const recorder = new MediaRecorder(stream, { mimeType: "audio/webm" });
      mediaRecorderRef.current = recorder;

      const chunks: Blob[] = [];
      recorder.ondataavailable = (e) => {
        if (e.data.size > 0) chunks.push(e.data);
      };

      recorder.onstop = async () => {
        const blob = new Blob(chunks, { type: "audio/webm" });
        const audioUrl = URL.createObjectURL(blob);

        setRecords((prev) =>
          prev.map((r, i) =>
            i === rowIndex ? { ...r, audioUrl, blob, status: "processing" } : r
          )
        );

        // Upload lên server
        const fd = new FormData();
        fd.append("user_id", String(userId));
        fd.append("keyword", currentKeyword);
        fd.append("keyword_id", String(currentKeywordId));
        fd.append("repeat_index", String(rowIndex + 1));
        fd.append("file", blob, `kw_${currentKeywordIdx}_${rowIndex}.webm`);

        try {
          const res = await fetch(`${process.env.NEXT_PUBLIC_USER_KEYWORD_URL}/upload`, {
            method: "POST",
            body: fd,
          });

          if (!res.ok) throw new Error("Upload thất bại");

          const data = await res.json();
          const accepted = data.accepted === true;

          setRecords((prev) =>
            prev.map((r, i) =>
              i === rowIndex ? { ...r, status: accepted ? "accepted" : "rejected" } : r
            )
          );

          if (accepted) {
            setCompletedCounts((prev) => {
              const newCounts = [...prev];
              newCounts[currentKeywordIdx]++;
              return newCounts;
            });
          }
        } catch (err) {
          console.error("Lỗi upload:", err);
          setRecords((prev) =>
            prev.map((r, i) =>
              i === rowIndex ? { ...r, status: "rejected" } : r
            )
          );
        }
      };

      recorder.start();
      measureVolume(rowIndex);
      setTimeout(() => recorder.stop(), 2000);
    } catch (err) {
      alert("Không thể truy cập micro. Vui lòng kiểm tra quyền truy cập.");
      setRecords((prev) =>
        prev.map((r, i) => (i === rowIndex ? { ...r, status: "idle" } : r))
      );
    }
  };

  const measureVolume = (rowIndex: number) => {
    if (!analyserRef.current) return;

    const data = new Uint8Array(analyserRef.current.frequencyBinCount);
    analyserRef.current.getByteFrequencyData(data);
    const avg = data.reduce((a, b) => a + b, 0) / data.length;
    const volume = Math.min(100, Math.round((avg / 128) * 120));

    setVolumes((prev) => {
      const newV = [...prev];
      newV[rowIndex] = volume;
      return newV;
    });

    rafRef.current = requestAnimationFrame(() => measureVolume(rowIndex));
  };

  const retry = (rowIndex: number) => {
    setRecords((prev) =>
      prev.map((r, i) =>
        i === rowIndex ? { audioUrl: null, blob: null, status: "idle" } : r
      )
    );
    setVolumes((prev) => {
      const newV = [...prev];
      newV[rowIndex] = 0;
      return newV;
    });
  };

  const nextKeyword = () => {
    if (isCurrentDone && currentKeywordIdx < keywords.length - 1) {
      setCurrentKeywordIdx((prev) => prev + 1);
      setRecords(
        Array(REPEATS).fill(null).map(() => ({
          audioUrl: null,
          blob: null,
          status: "idle",
        }))
      );
      setVolumes(Array(REPEATS).fill(0));
    }
  };

  // Cleanup khi component unmount
  useEffect(() => {
    return () => cleanup();
  }, []);

  return {
    keywords,
    currentKeywordIdx,
    currentKeyword,
    records,
    volumes,
    completedCounts,
    progressPercent,
    totalCompleted,
    totalRecordings,
    isCurrentDone,
    isAllDone,
    loading,
    error,
    startRecording,
    retry,
    nextKeyword,
    onComplete: isAllDone ? onComplete : undefined,
  };
}