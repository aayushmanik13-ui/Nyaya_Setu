import { useState, useEffect } from "react";
import { Layout } from "@/components/Layout";
import { Button } from "@/components/ui/button";
import { FileUpload } from "@/components/ui/file-upload";
import { useDecodeDocument } from "@/hooks/use-decode";
import { useLocation } from "wouter";
import { Loader2, ArrowLeft, Check, FileText } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { db } from "@/lib/db";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

// Steps in the flow
type Step = "upload" | "preview" | "language" | "processing";

export default function UploadFlow() {
  const [step, setStep] = useState<Step>("upload");
  const [file, setFile] = useState<File | null>(null);
  const [fileUrl, setFileUrl] = useState<string | null>(null);
  const [language, setLanguage] = useState<string>("English");
  const [, setLocation] = useLocation();
  const decodeMutation = useDecodeDocument();

  // Cleanup object URL
  useEffect(() => {
    return () => {
      if (fileUrl) URL.revokeObjectURL(fileUrl);
    };
  }, [fileUrl]);

  const handleFileSelect = (selectedFile: File) => {
    setFile(selectedFile);
    setFileUrl(URL.createObjectURL(selectedFile));
    setStep("preview");
  };

  const handleProcess = async () => {
    if (!file) return;
    setStep("processing");
    
    try {
      const result = await decodeMutation.mutateAsync({ file, language });
      
      // Save to IndexedDB
      const id = await db.addDocument({
        title: result.docType || "Decoded Document",
        createdAt: new Date(),
        fileBlob: file,
        previewUrl: URL.createObjectURL(file), // Stored locally
        language,
        decodedResult: result,
      });
      
      setLocation(`/result/${id}`);
    } catch (error) {
      // Error is handled by mutation onError toast
      setStep("language"); // Go back to try again
    }
  };

  return (
    <Layout>
      <div className="max-w-2xl mx-auto py-8">
        {/* Progress Stepper */}
        <div className="flex items-center justify-center mb-12 space-x-4">
          {["Upload", "Preview", "Details"].map((label, idx) => {
            const stepIdx = ["upload", "preview", "language", "processing"].indexOf(step);
            const isCompleted = stepIdx > idx;
            const isCurrent = stepIdx === idx;
            
            return (
              <div key={label} className="flex items-center">
                <div className={`flex items-center justify-center w-8 h-8 rounded-full text-xs font-bold transition-colors ${
                  isCompleted ? "bg-primary text-primary-foreground" : 
                  isCurrent ? "border-2 border-primary text-primary" : "bg-muted text-muted-foreground"
                }`}>
                  {isCompleted ? <Check className="w-4 h-4" /> : idx + 1}
                </div>
                {idx < 2 && <div className={`w-12 h-0.5 mx-2 transition-colors ${isCompleted ? "bg-primary" : "bg-muted"}`} />}
              </div>
            );
          })}
        </div>

        <AnimatePresence mode="wait">
          {step === "upload" && (
            <motion.div
              key="upload"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="space-y-6"
            >
              <div className="text-center space-y-2 mb-8">
                <h2 className="text-3xl font-serif font-bold">Upload Document</h2>
                <p className="text-muted-foreground">Select a legal notice, contract, or court order.</p>
              </div>
              
              <FileUpload onFileSelect={handleFileSelect} className="h-80" />
            </motion.div>
          )}

          {step === "preview" && file && fileUrl && (
            <motion.div
              key="preview"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="space-y-6"
            >
              <div className="flex items-center gap-4 mb-6">
                <Button variant="ghost" size="icon" onClick={() => setStep("upload")}>
                  <ArrowLeft className="w-5 h-5" />
                </Button>
                <div>
                  <h2 className="text-2xl font-serif font-bold">Verify Document</h2>
                  <p className="text-sm text-muted-foreground">Make sure the text is readable.</p>
                </div>
              </div>

              <div className="bg-muted/20 rounded-xl overflow-hidden border border-border/50 max-h-[500px] overflow-y-auto">
                {file.type.includes("pdf") ? (
                  <div className="flex flex-col items-center justify-center h-64 text-muted-foreground">
                    <FileText className="w-16 h-16 mb-4 opacity-50" />
                    <p>PDF Preview Not Supported In-Browser</p>
                    <p className="text-xs mt-2">{file.name}</p>
                  </div>
                ) : (
                  <img src={fileUrl} alt="Preview" className="w-full h-auto object-contain" />
                )}
              </div>

              <div className="flex justify-end pt-4">
                <Button onClick={() => setStep("language")} size="lg" className="rounded-full px-8">
                  Looks Good
                </Button>
              </div>
            </motion.div>
          )}

          {step === "language" && (
            <motion.div
              key="language"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="space-y-8"
            >
              <div className="flex items-center gap-4">
                <Button variant="ghost" size="icon" onClick={() => setStep("preview")}>
                  <ArrowLeft className="w-5 h-5" />
                </Button>
                <div>
                  <h2 className="text-2xl font-serif font-bold">Select Output Language</h2>
                  <p className="text-sm text-muted-foreground">We will translate the summary for you.</p>
                </div>
              </div>

              <div className="p-6 bg-card border rounded-2xl shadow-sm space-y-4">
                <label className="text-sm font-medium text-muted-foreground">Target Language</label>
                <Select value={language} onValueChange={setLanguage}>
                  <SelectTrigger className="w-full h-12 text-lg">
                    <SelectValue placeholder="Select Language" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="English">English</SelectItem>
                    <SelectItem value="Hindi">Hindi (हिंदी)</SelectItem>
                    <SelectItem value="Marathi">Marathi (मराठी)</SelectItem>
                    <SelectItem value="Tamil">Tamil (தமிழ்)</SelectItem>
                    <SelectItem value="Telugu">Telugu (తెలుగు)</SelectItem>
                    <SelectItem value="Bengali">Bengali (বাংলা)</SelectItem>
                    <SelectItem value="Gujarati">Gujarati (ગુજરાતી)</SelectItem>
                    <SelectItem value="Punjabi">Punjabi (ਪੰਜਾਬੀ)</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="bg-blue-50 dark:bg-blue-950/30 p-4 rounded-xl text-sm text-blue-700 dark:text-blue-300 flex gap-3">
                <div className="shrink-0 mt-0.5">ℹ️</div>
                <p>
                  For your privacy, only the latest 3 decoded documents are stored on this device. 
                  Older documents are automatically removed.
                </p>
              </div>

              <Button onClick={handleProcess} size="lg" className="w-full rounded-full h-14 text-lg shadow-lg shadow-primary/20">
                Decode Document
              </Button>
            </motion.div>
          )}

          {step === "processing" && (
            <motion.div
              key="processing"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="flex flex-col items-center justify-center py-20 text-center space-y-6"
            >
              <div className="relative">
                <div className="absolute inset-0 bg-primary/20 rounded-full blur-xl animate-pulse" />
                <div className="bg-card p-6 rounded-full border shadow-lg relative z-10">
                  <Loader2 className="w-12 h-12 animate-spin text-primary" />
                </div>
              </div>
              <div className="space-y-2">
                <h3 className="text-2xl font-serif font-bold">Analysing Document...</h3>
                <p className="text-muted-foreground">Reading text, identifying legal clauses, and generating summary.</p>
              </div>
              
              {/* Fake progress steps for UX */}
              <div className="w-full max-w-xs space-y-3 mt-8 text-sm text-left">
                <ProgressItem label="Uploading securely..." delay={0} />
                <ProgressItem label="OCR Text Extraction..." delay={1500} />
                <ProgressItem label="Legal Analysis (LLM)..." delay={3000} />
                <ProgressItem label="Translating Summary..." delay={5000} />
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </Layout>
  );
}

function ProgressItem({ label, delay }: { label: string; delay: number }) {
  const [done, setDone] = useState(false);
  
  useEffect(() => {
    const timer = setTimeout(() => setDone(true), delay);
    return () => clearTimeout(timer);
  }, [delay]);

  return (
    <div className={`flex items-center gap-3 transition-opacity duration-500 ${done ? "opacity-100" : "opacity-40"}`}>
      <div className={`w-5 h-5 rounded-full flex items-center justify-center border ${done ? "bg-green-500 border-green-500 text-white" : "border-muted-foreground"}`}>
        {done && <Check className="w-3 h-3" />}
      </div>
      <span>{label}</span>
    </div>
  );
}
