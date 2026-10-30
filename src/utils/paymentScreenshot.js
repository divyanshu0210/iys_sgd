import Tesseract from "tesseract.js";

const linesOf = (text) => text.split("\n").map((line) => line.trim()).filter(Boolean);

export function matchesAmount(text, expected) {
  const rawNumbers = text.match(/\d[\d,]*/g) || [];
  const variants = rawNumbers.flatMap((raw) => {
    const number = raw.replace(/,/g, "");
    return [Number(number), ...(number.length > 1 ? [Number(number.slice(1))] : [])].filter((value) => value > 0);
  });
  const lineAmounts = linesOf(text).flatMap((line) => {
    const cleaned = line.replace(/[’'`]/g, "").replace(/[^\d\s]/g, " ").replace(/\s+/g, " ").trim();
    if (!/^(?:\d\s*){3,6}$/.test(cleaned)) return [];
    const amount = Number(cleaned.replace(/\s/g, ""));
    return amount >= 10 && amount <= 100000 ? [amount] : [];
  });
  return variants.includes(expected) || lineAmounts.includes(Number(expected));
}

export function matchesTransactionId(text, transactionId) {
  const direct = text.match(/\b\d{12,18}\b/g) || [];
  const spaced = linesOf(text).flatMap((line) => {
    const cleaned = line.replace(/[^\d\s]/g, " ").replace(/\s+/g, " ").trim();
    return /^(?:\d\s*){12,18}$/.test(cleaned) ? [cleaned.replace(/\s/g, "")] : [];
  });
  return [...direct, ...spaced].includes(String(transactionId).replace(/\s/g, ""));
}

export function matchesAccountName(text, accountName) {
  const normalize = (value) => value.normalize("NFKC").toLowerCase().replace(/[^\p{L}\p{N}]+/gu, " ").trim();
  return ` ${normalize(text || "")} `.includes(` ${normalize(accountName)} `);
}

export async function extractScreenshotText(imageFile) {
  let tesseractText = "";
  try {
    const result = await Tesseract.recognize(imageFile, "eng");
    tesseractText = result.data.text || "";
  } catch (error) {
    console.error("Tesseract failed", error);
  }

  let fallbackText = "";
  const getOCRSpaceText = () => {
    if (fallbackText) return Promise.resolve(fallbackText);
    return (async () => {
        try {
          const formData = new FormData();
          formData.append("file", imageFile);
          formData.append("apikey", "200f6d298a88957");
          formData.append("language", "eng");
          formData.append("OCREngine", "2");
          const response = await fetch("https://api.ocr.space/parse/image", { method: "POST", body: formData });
          const data = await response.json();
          fallbackText = data?.ParsedResults?.[0]?.ParsedText || "";
          return fallbackText;
        } catch (error) {
          console.error("OCR.space failed", error);
          return "";
        }
      })();
  };
  return { tesseractText, getOCRSpaceText };
}
