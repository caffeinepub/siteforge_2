interface VerifiedBadgeProps {
  className?: string;
  size?: "sm" | "md" | "lg";
}

export function VerifiedBadge({
  className = "",
  size = "md",
}: VerifiedBadgeProps) {
  const sizeClass =
    size === "sm" ? "w-3.5 h-3.5" : size === "lg" ? "w-5 h-5" : "w-4 h-4";

  return (
    <span
      title="Verified"
      className={`inline-flex items-center shrink-0 ${sizeClass} ${className}`}
    >
      <svg
        viewBox="0 0 24 24"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="w-full h-full"
        role="img"
        aria-label="Verified"
      >
        <circle cx="12" cy="12" r="12" fill="#1877F2" />
        <path
          d="M7.5 12.5l3 3 6-6"
          stroke="white"
          strokeWidth="2.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    </span>
  );
}
