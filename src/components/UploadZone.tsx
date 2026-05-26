import React, { useState, useRef } from "react";
import { Upload, FileText, Music, AlertCircle, Loader2 } from "lucide-react";

interface UploadZoneProps {
  onFileReady: (base64Data: string, mimeType: string, fileName: string, fileSize: string, fileType: 'pdf' | 'audio') => void;
  isLoading: boolean;
}

export default function UploadZone({ onFileReady, isLoading }: UploadZoneProps) {
  const [isDragActive, setIsDragActive] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [readingFile, setReadingFile] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const processFile = (file: File) => {
    setError(null);

    // Validate size (max 25MB for convenience and prompt performance)
    const MAX_SIZE_MB = 25;
    if (file.size > MAX_SIZE_MB * 1024 * 1024) {
      setError(`File is too large. Maximum supported size is ${MAX_SIZE_MB}MB.`);
      return;
    }

    // Determine type
    let fileType: 'pdf' | 'audio' | null = null;
    const mime = file.type;

    if (mime === "application/pdf" || file.name.endsWith(".pdf")) {
      fileType = "pdf";
    } else if (
      mime.startsWith("audio/") ||
      /\.(mp3|wav|m4a|aac|ogg|mpeg|webm)$/i.test(file.name)
    ) {
      fileType = "audio";
    }

    if (!fileType) {
      setError("Unsupported format. Please upload a PDF or an audio file (MP3, WAV, M4A, AAC, WebM).");
      return;
    }

    const sizeFormatted = (file.size / (1024 * 1024)).toFixed(2) + " MB";
    const finalMime = mime || (fileType === "pdf" ? "application/pdf" : "audio/mpeg");

    setReadingFile(true);
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const result = e.target?.result as string;
        if (!result) throw new Error("Could not read file.");
        
        // Extract base64 part
        const base64Data = result.split(",")[1];
        if (!base64Data) throw new Error("Failed to encode file.");

        onFileReady(base64Data, finalMime, file.name, sizeFormatted, fileType);
      } catch (err: any) {
        setError("Error processing file encoding. Please try again.");
      } finally {
        setReadingFile(false);
      }
    };

    reader.onerror = () => {
      setError("Failed to read file.");
      setReadingFile(false);
    };

    reader.readAsDataURL(file);
  };

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setIsDragActive(true);
    } else if (e.type === "dragleave") {
      setIsDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      processFile(e.dataTransfer.files[0]);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    e.preventDefault();
    if (e.target.files && e.target.files[0]) {
      processFile(e.target.files[0]);
    }
  };

  const triggerFileInput = () => {
    fileInputRef.current?.click();
  };

  return (
    <div id="upload-zone-container" className="w-full">
      <div
        id="drag-and-drop-area"
        onDragEnter={handleDrag}
        onDragOver={handleDrag}
        onDragLeave={handleDrag}
        onDrop={handleDrop}
        onClick={triggerFileInput}
        className={`relative border-2 border-dashed rounded-2xl p-8 text-center cursor-pointer transition-all duration-300 group
          ${isDragActive 
            ? "border-indigo-600 bg-indigo-50/35" 
            : "border-slate-200 hover:border-indigo-500 hover:bg-slate-50/50"
          } 
          ${(isLoading || readingFile) ? "pointer-events-none opacity-80" : ""}`}
      >
        <input
          ref={fileInputRef}
          type="file"
          className="hidden"
          accept="application/pdf, audio/*"
          onChange={handleChange}
          disabled={isLoading || readingFile}
        />

        <div className="flex flex-col items-center justify-center space-y-4">
          <div className="relative flex items-center justify-center w-14 h-14 rounded-full bg-slate-100 group-hover:bg-indigo-100 transition-colors duration-300">
            {readingFile || isLoading ? (
              <Loader2 className="w-7 h-7 text-indigo-600 animate-spin" />
            ) : (
              <Upload className="w-6 h-6 text-slate-500 group-hover:text-indigo-600 transition-colors duration-300" />
            )}
            
            <div className="absolute -bottom-1 -right-1 bg-white p-1 rounded-full shadow-sm border border-slate-100">
              <FileText className="w-3.5 h-3.5 text-indigo-600" />
            </div>
            <div className="absolute -top-1 -left-1 bg-white p-1 rounded-full shadow-sm border border-slate-100">
              <Music className="w-3.5 h-3.5 text-indigo-600" />
            </div>
          </div>

          <div className="space-y-1.5">
            <h3 className="font-sans font-bold text-base text-slate-800">
              {readingFile ? "Reading uploaded file..." : isLoading ? "Gemini is writing study notes..." : "Add New Source"}
            </h3>
            <p className="font-sans text-xs text-slate-500 max-w-sm mx-auto">
              Drag &amp; drop PDF or Audio clip here or click to browse
            </p>
          </div>

          <div className="flex items-center space-x-3 pt-2 text-[10px] text-slate-400 font-mono">
            <span className="flex items-center">
              <FileText className="w-3 h-3 mr-1" /> PDF
            </span>
            <span>•</span>
            <span className="flex items-center">
              <Music className="w-3 h-3 mr-1" /> Audio
            </span>
            <span>•</span>
            <span>Max 25MB</span>
          </div>
        </div>
      </div>

      {error && (
        <div id="upload-error-alert" className="mt-4 flex items-start space-x-2.5 p-3.5 rounded-xl bg-rose-50 border border-rose-100 text-rose-800">
          <AlertCircle className="w-4 h-4 mt-0.5 text-rose-500 shrink-0" />
          <div className="text-xs">
            <p className="font-bold font-sans text-rose-950">Processing Error</p>
            <p className="font-sans mt-0.5">{error}</p>
          </div>
        </div>
      )}
    </div>
  );
}
