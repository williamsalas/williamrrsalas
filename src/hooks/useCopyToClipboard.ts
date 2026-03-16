import { useState, useRef, useCallback, useEffect } from "react";

export function useCopyToClipboard(text: string) {
  const [copied, setCopied] = useState(false);
  const timer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);

  const copy = useCallback(async () => {
    if (!text) return;
    await navigator.clipboard.writeText(text);
    setCopied(true);
    clearTimeout(timer.current);
    timer.current = setTimeout(() => setCopied(false), 2000);
  }, [text]);

  useEffect(() => {
    return () => clearTimeout(timer.current);
  }, []);

  return { copied, copy };
}
