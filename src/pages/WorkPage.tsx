import { useMemo } from "react";
import { Link, useSearchParams } from "react-router-dom";
import {
  ALL_CATEGORIES,
  categories,
  isCategoryId,
  selectPhotos,
  seriesList,
} from "../data/photos";
import { PhotoCard } from "../components/PhotoCard";

/**
 * 筛选状态保存在 URL（?category=portrait）中：
 * - 前进/后退浏览器历史即可恢复筛选；
 * - 进入系列详情页再点浏览器返回，URL 查询串原样恢复，不会重置为“全部”。
 */
export function WorkPage() {
  const [searchParams, setSearchParams] = useSearchParams();

  const categoryParam = searchParams.get("category");
  const activeCategory = isCategoryId(categoryParam)
    ? categoryParam
    : ALL_CATEGORIES;

  const results = useMemo(() => selectPhotos(activeCategory), [activeCategory]);

  // 当前分类恰好对应一个系列时，给出进入系列详情页的入口
  const linkedSeries =
    activeCategory !== ALL_CATEGORIES
      ? seriesList.find((series) => series.category === activeCategory)
      : undefined;

  const setCategory = (categoryId: string) => {
    const nextParams = new URLSearchParams(searchParams);
    if (categoryId === ALL_CATEGORIES) {
      nextParams.delete("category");
    } else {
      nextParams.set("category", categoryId);
    }
    setSearchParams(nextParams, { replace: false });
  };

  return (
    <div className="container work-page">
      <header className="work-page__header">
        <h1 className="page-title">Work</h1>
        <p className="page-subtitle">
          Three series, fourteen photographs. Select any photograph to browse
          through the current set one by one.
        </p>
      </header>

      <div
        className="filter-bar"
        role="group"
        aria-label="Filter photographs by category"
      >
        <button
          type="button"
          className={`filter-pill${
            activeCategory === ALL_CATEGORIES ? " filter-pill--active" : ""
          }`}
          aria-pressed={activeCategory === ALL_CATEGORIES}
          onClick={() => setCategory(ALL_CATEGORIES)}
        >
          All
        </button>
        {categories.map((category) => (
          <button
            key={category.id}
            type="button"
            className={`filter-pill${
              activeCategory === category.id ? " filter-pill--active" : ""
            }`}
            aria-pressed={activeCategory === category.id}
            onClick={() => setCategory(category.id)}
          >
            {category.label}
          </button>
        ))}

        {linkedSeries && (
          <Link
            to={`/work/${linkedSeries.id}`}
            className="filter-bar__series-link"
          >
            Open the series {linkedSeries.title} →
          </Link>
        )}
      </div>

      <p className="work-page__count" aria-live="polite">
        {results.length} photographs
      </p>

      {results.length > 0 ? (
        <div className="photo-grid">
          {results.map((photo) => (
            <PhotoCard
              key={photo.id}
              photo={photo}
              // 灯箱接收的“当前结果集”：筛选后只是该分类的照片
              collection={results}
            />
          ))}
        </div>
      ) : (
        <p className="work-page__empty">No photographs in this category.</p>
      )}
    </div>
  );
}
