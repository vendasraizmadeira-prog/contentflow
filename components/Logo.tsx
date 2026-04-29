export default function Logo({ size = 32 }: { size?: number }) {
  return (
    <div className="flex items-center gap-2">
      <div className="rounded-full flex items-center justify-center flex-shrink-0" style={{ width: size, height: size, background: "#D4FF3F" }}>
        <svg width={size * 0.55} height={size * 0.55} viewBox="0 0 24 24" fill="none">
          <circle cx="12" cy="12" r="3" fill="#0B0B0F"/>
          <path d="M12 2v4M12 18v4M4.22 4.22l2.83 2.83M16.95 16.95l2.83 2.83M2 12h4M18 12h4M4.22 19.78l2.83-2.83M16.95 7.05l2.83-2.83" stroke="#0B0B0F" strokeWidth="2" strokeLinecap="round"/>
        </svg>
      </div>
      <span className="font-bold text-white" style={{ fontSize: size * 0.5 }}>ContentFlow</span>
    </div>
  );
}
