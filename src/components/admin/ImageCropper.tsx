"use client";

import { useState, useRef, useCallback, useEffect } from "react";

const ASPECT_W = 11;
const ASPECT_H = 16;
const ASPECT_RATIO = ASPECT_W / ASPECT_H; // ~0.6875

interface ImageCropperProps {
  currentImage?: string | null;
  onImageReady: (path: string | null) => void;
}

export function ImageCropper({ currentImage, onImageReady }: ImageCropperProps) {
  const [imageSrc, setImageSrc] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [offset, setOffset] = useState({ x: 0, y: 0 });
  const [scale, setScale] = useState(1);
  const [uploading, setUploading] = useState(false);
  const [savedPath, setSavedPath] = useState<string | null>(currentImage || null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  const imgRef = useRef<HTMLImageElement | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Crop area dimensions (fixed in UI)
  const CROP_W = 220;
  const CROP_H = Math.round(CROP_W / ASPECT_RATIO); // 320

  // Reset state when currentImage changes externally
  useEffect(() => {
    setSavedPath(currentImage || null);
  }, [currentImage]);

  const handleFileSelect = useCallback((file: File) => {
    if (!file.type.startsWith("image/")) return;
    const reader = new FileReader();
    reader.onload = (e) => {
      setImageSrc(e.target?.result as string);
      setOffset({ x: 0, y: 0 });
      setScale(1);
      setSavedPath(null);
      setPreviewUrl(null);
    };
    reader.readAsDataURL(file);
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    const file = e.dataTransfer.files[0];
    if (file) handleFileSelect(file);
  }, [handleFileSelect]);

  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    setIsDragging(true);
    setDragStart({ x: e.clientX - offset.x, y: e.clientY - offset.y });
  }, [offset]);

  const handleMouseMove = useCallback((e: React.MouseEvent) => {
    if (!isDragging) return;
    setOffset({
      x: e.clientX - dragStart.x,
      y: e.clientY - dragStart.y,
    });
  }, [isDragging, dragStart]);

  const handleMouseUp = useCallback(() => {
    setIsDragging(false);
  }, []);

  const handleWheel = useCallback((e: React.WheelEvent) => {
    e.preventDefault();
    const delta = e.deltaY > 0 ? -0.05 : 0.05;
    setScale(prev => Math.max(0.1, Math.min(5, prev + delta)));
  }, []);

  // Generate preview whenever offset/scale changes
  useEffect(() => {
    if (!imageSrc) return;

    const img = new Image();
    img.onload = () => {
      imgRef.current = img;
      generatePreview(img);
    };
    img.src = imageSrc;
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [imageSrc, offset, scale]);

  const generatePreview = useCallback((img: HTMLImageElement) => {
    const canvas = document.createElement("canvas");
    // Output at 2x for retina quality
    const outputW = CROP_W * 2;
    const outputH = CROP_H * 2;
    canvas.width = outputW;
    canvas.height = outputH;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // Calculate how the image is displayed in the crop area
    // The image fills the container, then is scaled and offset
    const containerW = 400;
    const containerH = 400;

    // Image natural aspect
    const imgAspect = img.naturalWidth / img.naturalHeight;
    let displayW: number, displayH: number;
    if (imgAspect > 1) {
      // Landscape: fit height to container
      displayH = containerH;
      displayW = containerH * imgAspect;
    } else {
      // Portrait: fit width to container
      displayW = containerW;
      displayH = containerW / imgAspect;
    }

    // Apply scale
    displayW *= scale;
    displayH *= scale;

    // The crop area is centered in the container
    const cropLeft = (containerW - CROP_W) / 2;
    const cropTop = (containerH - CROP_H) / 2;

    // Image position in container
    const imgLeft = (containerW - displayW) / 2 + offset.x;
    const imgTop = (containerH - displayH) / 2 + offset.y;

    // Map crop area back to image natural coordinates
    const srcX = ((cropLeft - imgLeft) / displayW) * img.naturalWidth;
    const srcY = ((cropTop - imgTop) / displayH) * img.naturalHeight;
    const srcW = (CROP_W / displayW) * img.naturalWidth;
    const srcH = (CROP_H / displayH) * img.naturalHeight;

    ctx.drawImage(img, srcX, srcY, srcW, srcH, 0, 0, outputW, outputH);
    setPreviewUrl(canvas.toDataURL("image/webp", 0.9));
  }, [offset, scale, CROP_W, CROP_H]);

  const handleApply = useCallback(async () => {
    if (!previewUrl) return;
    setUploading(true);

    try {
      // Convert data URL to blob
      const res = await fetch(previewUrl);
      const blob = await res.blob();

      const formData = new FormData();
      formData.append("file", blob, "cropped.webp");

      const uploadRes = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });

      if (!uploadRes.ok) {
        const err = await uploadRes.json();
        alert(err.error || "Upload failed");
        return;
      }

      const { path } = await uploadRes.json();
      setSavedPath(path);
      setImageSrc(null);
      onImageReady(path);
    } catch {
      alert("Upload failed. Please try again.");
    } finally {
      setUploading(false);
    }
  }, [previewUrl, onImageReady]);

  const handleRemove = useCallback(() => {
    setSavedPath(null);
    setImageSrc(null);
    setPreviewUrl(null);
    onImageReady(null);
  }, [onImageReady]);

  // ─── Saved state: show current image with change/remove ───
  if (savedPath && !imageSrc) {
    return (
      <div className="space-y-3">
        <span className="text-slate-400 text-sm">Image</span>
        <div className="flex items-start gap-4">
          <div className="relative shrink-0">
            <div
              className="rounded-lg overflow-hidden border-2 border-cyan-500/30"
              style={{ width: CROP_W * 0.5, height: CROP_H * 0.5 }}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={savedPath}
                alt="Current"
                className="w-full h-full object-cover"
              />
            </div>
            {/* Neon glow effect */}
            <div
              className="absolute inset-0 rounded-lg pointer-events-none"
              style={{
                boxShadow: "0 0 15px rgba(34, 211, 238, 0.15), inset 0 0 15px rgba(34, 211, 238, 0.05)",
              }}
            />
          </div>
          <div className="flex flex-col gap-2 pt-2">
            <button
              onClick={() => fileInputRef.current?.click()}
              className="text-cyan-400 hover:text-cyan-300 text-sm px-3 py-1.5 bg-cyan-900/30 rounded transition-colors"
            >
              Change
            </button>
            <button
              onClick={handleRemove}
              className="text-red-400 hover:text-red-300 text-sm px-3 py-1.5 bg-red-900/30 rounded transition-colors"
            >
              Remove
            </button>
          </div>
        </div>
        <input
          ref={fileInputRef}
          type="file"
          accept="image/jpeg,image/png,image/webp"
          className="hidden"
          onChange={(e) => {
            const file = e.target.files?.[0];
            if (file) handleFileSelect(file);
          }}
        />
      </div>
    );
  }

  // ─── Crop mode: show crop area + preview ───
  if (imageSrc) {
    return (
      <div className="space-y-3">
        <span className="text-slate-400 text-sm">Crop Image (11:16 portrait — matches 3D monitor)</span>
        <div className="flex flex-col lg:flex-row gap-6">
          {/* Crop area */}
          <div className="space-y-3">
            <div
              ref={containerRef}
              className="relative overflow-hidden rounded-lg border border-slate-600 bg-slate-950 select-none"
              style={{ width: 400, height: 400, cursor: isDragging ? "grabbing" : "grab" }}
              onMouseDown={handleMouseDown}
              onMouseMove={handleMouseMove}
              onMouseUp={handleMouseUp}
              onMouseLeave={handleMouseUp}
              onWheel={handleWheel}
              onDrop={handleDrop}
              onDragOver={(e) => e.preventDefault()}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={imageSrc}
                alt="Crop source"
                className="absolute pointer-events-none"
                style={{
                  top: "50%",
                  left: "50%",
                  transform: `translate(-50%, -50%) translate(${offset.x}px, ${offset.y}px) scale(${scale})`,
                  maxWidth: "none",
                  width: "100%",
                  height: "auto",
                }}
                draggable={false}
              />
              {/* Dark overlay with crop window */}
              <div className="absolute inset-0 pointer-events-none">
                {/* Top overlay */}
                <div
                  className="absolute bg-black/60"
                  style={{ top: 0, left: 0, right: 0, height: (400 - CROP_H) / 2 }}
                />
                {/* Bottom overlay */}
                <div
                  className="absolute bg-black/60"
                  style={{ bottom: 0, left: 0, right: 0, height: (400 - CROP_H) / 2 }}
                />
                {/* Left overlay */}
                <div
                  className="absolute bg-black/60"
                  style={{
                    top: (400 - CROP_H) / 2,
                    left: 0,
                    width: (400 - CROP_W) / 2,
                    height: CROP_H,
                  }}
                />
                {/* Right overlay */}
                <div
                  className="absolute bg-black/60"
                  style={{
                    top: (400 - CROP_H) / 2,
                    right: 0,
                    width: (400 - CROP_W) / 2,
                    height: CROP_H,
                  }}
                />
                {/* Crop border */}
                <div
                  className="absolute border-2 border-cyan-400/80 rounded"
                  style={{
                    top: (400 - CROP_H) / 2,
                    left: (400 - CROP_W) / 2,
                    width: CROP_W,
                    height: CROP_H,
                  }}
                />
                {/* Corner guides */}
                {[
                  { top: (400 - CROP_H) / 2 - 1, left: (400 - CROP_W) / 2 - 1 },
                  { top: (400 - CROP_H) / 2 - 1, left: (400 + CROP_W) / 2 - 11 },
                  { top: (400 + CROP_H) / 2 - 11, left: (400 - CROP_W) / 2 - 1 },
                  { top: (400 + CROP_H) / 2 - 11, left: (400 + CROP_W) / 2 - 11 },
                ].map((pos, i) => (
                  <div
                    key={i}
                    className="absolute w-3 h-3 border-2 border-white"
                    style={{
                      ...pos,
                      borderRadius: 1,
                      borderRight: i % 2 === 0 ? "none" : undefined,
                      borderLeft: i % 2 === 1 ? "none" : undefined,
                      borderBottom: i < 2 ? "none" : undefined,
                      borderTop: i >= 2 ? "none" : undefined,
                    }}
                  />
                ))}
              </div>
            </div>

            {/* Zoom slider */}
            <div className="flex items-center gap-3">
              <span className="text-slate-500 text-xs">Zoom</span>
              <input
                type="range"
                min="0.1"
                max="5"
                step="0.01"
                value={scale}
                onChange={(e) => setScale(parseFloat(e.target.value))}
                className="flex-1 accent-cyan-500 h-1"
              />
              <span className="text-slate-500 text-xs w-12 text-right">{Math.round(scale * 100)}%</span>
            </div>
          </div>

          {/* Live preview */}
          <div className="space-y-2">
            <span className="text-slate-500 text-xs uppercase tracking-wider">Preview — 3D Monitor</span>
            <div className="relative inline-block">
              {previewUrl && (
                <div
                  className="rounded overflow-hidden"
                  style={{ width: CROP_W * 0.6, height: CROP_H * 0.6 }}
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={previewUrl}
                    alt="Preview"
                    className="w-full h-full object-cover"
                  />
                </div>
              )}
              {/* Neon frame mock */}
              <div
                className="absolute inset-0 rounded pointer-events-none"
                style={{
                  border: "2px solid rgba(34, 211, 238, 0.6)",
                  boxShadow: "0 0 20px rgba(34, 211, 238, 0.2), 0 0 40px rgba(34, 211, 238, 0.1)",
                }}
              />
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="flex gap-3">
          <button
            onClick={handleApply}
            disabled={uploading}
            className="bg-cyan-600 hover:bg-cyan-500 disabled:bg-cyan-800 disabled:text-cyan-400 px-4 py-2 rounded text-white text-sm font-medium transition-colors"
          >
            {uploading ? "Uploading..." : "Apply Crop"}
          </button>
          <button
            onClick={() => {
              setImageSrc(null);
              setPreviewUrl(null);
            }}
            className="bg-slate-700 hover:bg-slate-600 px-4 py-2 rounded text-white text-sm transition-colors"
          >
            Cancel
          </button>
        </div>
      </div>
    );
  }

  // ─── Empty state: upload prompt ───
  return (
    <div className="space-y-2">
      <span className="text-slate-400 text-sm">Image</span>
      <div
        className="border-2 border-dashed border-slate-700 hover:border-cyan-500/50 rounded-lg p-8 text-center cursor-pointer transition-colors group"
        onClick={() => fileInputRef.current?.click()}
        onDrop={handleDrop}
        onDragOver={(e) => {
          e.preventDefault();
          e.stopPropagation();
        }}
      >
        <div className="text-slate-500 group-hover:text-cyan-400 transition-colors">
          <svg className="mx-auto mb-2 w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
          <p className="text-sm font-medium">Click to upload or drag and drop</p>
          <p className="text-xs text-slate-600 mt-1">JPEG, PNG, or WebP — max 5 MB</p>
        </div>
      </div>
      <input
        ref={fileInputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp"
        className="hidden"
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (file) handleFileSelect(file);
        }}
      />
    </div>
  );
}
