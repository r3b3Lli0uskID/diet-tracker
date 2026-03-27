export function blobToBase64(blob: Blob): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => {
      if (typeof reader.result === "string") {
        resolve(reader.result);
      } else {
        reject(new Error("Failed to read blob as base64 string"));
      }
    };
    reader.onerror = () => reject(new Error("FileReader error"));
    reader.readAsDataURL(blob);
  });
}

export function base64ToBlob(b64: string, type: string): Blob {
  const raw = b64.startsWith("data:")
    ? b64.slice(b64.indexOf(",") + 1)
    : b64;

  const byteString = atob(raw);
  const bytes = new Uint8Array(byteString.length);

  for (let i = 0; i < byteString.length; i++) {
    bytes[i] = byteString.charCodeAt(i);
  }

  return new Blob([bytes], { type });
}
