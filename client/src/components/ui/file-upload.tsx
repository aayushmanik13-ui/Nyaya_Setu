import { useRef, useState } from "react";
import { Upload, FileText, X } from "lucide-react";
import { cn } from "@/lib/utils";

interface FileUploadProps {
  onFileSelect: (file: File) => void;
  className?: string;
  accept?: string;
}

export function FileUpload({ onFileSelect, className, accept = ".pdf,.jpg,.jpeg,.png" }: FileUploadProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [dragActive, setDragActive] = useState(false);
  const [fileName, setFileName] = useState<string | null>(null);

  const handleFile = (file: File) => {
    // Validate file size (10MB limit as per requirements)
    if (file.size > 10 * 1024 * 1024) {
      alert("File size exceeds 10MB limit.");
      return;
    }
    setFileName(file.name);
    onFileSelect(file);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      handleFile(e.target.files[0]);
    }
  };

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFile(e.dataTransfer.files[0]);
    }
  };

  const clearFile = (e: React.MouseEvent) => {
    e.stopPropagation();
    setFileName(null);
    if (inputRef.current) inputRef.current.value = "";
    // Note: Parent component needs to handle clearing if needed
  };

  return (
    <div
      className={cn(
        "relative group cursor-pointer flex flex-col items-center justify-center w-full h-64 rounded-2xl border-2 border-dashed transition-all duration-300 ease-out",
        dragActive 
          ? "border-primary bg-primary/5 scale-[1.01]" 
          : "border-border hover:border-primary/50 hover:bg-muted/30",
        fileName ? "border-solid border-primary/20 bg-muted/20" : "",
        className
      )}
      onDragEnter={handleDrag}
      onDragLeave={handleDrag}
      onDragOver={handleDrag}
      onDrop={handleDrop}
      onClick={() => inputRef.current?.click()}
    >
      <input
        ref={inputRef}
        type="file"
        className="hidden"
        accept={accept}
        onChange={handleChange}
      />

      {fileName ? (
        <div className="flex flex-col items-center gap-4 animate-in">
          <div className="p-4 bg-primary/10 rounded-full text-primary">
            <FileText className="w-8 h-8" />
          </div>
          <p className="text-lg font-medium text-foreground text-center px-4 max-w-xs truncate">
            {fileName}
          </p>
          <button
            onClick={clearFile}
            className="flex items-center gap-2 text-sm text-muted-foreground hover:text-destructive transition-colors px-3 py-1 rounded-full hover:bg-destructive/10"
          >
            <X className="w-4 h-4" /> Remove file
          </button>
        </div>
      ) : (
        <div className="flex flex-col items-center gap-4 text-center p-6">
          <div className={cn(
            "p-4 rounded-full transition-colors duration-300",
            dragActive ? "bg-primary/10 text-primary" : "bg-muted text-muted-foreground group-hover:bg-primary/5 group-hover:text-primary"
          )}>
            <Upload className="w-8 h-8" />
          </div>
          <div className="space-y-1">
            <p className="text-lg font-semibold text-foreground">
              Click to upload or drag and drop
            </p>
            <p className="text-sm text-muted-foreground">
              PDF, PNG or JPG (max 10MB)
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
