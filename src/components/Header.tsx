import { NavLink, Link, useLocation } from "react-router-dom";
import { useEffect, useState } from "react";

const NAV_ITEMS = [
  { to: "/", label: "Home", end: true },
  { to: "/work", label: "Work", end: false },
  { to: "/about", label: "About", end: false },
  { to: "/contact", label: "Contact", end: false },
];

export function Header() {
  const [menuOpen, setMenuOpen] = useState(false);
  const location = useLocation();

  // 路由切换后收起移动端菜单
  useEffect(() => {
    setMenuOpen(false);
  }, [location.pathname]);

  return (
    <header className="site-header">
      <div className="site-header__inner container">
        <Link to="/" className="site-header__logo">
          Lin Zhao
        </Link>

        <button
          type="button"
          className="site-header__burger"
          aria-label={menuOpen ? "Close menu" : "Open menu"}
          aria-expanded={menuOpen}
          onClick={() => setMenuOpen((open) => !open)}
        >
          <span />
          <span />
          <span />
        </button>

        <nav
          className={`site-nav${menuOpen ? " site-nav--open" : ""}`}
          aria-label="Primary"
        >
          {NAV_ITEMS.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.end}
              className={({ isActive }) =>
                `site-nav__link${isActive ? " site-nav__link--active" : ""}`
              }
            >
              {item.label}
            </NavLink>
          ))}
        </nav>
      </div>
    </header>
  );
}
