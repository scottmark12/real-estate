// Minimal RFC 4180-ish CSV parser: handles quoted fields, escaped quotes
// ("" inside a quoted field), commas/newlines inside quotes, and \r\n.
// No external dependency — this file is the only thing that needs to
// change if we ever swap parsers.
export function parseCsv(text: string): string[][] {
  const rows: string[][] = [];
  let row: string[] = [];
  let field = "";
  let inQuotes = false;
  let i = 0;

  while (i < text.length) {
    const char = text[i];

    if (inQuotes) {
      if (char === '"') {
        if (text[i + 1] === '"') {
          field += '"';
          i += 2;
          continue;
        }
        inQuotes = false;
        i += 1;
        continue;
      }
      field += char;
      i += 1;
      continue;
    }

    if (char === '"') {
      inQuotes = true;
      i += 1;
      continue;
    }
    if (char === ",") {
      row.push(field);
      field = "";
      i += 1;
      continue;
    }
    if (char === "\r") {
      i += 1;
      continue;
    }
    if (char === "\n") {
      row.push(field);
      rows.push(row);
      row = [];
      field = "";
      i += 1;
      continue;
    }
    field += char;
    i += 1;
  }

  if (field.length > 0 || row.length > 0) {
    row.push(field);
    rows.push(row);
  }

  return rows.filter((r) => r.length > 1 || r[0]?.trim() !== "");
}

// Parses a CSV into an array of objects keyed by the header row (trimmed,
// lowercased, spaces -> underscores) so "Next Follow Up Date" and
// "next_follow_up_date" both resolve the same way.
export function parseCsvToRecords(text: string): Record<string, string>[] {
  const rows = parseCsv(text);
  if (rows.length === 0) return [];
  const headers = rows[0].map((h) => h.trim().toLowerCase().replace(/\s+/g, "_"));
  return rows.slice(1).map((row) => {
    const record: Record<string, string> = {};
    headers.forEach((header, idx) => {
      record[header] = (row[idx] ?? "").trim();
    });
    return record;
  });
}
