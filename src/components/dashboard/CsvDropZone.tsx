import { useCallback, useState } from "react";
import { Upload, FileText } from "lucide-react";
import { cn } from "@/lib/utils";

interface CsvDropZoneProps {
  onFileAccepted: (csvString: string) => void;
  accept?: string;
  maxSize?: number;
  className?: string;
}

export function CsvDropZone({
  onFileAccepted,
  accept = ".csv,text/csv,text/plain",
  maxSize = 5 * 1024 * 1024, // 5MB
  className,
}: CsvDropZoneProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const readFile = useCallback(
    (file: File) => {
      setError(null);
      if (file.size > maxSize) {
        setError(`Bestand te groot (max ${maxSize / 1024 / 1024} MB)`);
        return;
      }
      const reader = new FileReader();
      reader.onload = () => {
        const text = reader.result as string;
        if (text && (text.includes(",") || text.includes(";"))) {
          onFileAccepted(text);
        } else {
          setError("Geen geldige CSV gevonden");
        }
      };
      reader.onerror = () => setError("Fout bij lezen bestand");
      reader.readAsText(file, "UTF-8");
    },
    [maxSize, onFileAccepted]
  );

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setIsDragging(false);
      const file = e.dataTransfer.files[0];
      if (file) readFile(file);
    },
    [readFile]
  );

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  }, []);

  const handleFileInput = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (file) readFile(file);
      e.target.value = "";
    },
    [readFile]
  );

  return (
    <div
      onDrop={handleDrop}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      className={cn(
        "relative flex min-h-[140px] cursor-pointer flex-col items-center justify-center gap-2 rounded-xl border-2 border-dashed transition-all duration-200",
        isDragging
          ? "border-primary bg-primary/10 scale-[1.02]"
          : "border-muted-foreground/25 hover:border-primary/50 hover:bg-muted/50",
        className
      )}
    >
      <input
        type="file"
        accept={accept}
        onChange={handleFileInput}
        className="absolute inset-0 cursor-pointer opacity-0"
      />
      {isDragging ? (
        <Upload className="text-primary size-10" />
      ) : (
        <FileText className="text-muted-foreground size-10" />
      )}
      <p className="text-muted-foreground text-center text-sm">
        Sleep een CSV-bestand hierheen of klik om te selecteren
      </p>
      {error && (
        <p className="text-destructive text-sm">{error}</p>
      )}
    </div>
  );
}
