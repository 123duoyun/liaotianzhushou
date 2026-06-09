"use client";

import { useEffect, useRef } from "react";

function readFileAsDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result));
    reader.onerror = () => reject(new Error("读取图片失败"));
    reader.readAsDataURL(file);
  });
}

export default function ScreenshotUploader({
  disabled,
  onImages
}: {
  disabled: boolean;
  onImages: (images: string[]) => void;
}) {
  const inputRef = useRef<HTMLInputElement>(null);

  async function handleFiles(files: FileList | null) {
    const imageFiles = Array.from(files ?? []).filter((file) => file.type.startsWith("image/"));
    if (imageFiles.length === 0) {
      return;
    }
    onImages(await Promise.all(imageFiles.map(readFileAsDataUrl)));
    if (inputRef.current) {
      inputRef.current.value = "";
    }
  }

  useEffect(() => {
    async function handlePaste(event: ClipboardEvent) {
      const files = Array.from(event.clipboardData?.files ?? []).filter((file) => file.type.startsWith("image/"));
      if (files.length > 0 && !disabled) {
        onImages(await Promise.all(files.map(readFileAsDataUrl)));
      }
    }

    window.addEventListener("paste", handlePaste);
    return () => window.removeEventListener("paste", handlePaste);
  }, [disabled, onImages]);

  return (
    <label className="inline-flex h-10 cursor-pointer items-center rounded-xl border border-sage bg-paper px-4 text-sm font-semibold text-ink transition-all duration-200 hover:bg-coral-light">
      📷 上传截图
      <input
        ref={inputRef}
        aria-label="上传截图"
        type="file"
        accept="image/*"
        multiple
        disabled={disabled}
        onChange={(event) => handleFiles(event.target.files)}
        className="sr-only"
      />
    </label>
  );
}
