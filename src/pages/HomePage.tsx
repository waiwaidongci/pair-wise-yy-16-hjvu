import { Link } from "react-router-dom";
import {
  categoryLabel,
  getPhoto,
  selectSeriesPhotos,
  seriesList,
} from "../data/photos";
import { AspectImage } from "../components/AspectImage";

export function HomePage() {
  return (
    <>
      <section className="hero">
        <div className="hero__media" aria-hidden="true" />
        <div className="hero__scrim" aria-hidden="true" />
        <div className="container hero__content">
          <h1 className="hero__title">Lin Zhao</h1>
          <p className="hero__intro">
            Independent photographer working in two long-term subjects:
            intimate black-and-white portraits that watch for openness and
            guardedness before the camera, and the high plateau — its
            ridgelines, grazing herds, and the rhythm of daily pastoral life.
          </p>
        </div>
      </section>

      <section className="container featured">
        <div className="section-heading">
          <h2 className="section-heading__title">Featured series</h2>
          <span className="section-heading__rule" aria-hidden="true" />
        </div>

        <div className="featured__grid">
          {seriesList.map((series, seriesIndex) => {
            const seriesPhotos = selectSeriesPhotos(series);
            const cover = getPhoto(series.photoIds[0]);
            if (!cover) return null;
            return (
              <Link
                key={series.id}
                to={`/work/${series.id}`}
                className="series-card"
              >
                <span className="series-card__frame">
                  <AspectImage
                    photo={cover}
                    imgClassName="series-card__img"
                    loading={seriesIndex === 0 ? "eager" : "lazy"}
                  />
                </span>
                <span className="series-card__body">
                  <span className="series-card__name">{series.title}</span>
                  <span className="series-card__category">
                    {categoryLabel(series.category)}
                  </span>
                  <span className="series-card__summary">
                    {series.summary}
                  </span>
                  <span className="series-card__count">
                    {seriesPhotos.length} photographs
                  </span>
                </span>
              </Link>
            );
          })}
        </div>

        <div className="featured__more">
          <Link to="/work" className="text-link">
            View all work →
          </Link>
        </div>
      </section>
    </>
  );
}
