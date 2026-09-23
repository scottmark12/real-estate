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
  { value: "spoke_not_ready", label: "Spoke — Not Ready Yet", autoScheduleDays: 30 },
  {
    value: "requested_callback",
    label: "Requested Callback (pick a date below)",
    autoScheduleDays: null,
  },
  { value: "not_interested", label: "Not Interested", autoScheduleDays: null, terminal: true },
];

export function resolveNextDate(
  outcomeValue: string,
  manualDate: string | null
): string | null {
  if (manualDate) return manualDate;
  const outcome = CALL_OUTCOMES.find((o) => o.value === outcomeValue);
  if (!outcome || outcome.autoScheduleDays == null) return null;
  const d = new Date();
  d.setUTCDate(d.getUTCDate() + outcome.autoScheduleDays);
  return d.toISOString().slice(0, 10);
}

export function outcomeLabel(value: string | null): string {
  if (!value) return "";
  return CALL_OUTCOMES.find((o) => o.value === value)?.label ?? value;
}

export function isTerminalOutcome(value: string): boolean {
  return CALL_OUTCOMES.find((o) => o.value === value)?.terminal ?? false;
}
