/**
 * Converts a browser File object to a clean base64 string without data URI headers
 */
export function fileToBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      const result = reader.result as string;
      // Strip off the data URL prefix (e.g. "data:application/pdf;base64,")
      const base64Data = result.split(',')[1] || result;
      resolve(base64Data);
    };
    reader.onerror = (err) => reject(err);
    reader.readAsDataURL(file);
  });
}

/**
 * Extracts human-readable plain text strings from a PDF file ArrayBuffer
 */
export async function extractPdfText(file: File): Promise<string> {
  try {
    const buffer = await file.arrayBuffer();
    const decoder = new TextDecoder("utf-8");
    const rawText = decoder.decode(buffer);

    // Extract text blocks enclosed in parenthesis () within PDF stream operators (Tj, TJ, etc.)
    const textMatches = rawText.match(/\(([^()]{2,})\)\s*(?:Tj|TJ|'|")/g);

    if (textMatches && textMatches.length > 0) {
      const extracted = textMatches
        .map((m) => {
          const inner = m.replace(/^[\s(]+|[\s)\w]+$/g, "").trim();
          return inner.replace(/\\([()])/g, "$1");
        })
        .filter((t) => t.length > 1 && !/^[\d\s\W]+$/.test(t))
        .join(" ");

      if (extracted.length > 50) {
        return extracted;
      }
    }

    // Fallback regex for plain printable text chunks
    const fallbackChunks = rawText.match(/[a-zA-Z0-9\s.,;:'"?!(){}\[\]\-]{15,}/g);
    if (fallbackChunks) {
      return fallbackChunks.join("\n").slice(0, 30000);
    }
  } catch (err) {
    console.warn("Could not extract raw text from PDF:", err);
  }
  return "";
}

/**
 * Formats byte counts to human-readable strings (e.g. 2.4 MB)
 */
export function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
}

/**
 * Truncates a filename if it exceeds a specified max length
 */
export function truncateFileName(name: string, maxLength: number = 24): string {
  if (name.length <= maxLength) return name;
  const extIndex = name.lastIndexOf('.');
  if (extIndex !== -1 && name.length - extIndex <= 5) {
    const ext = name.slice(extIndex);
    const base = name.slice(0, maxLength - ext.length - 3);
    return `${base}...${ext}`;
  }
  return `${name.slice(0, maxLength - 3)}...`;
}

