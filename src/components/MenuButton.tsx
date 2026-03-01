import { useState, useEffect, useRef } from "react";

interface MenuButtonProps {
  navigate: (to: string) => void;
}

export function MenuButton({ navigate }: MenuButtonProps) {
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

  function handleNav(e: React.MouseEvent, to: string) {
    e.preventDefault();
    navigate(to);
    setOpen(false);
  }

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
            <a href="/" onClick={(e) => handleNav(e, "/")}>
              Home
            </a>
          </li>
          <li>
            <a href="/btc" onClick={(e) => handleNav(e, "/btc")}>
              BTC Visualizer
            </a>
          </li>
        </ul>
      )}
    </div>
  );
}
