import { BrowserRouter, Route, Routes } from "react-router-dom";
import { LightboxProvider } from "./lightbox/LightboxContext";
import { Lightbox } from "./lightbox/Lightbox";
import { Header } from "./components/Header";
import { Footer } from "./components/Footer";
import { ScrollToTop } from "./components/ScrollToTop";
import { HomePage } from "./pages/HomePage";
import { WorkPage } from "./pages/WorkPage";
import { SeriesPage } from "./pages/SeriesPage";
import { AboutPage } from "./pages/AboutPage";
import { ContactPage } from "./pages/ContactPage";
import { NotFoundPage } from "./pages/NotFoundPage";

export default function App() {
  return (
    <LightboxProvider>
      <BrowserRouter>
        <ScrollToTop />
        <Header />
        <main id="main">
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/work" element={<WorkPage />} />
            <Route path="/work/:seriesId" element={<SeriesPage />} />
            <Route path="/about" element={<AboutPage />} />
            <Route path="/contact" element={<ContactPage />} />
            <Route path="*" element={<NotFoundPage />} />
          </Routes>
        </main>
        <Footer />
        {/* 全局共享组件，不是独立路由；由任意页面通过 useLightbox 打开 */}
        <Lightbox />
      </BrowserRouter>
    </LightboxProvider>
  );
}
