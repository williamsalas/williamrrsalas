import {
  useState,
  useMemo,
  useCallback,
  useRef,
  useLayoutEffect,
  useEffect,
} from "react";
import { marked } from "marked";
import DOMPurify from "dompurify";
import { formatClaudeOutput } from "../../lib/formatter.ts";
import { useCopyToClipboard } from "../../hooks/useCopyToClipboard.ts";
import Toggle from "react-toggle";
import "react-toggle/style.css";
import { Footer } from "../Footer.tsx";

const LS_KEY = "claude-formatter-input";
const LS_MAX_BYTES = 100_000;

function loadSavedInput(): string {
  try {
    return localStorage.getItem(LS_KEY) ?? "";
  } catch {
    return "";
  }
}

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

const SUGGESTED_PROMPT =
  "generate a PR description covering all commits on this branch (git log main..HEAD) plus any staged changes (git diff --cached). read the full diff (git diff main..HEAD) to understand the actual changes, not just commit messages. wrap the entire output in a ```markdown code fence so ## headings and formatting survive as literal characters when copied from the terminal. use unindented - bullets, no terminal padding or line wrapping artifacts. sections: ## Summary (2-3 bullets, what and why), ## What changed (specific changes grouped logically), ## Test plan (verification steps). only describe the net effect vs main - do not mention issues introduced and fixed within the same branch. be concise and precise - no filler.";

function PromptBlock() {
  const { copied, copy } = useCopyToClipboard(SUGGESTED_PROMPT);

  return (
    <div className="formatter-prompt-block">
      <span className="formatter-prompt-label">Suggested prompt</span>
      <div className="formatter-prompt-row">
        <code className="formatter-prompt-text">{SUGGESTED_PROMPT}</code>
        <button
          className="formatter-btn formatter-btn--prompt-copy"
          onClick={copy}
        >
          <span style={{ visibility: copied ? "hidden" : "visible" }}>
            Copy
          </span>
          <span style={{ visibility: copied ? "visible" : "hidden" }}>
            Copied!
          </span>
        </button>
      </div>
    </div>
  );
}

export function ClaudeFormatterPage() {
  const [input, setInput] = useState(loadSavedInput);
  const [output, setOutput] = useState("");
  const [lineDelta, setLineDelta] = useState<number | null>(null);
  const [viewMode, setViewMode] = useState<"raw" | "preview">("preview");

  const previewHtml = useMemo(() => {
    if (viewMode !== "preview" || !output) return "";
    const raw = marked.parse(output, {
      async: false,
      gfm: true,
      breaks: false,
    }) as string;
    return DOMPurify.sanitize(raw);
  }, [output, viewMode]);

  useEffect(() => {
    const timer = setTimeout(() => {
      try {
        if (input === "") {
          localStorage.removeItem(LS_KEY);
        } else if (input.length <= LS_MAX_BYTES) {
          localStorage.setItem(LS_KEY, input);
        }
      } catch {
        // ignore
      }
    }, 500);
    return () => clearTimeout(timer);
  }, [input]);
  const { copied, copy } = useCopyToClipboard(output);

  const handleFormat = useCallback(() => {
    const formatted = formatClaudeOutput(input);
    setOutput(formatted);
    setLineDelta(formatted.split("\n").length - input.split("\n").length);
  }, [input]);

  const handleClear = useCallback(() => {
    setInput("");
    setOutput("");
    setLineDelta(null);
    try {
      localStorage.removeItem(LS_KEY);
    } catch {
      // ignore
    }
  }, []);

  return (
    <div className="formatter-page">
      <h2 className="formatter-heading">Claude Code Formatter</h2>
      <p className="formatter-description">
        Clean up Claude Code terminal output into markdown ready to paste into
        GitHub PR descriptions. Strips leading indentation, rejoins wrapped
        lines, and collapses extra blank lines.
      </p>
      <PromptBlock />
      <div className="formatter-panels">
        <div className="formatter-panel">
          <div className="formatter-panel-header">
            <span className="formatter-panel-label">Input</span>
          </div>
          <LineNumberedEditor
            value={input}
            onChange={setInput}
            placeholder="Paste Claude Code output here..."
          />
          <div className="formatter-input-actions">
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
            <div className="formatter-view-toggle">
              <span className="formatter-toggle-label">Raw</span>
              <Toggle
                checked={viewMode === "preview"}
                icons={false}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                  setViewMode(e.target.checked ? "preview" : "raw")
                }
              />
              <span className="formatter-toggle-label">Preview</span>
            </div>
          </div>
          {viewMode === "raw" ? (
            <LineNumberedEditor
              value={output}
              readOnly
              placeholder="Formatted output will appear here..."
            />
          ) : previewHtml ? (
            <div
              className="formatter-preview"
              dangerouslySetInnerHTML={{ __html: previewHtml }}
            />
          ) : (
            <div className="formatter-preview">
              <span className="formatter-preview-placeholder">
                Formatted output will appear here...
              </span>
            </div>
          )}
          <div className="formatter-output-actions">
            <button
              className="formatter-btn formatter-btn--copy"
              onClick={copy}
            >
              <span style={{ visibility: copied ? "hidden" : "visible" }}>
                Copy
              </span>
              <span style={{ visibility: copied ? "visible" : "hidden" }}>
                Copied!
              </span>
            </button>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
}
