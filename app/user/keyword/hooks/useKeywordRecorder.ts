"use client";
import { useEffect, useRef, useState } from "react";

type RecordStatus = "idle" | "recording" | "processing" | "accepted" | "rejected";
const REPEATS = 5;

interface RecordItem {
  audioUrl: string | null;
  blob: Blob | null;
  status: RecordStatus;
}

interface Keyword {
  id: number;
  text: string;
}

interface KeywordListResponse {
  keywords: Keyword[];
  total: number;
}

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

  useEffect(() => {
    const fetchKeywords = async () => {
      try {
        const res = await fetch(
          `${process.env.NEXT_PUBLIC_SERVER_URL}/user/keyword`,
          {headers: {"ngrok-skip-browser-warning": "true"}}
        );
        if (!res.ok) throw new Error(`Không thể tải danh sách từ khóa (HTTP ${res.status})`);
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
  const progressPercent = keywords.length > 0 ? Math.round((totalCompleted / totalRecordings) * 100) : 0;
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

        const fd = new FormData();
        fd.append("user_id", String(userId));
        fd.append("keyword", currentKeyword);
        fd.append("keyword_id", String(currentKeywordId));
        fd.append("repeat_index", String(rowIndex + 1));
        fd.append("file", blob, `kw_${currentKeywordIdx}_${rowIndex}.webm`);

        try {
          const res = await fetch("/api/user/keyword/upload", {
            method: "POST",
            body: fd,
          });

          if (!res.ok) {
            let errorMessage = "Upload thất bại";
            try {
              const errorData = await res.json();
              errorMessage = errorData.error || errorMessage;
            } catch (e) {
              errorMessage = `Upload thất bại (HTTP ${res.status})`;
            }
            throw new Error(errorMessage);
          }

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
      setTimeout(() => recorder.stop(), 3000);
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

  useEffect(() => {return () => cleanup()}, []);

  // Tự động chuyển sang keyword tiếp theo khi hoàn thành keyword hiện tại (nếu có nhiều keyword)
  useEffect(() => {
    if (isCurrentDone && keywords.length > 1 && currentKeywordIdx < keywords.length - 1) {
      // Tự động chuyển sang keyword tiếp theo
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
  }, [isCurrentDone, keywords.length, currentKeywordIdx]);

  // Tự động gọi onComplete khi tất cả keyword đã hoàn tất
  // isAllDone chỉ true khi totalCompleted === totalRecordings (tất cả keyword đã hoàn thành)
  // Chỉ gọi khi có keywords và tất cả đã hoàn thành
  const onCompleteCalledRef = useRef(false);
  useEffect(() => {
    if (isAllDone && onComplete && keywords.length > 0 && !onCompleteCalledRef.current) {
      onCompleteCalledRef.current = true;
      onComplete();
    }
    // Reset khi keywords thay đổi (khi fetch lại)
    if (keywords.length === 0) {
      onCompleteCalledRef.current = false;
    }
  }, [isAllDone, onComplete, keywords.length]);

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
  };
}