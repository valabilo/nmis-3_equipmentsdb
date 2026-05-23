export function HighlightText({ text, query }: { text: string | number | null | undefined; query: string }) {
  const value = String(text ?? '');
  const tokens = getHighlightTokens(query);

  if (!tokens.length || !value) return <>{value}</>;

  const matcher = new RegExp(`(${tokens.map(escapeRegex).join('|')})`, 'gi');

  return (
    <>
      {value.split(matcher).map((part, index) =>
        tokens.some((token) => part.toLowerCase() === token.toLowerCase()) ? (
          <mark key={`${part}-${index}`} className="rounded bg-amber-200/80 px-0.5 text-zinc-950 dark:bg-amber-300/80 dark:text-zinc-950">
            {part}
          </mark>
        ) : (
          <span key={`${part}-${index}`}>{part}</span>
        ),
      )}
    </>
  );
}

function getHighlightTokens(query: string) {
  return Array.from(new Set(query.split(/\s+/).map((token) => token.trim()).filter(Boolean))).sort((a, b) => b.length - a.length);
}

function escapeRegex(value: string) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}
