const NUMBER_PATTERN = /(\$[\d,]+(?:\.\d+)?|\d+(?:\.\d+)?%)/g

/**
 * Renders assistant prose with any dollar amounts or percentages pulled out
 * into small mono pills, so grounded figures read as visually distinct from
 * surrounding text. Deliberately simple regex-based parsing - not meant to
 * handle every possible number format, just the common ones the advisor cites.
 */
export function GroundedText({ text }: { text: string }) {
  // With a capturing group, split() interleaves the matches at odd indices -
  // checking that directly avoids re-testing a global regex, which carries
  // lastIndex state across calls and gives wrong answers on repeated .test().
  const parts = text.split(NUMBER_PATTERN)
  return (
    <>
      {parts.map((part, i) =>
        i % 2 === 1 ? (
          <span
            key={i}
            className="mx-0.5 inline-block rounded-full bg-teal-tint px-1.5 py-0.5 font-mono text-[0.85em] text-teal-dark"
          >
            {part}
          </span>
        ) : (
          <span key={i}>{part}</span>
        ),
      )}
    </>
  )
}
