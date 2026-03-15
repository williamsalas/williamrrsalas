import {
  useState,
  useMemo,
  useCallback,
  useRef,
  useLayoutEffect,
  useEffect,
} from "react";
import { formatClaudeOutput } from "../../lib/formatter.ts";
import { Footer } from "../Footer.tsx";

function LineNumberedEditor({
  value,
  onChange,
  readOnly,
  placeholder,
}: {
  value: string;
  onChange?: (value: string) => void;
  readOnly?: boolean;
  placeholder?: string;
}) {
  const gutterRef = useRef<HTMLDivElement>(null);
  const mirrorRef = useRef<HTMLDivElement>(null);
  const editorRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const [lineHeights, setLineHeights] = useState<number[]>([]);
  const lines = useMemo(() => value.split("\n"), [value]);
  const lineCount = Math.max(lines.length, 1);

  const measureLines = useCallback(() => {
    const mirror = mirrorRef.current;
    const textarea = textareaRef.current;
    if (!mirror || !textarea) return;
    mirror.style.width = textarea.clientWidth + "px";
    const spans = mirror.querySelectorAll<HTMLElement>(
      ".formatter-mirror-line",
    );
    const next = Array.from(spans, (span) => span.offsetHeight);
    setLineHeights((prev) =>
      prev.length === next.length && prev.every((h, i) => h === next[i])
        ? prev
        : next,
    );
  }, []);

  useLayoutEffect(() => {
    measureLines();
  }, [value, measureLines]);

  useEffect(() => {
    const el = editorRef.current;
    if (!el) return;
    const observer = new ResizeObserver(() => measureLines());
    observer.observe(el);
    return () => observer.disconnect();
  }, [measureLines]);

  const handleScroll = (e: React.UIEvent<HTMLTextAreaElement>) => {
    if (gutterRef.current) {
      gutterRef.current.scrollTop = e.currentTarget.scrollTop;
    }
  };

  return (
    <div className="formatter-editor" ref={editorRef}>
      <div className="formatter-gutter" ref={gutterRef}>
        {Array.from({ length: lineCount }, (_, i) => (
          <div
            key={i}
            className="formatter-gutter-line"
            style={lineHeights[i] ? { height: lineHeights[i] } : undefined}
          >
            {i + 1}
          </div>
        ))}
      </div>
      <textarea
        ref={textareaRef}
        className="formatter-textarea"
        value={value}
        onChange={onChange ? (e) => onChange(e.target.value) : undefined}
        readOnly={readOnly}
        placeholder={placeholder}
        spellCheck={false}
        onScroll={handleScroll}
      />
      <div className="formatter-mirror" ref={mirrorRef} aria-hidden="true">
        {lines.map((line, i) => (
          <div key={i} className="formatter-mirror-line">
            {line || "\n"}
          </div>
        ))}
      </div>
    </div>
  );
}

function DiffStat({ delta }: { delta: number }) {
  const cls =
    delta > 0
      ? "formatter-diff-added"
      : delta < 0
        ? "formatter-diff-removed"
        : "formatter-diff-neutral";
  const label = delta > 0 ? `+${delta}` : `${delta}`;
  return <span className={`formatter-diff-stat ${cls}`}>{label}</span>;
}

export function ClaudeFormatterPage() {
  const [input, setInput] = useState("");
  const [output, setOutput] = useState("");
  const [lineDelta, setLineDelta] = useState<number | null>(null);
  const [copied, setCopied] = useState(false);
  const [headers, setHeaders] = useState(false);
  const copiedTimer = useRef<ReturnType<typeof setTimeout> | undefined>(
    undefined,
  );

  const handleFormat = useCallback(() => {
    const formatted = formatClaudeOutput(input, { restoreHeaders: headers });
    setOutput(formatted);
    setLineDelta(formatted.split("\n").length - input.split("\n").length);
  }, [input, headers]);

  const handleCopy = useCallback(async () => {
    if (!output) return;
    await navigator.clipboard.writeText(output);
    setCopied(true);
    clearTimeout(copiedTimer.current);
    copiedTimer.current = setTimeout(() => setCopied(false), 2000);
  }, [output]);

  const handleClear = useCallback(() => {
    setInput("");
    setOutput("");
    setLineDelta(null);
  }, []);

  useEffect(() => {
    return () => clearTimeout(copiedTimer.current);
  }, []);

  return (
    <div className="formatter-page">
      <h2 className="formatter-heading">Claude Code Formatter</h2>
      <p className="formatter-description">
        Paste Claude Code PR description output to strip terminal indentation
        and rejoin wrapped lines for GitHub.
      </p>
      <div className="formatter-panels">
        <div className="formatter-panel">
          <span className="formatter-panel-label">Input</span>
          <LineNumberedEditor
            value={input}
            onChange={setInput}
            placeholder="Paste Claude Code output here..."
          />
          <div className="formatter-input-actions">
            <label className="formatter-toggle">
              <input
                type="checkbox"
                checked={headers}
                onChange={(e) => setHeaders(e.target.checked)}
              />
              Restore ## headers
            </label>
            <button
              className="formatter-btn formatter-btn--format"
              onClick={handleFormat}
            >
              Format
            </button>
            <button
              className="formatter-btn formatter-btn--clear"
              onClick={handleClear}
            >
              Clear
            </button>
          </div>
        </div>
        <div className="formatter-panel">
          <div className="formatter-panel-header">
            <span className="formatter-panel-label">Output</span>
            {lineDelta !== null && <DiffStat delta={lineDelta} />}
          </div>
          <LineNumberedEditor
            value={output}
            readOnly
            placeholder="Formatted output will appear here..."
          />
          <div className="formatter-output-actions">
            <button
              className="formatter-btn formatter-btn--copy"
              onClick={handleCopy}
            >
              {copied ? "Copied!" : "Copy"}
            </button>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
}
