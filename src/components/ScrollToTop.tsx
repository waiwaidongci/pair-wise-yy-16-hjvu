import { useEffect } from "react";
import { useLocation } from "react-router-dom";

/** 路由切换时回到页面顶部（灯箱打开不改变路由，不受影响）。 */
export function ScrollToTop() {
  const { pathname } = useLocation();
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);
  return null;
}
