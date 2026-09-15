export default function ImagePlaceholder({
  label,
  caption,
  className = "",
}: {
  label: string;
  caption?: string;
  className?: string;
}) {
  return (
    <div className={`flex flex-col ${className}`}>
      <div className="relative flex flex-1 items-end border border-navy/15 bg-cream-deep">
        <span className="eyebrow m-3 text-navy/40">{label}</span>
      </div>
      {caption && (
        <p className="mt-2 text-xs uppercase tracking-wide text-navy/50">
          {caption}
        </p>
      )}
    </div>
  );
}
