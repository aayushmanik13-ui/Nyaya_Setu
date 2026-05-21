import { useMutation } from "@tanstack/react-query";
import { api } from "@shared/routes";
import { useToast } from "@/hooks/use-toast";

export function useDecodeDocument() {
  const { toast } = useToast();

  return useMutation({
    mutationFn: async ({ file, language }: { file: File; language: string }) => {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('language', language);

      const res = await fetch(api.decode.process.path, {
        method: api.decode.process.method,
        body: formData,
        // No Content-Type header; browser sets it for FormData
        credentials: "include",
      });

      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.message || "Failed to decode document");
      }

      return api.decode.process.responses[200].parse(await res.json());
    },
    onError: (error) => {
      toast({
        title: "Decoding Failed",
        description: error instanceof Error ? error.message : "An unexpected error occurred",
        variant: "destructive",
      });
    },
  });
}
