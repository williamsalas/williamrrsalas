interface PRStatusIconProps {
  action: string | null;
  merged: boolean;
}

export function PRStatusIcon({ action, merged }: PRStatusIconProps) {
  if (action === "opened" || merged === false) {
    return (
      <svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 16 16"
        width="16"
        height="16"
        fill="#1A7F37"
        className="status-icon"
        aria-label="PR open"
      >
        <path d="M1.5 3.25a2.25 2.25 0 113 2.122v5.256a2.251 2.251 0 11-1.5 0V5.372A2.25 2.25 0 011.5 3.25zm5.677-.177L9.573.677A.25.25 0 0110 .854V2.5h1A2.5 2.5 0 0113.5 5v5.628a2.251 2.251 0 11-1.5 0V5a1 1 0 00-1-1h-1v1.646a.25.25 0 01-.427.177L7.177 3.427a.25.25 0 010-.354zM3.75 2.5a.75.75 0 100 1.5.75.75 0 000-1.5zm0 9.5a.75.75 0 100 1.5.75.75 0 000-1.5zm8.25.75a.75.75 0 101.5 0 .75.75 0 00-1.5 0z" />
      </svg>
    );
  }

  if (merged) {
    return (
      <svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 16 16"
        width="16"
        height="16"
        fill="#8250DF"
        className="status-icon"
        aria-label="PR merged"
      >
        <path d="M5.45 5.154A4.25 4.25 0 009.25 7.5h1.378a2.251 2.251 0 110 1.5H9.25A5.734 5.734 0 015 7.123v3.505a2.25 2.25 0 11-1.5 0V5.372a2.25 2.25 0 111.95-.218zM4.25 13.5a.75.75 0 100-1.5.75.75 0 000 1.5zm8.5-4.5a.75.75 0 100-1.5.75.75 0 000 1.5zM5 3.25a.75.75 0 100 .005V3.25z" />
      </svg>
    );
  }

  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 16 16"
      width="16"
      height="16"
      fill="#CF222E"
      className="status-icon"
      aria-label="PR closed"
    >
      <path d="M3.25 1A2.25 2.25 0 014 5.372v5.256a2.251 2.251 0 11-1.5 0V5.372A2.251 2.251 0 013.25 1zm9.5 5.5a.75.75 0 01.75.75v3.378a2.251 2.251 0 11-1.5 0V7.25a.75.75 0 01.75-.75zm-2.03-5.273a.75.75 0 011.06 0l.97.97.97-.97a.748.748 0 011.265.332.75.75 0 01-.205.729l-.97.97.97.97a.751.751 0 01-.018 1.042.751.751 0 01-1.042.018l-.97-.97-.97.97a.749.749 0 01-1.275-.326.749.749 0 01.215-.734l.97-.97-.97-.97a.75.75 0 010-1.06zM2.5 3.25a.75.75 0 101.5 0 .75.75 0 00-1.5 0zM3.25 12a.75.75 0 100 1.5.75.75 0 000-1.5zm9.5 0a.75.75 0 100 1.5.75.75 0 000-1.5z" />
    </svg>
  );
}
