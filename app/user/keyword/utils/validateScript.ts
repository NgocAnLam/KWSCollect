/**
 * So sánh transcript từ SpeechRecognition với script mong đợi.
 * - validateScript: khớp chính xác (bước 3 - keyword).
 * - validateSentenceScript: cho phép tối đa 2 từ sai (bước 4 - câu dài).
 */

export interface ScriptValidationResult {
  accepted: boolean;
  reason?: string;
}

/** Chuẩn hóa chuỗi để so sánh: lowercase, trim, gộp khoảng trắng, bỏ dấu tiếng Việt. */
export function normalizeForCompare(s: string): string {
  let t = (s || "").trim().toLowerCase().replace(/\s+/g, " ");
  t = t.normalize("NFD").replace(/\p{Diacritic}/gu, "");
  return t;
}

/**
 * Bước 3 (keyword): Kiểm tra transcript khớp chính xác với từ khóa.
 * - Transcript rỗng → không nghe rõ.
 * - Transcript phải bằng đúng script (không thừa, không thiếu từ).
 */
export function validateScript(transcript: string, expectedKeyword: string): ScriptValidationResult {
  const keyword = (expectedKeyword || "").trim();
  if (!keyword) {
    return { accepted: true };
  }

  const transcriptNorm = normalizeForCompare(transcript).replace(/\.$/, "");
  const keywordNorm = normalizeForCompare(keyword).replace(/\.$/, "");
  
  console.log(`transcriptNorm: ${transcriptNorm} - keywordNorm: ${keywordNorm}`);

  if (!transcriptNorm) {
    return {
      accepted: false,
      reason: "Không nghe rõ. Vui lòng nói đúng từ khóa.",
    };
  }

  if (transcriptNorm !== keywordNorm) {
    return {
      accepted: false,
      reason: `Bạn nói không đúng từ khóa. Mong đợi: "${expectedKeyword}".`,
    };
  }

  return { accepted: true };
}

/** Khoảng cách chỉnh sửa (Levenshtein) trên mảng từ. */
function wordEditDistance(expectedWords: string[], transcriptWords: string[]): number {
  const n = expectedWords.length;
  const m = transcriptWords.length;
  const d: number[][] = Array.from({ length: n + 1 }, () => Array(m + 1).fill(0));
  for (let j = 0; j <= m; j++) d[0][j] = j;
  for (let i = 0; i <= n; i++) d[i][0] = i;
  for (let i = 1; i <= n; i++) {
    for (let j = 1; j <= m; j++) {
      const cost = expectedWords[i - 1] === transcriptWords[j - 1] ? 0 : 1;
      d[i][j] = Math.min(
        d[i - 1][j - 1] + cost,
        d[i - 1][j] + 1,
        d[i][j - 1] + 1
      );
    }
  }
  return d[n][m];
}

const MAX_SENTENCE_WORD_ERRORS = 2;

/**
 * Bước 4 (câu dài): Kiểm tra transcript so với script, cho phép tối đa 2 từ sai.
 * So sánh theo từ (sau khi chuẩn hóa), dùng khoảng cách chỉnh sửa.
 */
export function validateSentenceScript(
  transcript: string,
  expectedSentence: string
): ScriptValidationResult {
  const sentence = (expectedSentence || "").trim();
  if (!sentence) {
    return { accepted: true };
  }

  const transcriptNorm = normalizeForCompare(transcript).replace(/\.$/, "");
  const sentenceNorm = normalizeForCompare(sentence).replace(/[.,"]/g, '');

  if (!transcriptNorm) {
    return {
      accepted: false,
      reason: "Không nghe rõ. Vui lòng đọc đúng nội dung câu.",
    };
  }

  const expectedWords = sentenceNorm.split(/\s+/).filter(Boolean);
  const transcriptWords = transcriptNorm.split(/\s+/).filter(Boolean);
  const errors = wordEditDistance(expectedWords, transcriptWords);

  if (errors <= MAX_SENTENCE_WORD_ERRORS) {
    return { accepted: true };
  }

  return {
    accepted: false,
    reason: `Bạn đọc không đúng nội dung script. Mong đợi: "${expectedSentence}".`,
  };
}
