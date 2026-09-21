import { useEffect, useRef } from "react";
import {
  getCategoryLabel,
  photoSrc,
  type Photo,
} from "../data/photos";
import { useLightbox } from "./LightboxContext";

function ChevronLeft() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden>
      <path d="M15 5l-7 7 7 7" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function ChevronRight() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden>
      <path d="M9 5l7 7-7 7" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function CloseIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden>
      <path d="M6 6l12 12M18 6L6 18" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  );
}

/** 灯箱内使用的预留比例图：contain 显示完整画面，宽度或高度到顶。 */
function LightboxImage({ photo }: { photo: Photo }) {
  const ref = useRef<HTMLImageElement>(null);

  // 切换照片后若命中浏览器缓存，手动标记加载完成。
  useEffect(() => {
    const img = ref.current;
    if (img && img.complete) img.classList.add("is-loaded");
  }, [photo.id]);

  return (
    <figure
      className="lightbox__media"
      style={{ aspectRatio: `${photo.width} / ${photo.height}` }}
    >
      <div className="smart-image__placeholder" aria-hidden />
      <img
        ref={ref}
        key={photo.id}
        src={photoSrc(photo)}
        alt={photo.altText}
        width={photo.width}
        height={photo.height}
        draggable={false}
        onLoad={(e) => e.currentTarget.classList.add("is-loaded")}
      />
    </figure>
  );
}

export default function Lightbox() {
  const { state, current, close, showPrev, showNext } = useLightbox();

  // 键盘：Esc 关闭，方向键只在当前结果集内循环
  useEffect(() => {
    if (!state) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") close();
      if (e.key === "ArrowLeft") showPrev();
      if (e.key === "ArrowRight") showNext();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [state, close, showPrev, showNext]);

  // 打开期间锁定背景滚动
  useEffect(() => {
    if (!state) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, [state]);

  if (!state || !current) return null;

  const { photos: set, index } = state;
  const single = set.length === 1;

  return (
    <div
      className="lightbox"
      role="dialog"
      aria-modal="true"
      aria-label={`照片查看器：${current.title}`}
      data-count={set.length}
    >
      <button
        type="button"
        className="lightbox__backdrop"
        aria-label="关闭灯箱"
        onClick={close}
        tabIndex={-1}
      />

      <button
        type="button"
        className="lightbox__close"
        aria-label="关闭"
        onClick={close}
      >
        <CloseIcon />
      </button>

      {!single && (
        <>
          <button
            type="button"
            className="lightbox__nav lightbox__nav--prev"
            aria-label="上一张"
            onClick={showPrev}
          >
            <ChevronLeft />
          </button>
          <button
            type="button"
            className="lightbox__nav lightbox__nav--next"
            aria-label="下一张"
            onClick={showNext}
          >
            <ChevronRight />
          </button>
        </>
      )}

      <div className="lightbox__stage" role="group" aria-label="照片与说明">
        <LightboxImage photo={current} />

        {/* 桌面端：图片侧边浮层；窄屏（≤760px）：CSS 切换为底部信息条 */}
        <figcaption className="lightbox__info">
          <p className="lightbox__counter">
            {index + 1} / {set.length}
          </p>
          <h3 className="lightbox__title">{current.title}</h3>
          <p className="lightbox__category">
            {getCategoryLabel(current.category)}
          </p>
          <p className="lightbox__caption">{current.caption}</p>
        </figcaption>
      </div>
    </div>
  );
}
