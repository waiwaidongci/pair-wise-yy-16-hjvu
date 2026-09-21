import { useEffect, useState } from "react";
import { NavLink, Link, Outlet, useLocation } from "react-router-dom";
import Lightbox from "../lightbox/Lightbox";

const NAV_ITEMS = [
  { to: "/", label: "首页", end: true },
  { to: "/work", label: "作品集", end: false },
  { to: "/about", label: "关于", end: false },
  { to: "/contact", label: "联系", end: false },
];

function Header() {
  const [menuOpen, setMenuOpen] = useState(false);
  const location = useLocation();

  // 路由切换后收起移动端菜单
  useEffect(() => {
    setMenuOpen(false);
  }, [location.pathname]);

  return (
    <header className="site-header">
      <div className="site-header__inner">
        <Link to="/" className="site-header__logo">
          logo
        </Link>

        <button
          type="button"
          className="site-header__burger"
          aria-label={menuOpen ? "关闭菜单" : "打开菜单"}
          aria-expanded={menuOpen}
          onClick={() => setMenuOpen((v) => !v)}
        >
          <span />
          <span />
          <span />
        </button>

        <nav
          className={`site-nav${menuOpen ? " is-open" : ""}`}
          aria-label="主导航"
        >
          {NAV_ITEMS.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.end}
              className={({ isActive }) =>
                isActive ? "site-nav__link is-active" : "site-nav__link"
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

function Footer() {
  return (
    <footer className="site-footer">
      <div className="site-footer__inner">
        <span className="site-footer__brand">凝视旷野 · 摄影作品集</span>
        <span className="site-footer__note">
          离线可用 · 所有照片与字体均为本地资源
        </span>
      </div>
    </footer>
  );
}

export default function Layout() {
  return (
    <div className="site-shell">
      <Header />
      <main className="site-main">
        <Outlet />
      </main>
      <Footer />
      {/* 全局共享灯箱：不是路由，任何页面都能通过 useLightbox 打开 */}
      <Lightbox />
    </div>
  );
}
