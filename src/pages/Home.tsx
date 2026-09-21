import { Link } from "react-router-dom";
import SmartImage from "../components/SmartImage";
import {
  getCategoryLabel,
  photosByCategory,
  seriesCover,
  seriesList,
} from "../data/photos";

/**
 * 首页：Hero 摄影师简介 + 三个系列的精选预览入口。
 * 封面照片统一取自 photos.json 中每个系列声明的首张照片。
 */
export default function Home() {
  return (
    <>
      <section className="hero">
        <div className="hero__image">
          <SmartImage
            photo={seriesCover(seriesList[1] /* 无人之境首图，宽幅山景 */)}
            fit="cover"
            loading="eager"
          />
        </div>
        <div className="hero__scrim" aria-hidden />
        <div className="hero__content">
          <h1 className="hero__name">林予安</h1>
          <p className="hero__tagline">
            独立摄影师。在黑白肖像的眼神里寻找坦露，
            <br />
            也在高原的山脊与牧场之间记录安静的时间。
          </p>
        </div>
      </section>

      <div className="gold-rule" aria-hidden />

      <section className="featured">
        <h2 className="featured__heading">
          精选系列
          <span className="featured__heading-line" aria-hidden />
        </h2>

        <div className="featured__grid">
          {seriesList.map((series) => {
            const cover = seriesCover(series);
            const count = photosByCategory(series.category).length;
            return (
              <Link
                key={series.id}
                to={`/work/${series.id}`}
                className="feature-card"
                aria-label={`进入系列：${series.title}`}
              >
                <SmartImage photo={cover} />
                <span className="feature-card__overlay">
                  <span className="feature-card__meta">
                    <span className="feature-card__title">{series.title}</span>
                    <span className="feature-card__category">
                      {getCategoryLabel(series.category)} · {count} 幅
                    </span>
                  </span>
                </span>
              </Link>
            );
          })}
        </div>
      </section>

      <div className="gold-rule" aria-hidden />
    </>
  );
}
