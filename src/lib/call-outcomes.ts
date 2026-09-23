// A fixed set of call outcomes so logging a call always determines what
// happens next automatically — no typing a follow-up date by hand (the
// thing that let dates go stale before). A manually-entered date always
// wins over the outcome's default; "terminal" outcomes clear the next
// date entirely and move the parent record out of active rotation
// instead of leaving a stale date sitting in the call queue forever.
export interface CallOutcomeOption {
  value: string;
  label: string;
  autoScheduleDays: number | null;
  terminal?: boolean;
}

export const CALL_OUTCOMES: CallOutcomeOption[] = [
  { value: "no_answer", label: "No Answer", autoScheduleDays: 2 },
  { value: "left_voicemail", label: "Left Voicemail", autoScheduleDays: 3 },
  { value: "spoke_interested", label: "Spoke — Interested", autoScheduleDays: 7 },
  { value: "spoke_not_ready", label: "Spoke — Not Ready Yet", autoScheduleDays: 90 },
  {
    value: "requested_callback",
    label: "Requested Callback (pick a date below)",
    autoScheduleDays: null,
  },
  { value: "not_interested", label: "Not Interested", autoScheduleDays: null, terminal: true },
];

// A manual date is only ever honored for outcomes that have no auto
// interval of their own (today, just "Requested Callback"). Every other
// outcome always uses its own fixed interval — a stray value left in the
// shared date field on the Call Center form must never silently override
// "No Answer" -> +2 days just because it happened to still be there when
// that button was clicked.
export function resolveNextDate(
  outcomeValue: string,
  manualDate: string | null
): string | null {
  const outcome = CALL_OUTCOMES.find((o) => o.value === outcomeValue);
  if (!outcome || outcome.terminal) return null;
  if (outcome.autoScheduleDays == null) return manualDate || null;
  const d = new Date();
  d.setUTCDate(d.getUTCDate() + outcome.autoScheduleDays);
  return d.toISOString().slice(0, 10);
}

// True for outcomes that can't schedule themselves (autoScheduleDays is
// null) and aren't terminal either — i.e. they require the manual date
// field to be filled in, or nothing gets scheduled at all. Used to reject
// the submission up front instead of silently saving a call with no
// follow-up date.
export function requiresManualDate(outcomeValue: string): boolean {
  const outcome = CALL_OUTCOMES.find((o) => o.value === outcomeValue);
  return !!outcome && !outcome.terminal && outcome.autoScheduleDays == null;
}

export function outcomeLabel(value: string | null): string {
  if (!value) return "";
  return CALL_OUTCOMES.find((o) => o.value === value)?.label ?? value;
}

export function isTerminalOutcome(value: string): boolean {
  return CALL_OUTCOMES.find((o) => o.value === value)?.terminal ?? false;
}
