interface MediVaultLogoProps {
    className?: string;
    size?: number;
}

export function MediVaultLogoIcon({ className, size = 36 }: MediVaultLogoProps) {
    return (
        <svg
            width={size}
            height={size}
            viewBox="0 0 100 110"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            className={className}
            aria-label="MediVault Logo"
        >
            {/* Shield outline */}
            <path
                d="M50 4 L92 20 L92 55 C92 78 72 96 50 106 C28 96 8 78 8 55 L8 20 Z"
                fill="#00a86b"
                stroke="white"
                strokeWidth="3"
            />
            {/* Inner shield highlight (lighter left facet) */}
            <path
                d="M50 4 L92 20 L92 55 C92 78 72 96 50 106 Z"
                fill="#009960"
            />
            {/* White inner shield border */}
            <path
                d="M50 14 L84 27 L84 55 C84 74 68 89 50 98 C32 89 16 74 16 55 L16 27 Z"
                fill="#00a86b"
                stroke="white"
                strokeWidth="2.5"
            />
            {/* Medical cross */}
            <rect x="38" y="40" width="24" height="8" rx="2" fill="white" />
            <rect x="46" y="32" width="8" height="24" rx="2" fill="white" />
            {/* Vault door element on right side */}
            <rect
                x="82"
                y="36"
                width="12"
                height="22"
                rx="3"
                fill="white"
                stroke="#00a86b"
                strokeWidth="1.5"
            />
            <circle cx="88" cy="47" r="3.5" fill="#00a86b" />
            <rect x="85" y="55" width="6" height="2" rx="1" fill="#00a86b" />
        </svg>
    );
}

export function MediVaultLogo({ className }: { className?: string }) {
    return (
        <div className={`flex items-center gap-2.5 ${className ?? ""}`}>
            <MediVaultLogoIcon size={36} />
            <span className="text-xl font-semibold tracking-tight">mediVault</span>
        </div>
    );
}
