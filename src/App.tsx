import { useEffect } from "react";
import { Link, Route, Routes, useLocation } from "react-router-dom";
import Layout from "./components/Layout";
import { LightboxProvider } from "./lightbox/LightboxContext";
import About from "./pages/About";
import Contact from "./pages/Contact";
import Home from "./pages/Home";
import Series from "./pages/Series";
import Work from "./pages/Work";

/** 路由切换时回到页面顶部。 */
function ScrollToTop() {
  const { pathname } = useLocation();
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);
  return null;
}

function NotFound() {
  return (
    <div className="page not-found">
      <h1 className="page__title">404</h1>
      <p className="page__lede">没有找到这个页面或系列。</p>
      <Link to="/" className="btn btn--gold">
        返回首页
      </Link>
    </div>
  );
}

export default function App() {
  return (
    <LightboxProvider>
      <ScrollToTop />
      <Routes>
        <Route element={<Layout />}>
          <Route path="/" element={<Home />} />
          <Route path="/work" element={<Work />} />
          <Route path="/work/:seriesId" element={<Series />} />
          <Route path="/about" element={<About />} />
          <Route path="/contact" element={<Contact />} />
          <Route path="*" element={<NotFound />} />
        </Route>
      </Routes>
    </LightboxProvider>
  );
}
