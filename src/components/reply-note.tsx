import Image from "next/image";

// Small face next to a form, so people know who's on the other end.
export default function ReplyNote({ text = "Mark reads every message and replies the same day.", className = "" }: { text?: string; className?: string }) {
  return (
    <div className={`flex items-center gap-3 ${className}`}>
      <Image
        src="/images/mark-headshot.jpeg"
        alt="Mark Scott"
        width={96}
        height={96}
        className="h-11 w-11 shrink-0 rounded-full object-cover"
      />
      <p className="text-sm text-navy/60">{text}</p>
    </div>
  );
}
