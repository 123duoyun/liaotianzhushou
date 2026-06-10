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
    <label className="inline-flex h-9 cursor-pointer items-center justify-center rounded-xl border border-white/[0.08] bg-white/[0.04] px-3.5 text-xs font-semibold text-sage transition-all duration-200 hover:border-coral/30 hover:text-coral">
      <span className="flex items-center gap-1.5">
        <span className="text-sm">📷</span>
        上传截图
      </span>
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
