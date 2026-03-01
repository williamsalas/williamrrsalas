import { useState, useEffect, useRef } from "react";

export function MenuButton() {
  const [open, setOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    if (open) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [open]);

  return (
    <div className="menu-container" ref={menuRef}>
      <button
        className="menu-button"
        onClick={() => setOpen(!open)}
        aria-label="Menu"
        aria-expanded={open}
      >
        <i className="fas fa-bars"></i>
      </button>
      {open && (
        <ul className="menu-dropdown">
          <li>
            <a href="/" onClick={() => setOpen(false)}>
              Home
            </a>
          </li>
          <li>
            <span className="menu-disabled">Coming soon</span>
          </li>
        </ul>
      )}
    </div>
  );
}
