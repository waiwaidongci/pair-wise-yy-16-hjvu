import { Link, Navigate, useParams } from "react-router-dom";
import SmartImage from "../components/SmartImage";
import {
  getCategoryLabel,
  getSeries,
  photosForSeries,
} from "../data/photos";
import { useLightbox } from "../lightbox/LightboxContext";

/**
 * 系列详情页 /work/:seriesId。
 *
 * 叙事式长图文：横幅封面 + 简介 + 图文左右交替 + pull-quote。
 * 所有照片、标题、说明均来自统一数据层中该 seriesId 的照片集合，
 * 本组件不持有任何独立的照片列表；灯箱也只在该系列集合内循环。
 */
export default function Series() {
  const { seriesId } = useParams<{ seriesId: string }>();

  let series;
  try {
    series = getSeries(seriesId ?? "");
  } catch {
    return <Navigate to="/404" replace />;
  }

  const seriesPhotos = photosForSeries(series);
  const { open } = useLightbox();

  // pull-quote 取自中间照片的说明文字（同样来自 photos.json）
  const quoteIndex = Math.floor(seriesPhotos.length / 2);
  const quotePhoto = seriesPhotos[quoteIndex];

  return (
    <article className="series">
      <nav className="breadcrumb" aria-label="面包屑">
        <Link to="/">首页</Link>
        <span aria-hidden>/</span>
        <Link to={`/work?category=${series.category}`}>作品集</Link>
        <span aria-hidden>/</span>
        <span>{series.title}</span>
      </nav>

      <header className="series__hero">
        <button
          type="button"
          className="series__hero-button"
          onClick={() => open(seriesPhotos, seriesPhotos[0].id)}
          aria-label={`查看系列封面：${seriesPhotos[0].title}`}
        >
          <SmartImage photo={seriesPhotos[0]} fit="cover" loading="eager" />
        </button>
        <div className="series__hero-scrim" aria-hidden />
        <h1 className="series__title">{series.title}</h1>
      </header>

      <div className="gold-rule" aria-hidden />

      <div className="series__intro">
        <p className="series__category">
          {getCategoryLabel(series.category)} · {seriesPhotos.length} 幅
        </p>
        <p className="series__summary">{series.summary}</p>
      </div>

      <div className="series__body">
        {seriesPhotos.map((photo, i) => {
          const reverse = i % 2 === 1;
          const isQuotePhoto = i === quoteIndex;
          return (
            <div key={photo.id}>
              <section
                className={`narrative${reverse ? " narrative--reverse" : ""}`}
              >
                <button
                  type="button"
                  className="narrative__media"
                  onClick={() => open(seriesPhotos, photo.id)}
                  aria-label={`查看照片：${photo.title}`}
                >
                  <SmartImage photo={photo} />
                </button>
                <div className="narrative__text">
                  <h2 className="narrative__title">
                    {String(i + 1).padStart(2, "0")} · {photo.title}
                  </h2>
                  {/* 中间照片的说明留给下方 pull-quote，避免重复 */}
                  {!isQuotePhoto && <p>{photo.caption}</p>}
                </div>
              </section>

              {isQuotePhoto && (
                <blockquote className="pull-quote">
                  <span className="pull-quote__mark" aria-hidden>
                    “
                  </span>
                  {quotePhoto.caption}
                </blockquote>
              )}
            </div>
          );
        })}
      </div>

      <div className="gold-rule" aria-hidden />

      <div className="series__footer">
        <Link
          to={`/work?category=${series.category}`}
          className="series__back"
        >
          ← 返回作品集（{getCategoryLabel(series.category)}）
        </Link>
      </div>
    </article>
  );
}
