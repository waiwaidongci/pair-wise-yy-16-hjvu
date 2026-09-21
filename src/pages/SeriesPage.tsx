import { type MouseEvent } from "react";
import { Link, useParams } from "react-router-dom";
import {
  categoryLabel,
  getSeries,
  selectSeriesPhotos,
} from "../data/photos";
import { useLightbox } from "../lightbox/LightboxContext";
import { AspectImage } from "../components/AspectImage";
import { NotFoundPage } from "./NotFoundPage";

export function SeriesPage() {
  const { seriesId } = useParams<{ seriesId: string }>();
  const series = seriesId ? getSeries(seriesId) : undefined;
  const { open } = useLightbox();

  if (!series) return <NotFoundPage />;

  const seriesPhotos = selectSeriesPhotos(series);
  const cover = seriesPhotos[0];
  // 引用放在叙事中段
  const quoteIndex = Math.min(2, seriesPhotos.length - 1);
  const quotePhoto = seriesPhotos[quoteIndex];

  const handleBack = (event: MouseEvent<HTMLAnchorElement>) => {
    event.preventDefault();
    // 浏览器历史返回：/work 的 ?category= 查询串随历史条目原样恢复
    history.back();
  };

  return (
    <article className="series-page">
      <header className="series-hero">
        <div className="series-hero__media" aria-hidden="true">
          {cover && <AspectImage photo={cover} loading="eager" />}
        </div>
        <div className="series-hero__scrim" aria-hidden="true" />
        <div className="container series-hero__content">
          <p className="series-hero__eyebrow">
            {categoryLabel(series.category)} · Series
          </p>
          <h1 className="series-hero__title">{series.title}</h1>
          <p className="series-hero__summary">{series.summary}</p>
        </div>
      </header>

      <div className="container series-body">
        <nav className="series-back" aria-label="Breadcrumb">
          {/* 返回作品集：历史返回时 /work 的 ?category= 筛选状态原样恢复 */}
          <Link to="/work" className="text-link" onClick={handleBack}>
            ← Back to work
          </Link>
        </nav>

        {seriesPhotos.map((photo, index) => {
          const reverse = index % 2 === 1;
          return (
            <section
              key={photo.id}
              className={`series-row${reverse ? " series-row--reverse" : ""}`}
            >
              <button
                type="button"
                className="series-row__frame"
                aria-label={`View photograph: ${photo.title}`}
                onClick={() => open(seriesPhotos, index)}
              >
                <AspectImage photo={photo} />
              </button>
              <div className="series-row__text">
                <p className="series-row__index">
                  {String(index + 1).padStart(2, "0")}
                </p>
                <h2 className="series-row__title">{photo.title}</h2>
                <p className="series-row__caption">{photo.caption}</p>
              </div>

              {index === quoteIndex && (
                <blockquote className="series-quote">
                  <p>“{quotePhoto.caption}”</p>
                  <cite>
                    — {series.title} · {quotePhoto.title}
                  </cite>
                </blockquote>
              )}
            </section>
          );
        })}

        <footer className="series-footer">
          <span className="series-footer__rule" aria-hidden="true" />
          <p>
            {series.title} contains {seriesPhotos.length} photographs, all
            drawn from the shared photo dataset.
          </p>
        </footer>
      </div>
    </article>
  );
}
