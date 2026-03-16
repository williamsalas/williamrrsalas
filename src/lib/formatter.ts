const STRUCTURAL_MARKER = /^(\s*[-*#]|\s*\d+\.\s|```)/;

/** Join lines that were hard-wrapped by the terminal back onto the previous line. */
export function joinWrappedLines(text: string): string {
  const lines = text.split("\n");
  const result: string[] = [];
  let inCodeBlock = false;

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];

    if (line.trimStart().startsWith("```")) {
      inCodeBlock = !inCodeBlock;
      result.push(line);
      continue;
    }

    if (inCodeBlock) {
      result.push(line);
      continue;
    }

    const isBlank = line.trim().length === 0;
    const startsWithMarker = STRUCTURAL_MARKER.test(line);
    const prevLine = result.length > 0 ? result[result.length - 1] : null;
    const prevIsBlank = prevLine !== null && prevLine.trim().length === 0;

    if (!isBlank && !startsWithMarker && !prevIsBlank && result.length > 0) {
      result[result.length - 1] += " " + line.trimStart();
    } else {
      result.push(line);
    }
  }

  return result.join("\n");
}

/** Remove consistent leading whitespace from all lines. */
export function dedent(text: string): string {
  const lines = text.split("\n");
  const nonEmptyLines = lines.filter((l) => l.trim().length > 0);
  if (nonEmptyLines.length === 0) return text;

  const min = Math.min(
    ...nonEmptyLines.map((l) => l.match(/^(\s*)/)![1].length),
  );
  if (min === 0) return text;

  return lines.map((l) => (l.trim().length > 0 ? l.slice(min) : l)).join("\n");
}

/** Replace 3+ consecutive blank lines with a single blank line. */
export function collapseBlankLines(text: string): string {
  return text.replace(/\n{3,}/g, "\n\n");
}

/** Pipeline: dedent -> joinWrappedLines -> trim trailing whitespace per line -> collapseBlankLines -> trim. */
export function formatClaudeOutput(input: string): string {
  let result = dedent(input);
  result = joinWrappedLines(result);
  result = result
    .split("\n")
    .map((l) => l.trimEnd())
    .join("\n");
  result = collapseBlankLines(result);
  return result.trim();
}
