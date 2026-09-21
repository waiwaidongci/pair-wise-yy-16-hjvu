import { useMemo } from "react";
import { Link, useSearchParams } from "react-router-dom";
import PhotoCard from "../components/PhotoCard";
import {
  categories,
  photos,
  seriesList,
} from "../data/photos";

/** 合法的筛选值："all" 或 categories 中声明的分类 id。 */
const ALL = "all";

function readFilter(raw: string | null): string {
  if (raw && categories.some((c) => c.id === raw)) return raw;
  return ALL;
}

export default function Work() {
  const [searchParams, setSearchParams] = useSearchParams();
  // 筛选状态的唯一来源是 URL —— 进入系列页再用浏览器返回时，
  // URL 查询串被原样恢复，筛选自然保持，不依赖任何页面内 state。
  const filter = readFilter(searchParams.get("category"));

  const visiblePhotos = useMemo(() => {
    if (filter === ALL) return photos;
    return photos.filter((p) => p.category === filter);
  }, [filter]);

  // 当前筛选结果涉及的系列，用于提供「进入系列详情页」的入口
  const visibleSeries = seriesList.filter(
    (s) => filter === ALL || s.category === filter,
  );

  const selectFilter = (id: string) => {
    const next = new URLSearchParams(searchParams);
    if (id === ALL) next.delete("category");
    else next.set("category", id);
    setSearchParams(next, { replace: true });
  };

  return (
    <div className="page page--work">
      <div className="page__head">
        <h1 className="page__title">作品集</h1>
        <p className="page__lede">
          三个系列、十四幅照片。选择分类以缩小范围，点击任意照片进入灯箱查看。
        </p>
      </div>

      <div className="filter-bar" role="group" aria-label="按分类筛选">
        <button
          type="button"
          className={`filter-pill${filter === ALL ? " is-active" : ""}`}
          aria-pressed={filter === ALL}
          onClick={() => selectFilter(ALL)}
        >
          全部
        </button>
        {categories.map((c) => (
          <button
            key={c.id}
            type="button"
            className={`filter-pill${filter === c.id ? " is-active" : ""}`}
            aria-pressed={filter === c.id}
            onClick={() => selectFilter(c.id)}
          >
            {c.label}
          </button>
        ))}
      </div>

      <p className="result-count" aria-live="polite">
        当前显示 {visiblePhotos.length} 幅
        {filter !== ALL && (
          <>
            {" · "}
            {visibleSeries.map((s, i) => (
              <Link key={s.id} to={`/work/${s.id}`} className="result-count__series">
                {i > 0 && "、"}
                进入系列《{s.title}》
              </Link>
            ))}
          </>
        )}
      </p>

      {/*
        桌面：CSS columns 实现的多列 masonry（照片比例差异大且不裁切）。
        窄屏（≤760px）：媒体查询降为单列；卡片内说明由 hover 浮层
        切换为照片下方的静态信息（见 styles.css）。
      */}
      <div className="photo-grid">
        {visiblePhotos.map((photo) => (
          <PhotoCard key={photo.id} photo={photo} collection={visiblePhotos} />
        ))}
      </div>
    </div>
  );
}
