export function humanizeSize(sizeInBytes: number): string {
  const units = ["Bytes", "KB", "MB", "GB", "TB"];
  let i = 0;

  while (sizeInBytes >= 1024) {
    sizeInBytes /= 1024;
    i++;
  }

  return `${sizeInBytes.toFixed(2)} ${units[i]}`;
}

export const arrayBufferToBase64 = (prefix: string, buffer: ArrayBuffer): string => {
  let binary = '';
  const bytes = [].slice.call(new Uint8Array(buffer));
  bytes.forEach((b) => (binary += String.fromCharCode(b)));
  return prefix + window.btoa(binary);
};

export const pngArrayBufferToBase64 = (buffer: ArrayBuffer): string => {
  return arrayBufferToBase64('data:image/png;base64,', buffer);
}