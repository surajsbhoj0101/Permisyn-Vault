import type { CSSProperties } from "react";

type PermisynLogoProps = {
  className?: string;
  style?: CSSProperties;
  showWordmark?: boolean;
};

function PermisynLogo({
  className,
  style,
  showWordmark = false,
}: PermisynLogoProps) {
  return (
    <div
      className={className}
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: 10,
        ...style,
      }}
    >
      <svg
        width="40"
        height="40"
        viewBox="0 0 40 40"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        aria-hidden="true"
      >
        <defs>
          <linearGradient
            id="permVaultBrand"
            x1="6"
            y1="6"
            x2="34"
            y2="34"
            gradientUnits="userSpaceOnUse"
          >
            <stop stopColor="#2563EB" />
            <stop offset="0.58" stopColor="#4F46E5" />
            <stop offset="1" stopColor="#7C3AED" />
          </linearGradient>
          <linearGradient
            id="permVaultInner"
            x1="12"
            y1="10"
            x2="28"
            y2="30"
            gradientUnits="userSpaceOnUse"
          >
            <stop stopColor="#E0F2FE" />
            <stop offset="1" stopColor="#C7D2FE" />
          </linearGradient>
        </defs>
        <rect x="2.5" y="2.5" width="35" height="35" rx="12" fill="white" />
        <path
          d="M20 7.5L28.5 11.5V19C28.5 24.9 25.3 30.1 20 33C14.7 30.1 11.5 24.9 11.5 19V11.5L20 7.5Z"
          fill="url(#permVaultBrand)"
        />
        <path
          d="M17 14.5H22.2C25 14.5 27 16.4 27 19C27 21.6 25 23.5 22.2 23.5H17V14.5Z"
          stroke="url(#permVaultInner)"
          strokeWidth="2.2"
          strokeLinejoin="round"
        />
        <path
          d="M17 23.5V28"
          stroke="#EEF2FF"
          strokeWidth="2.2"
          strokeLinecap="round"
        />
        <circle cx="18" cy="19.3" r="1.9" fill="#EEF2FF" />
      </svg>

      {showWordmark ? (
        <span
          style={{
            fontSize: 15,
            fontWeight: 700,
            letterSpacing: -0.2,
            color: "var(--text)",
          }}
        >
          Permisyn Vault
        </span>
      ) : null}
    </div>
  );
}

export default PermisynLogo;
