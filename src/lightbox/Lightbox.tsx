import { useEffect, useRef } from "react";
import { createPortal } from "react-dom";
import { categoryLabel } from "../data/photos";
import { useLightbox } from "./LightboxContext";
import { AspectImage } from "../components/AspectImage";

export function Lightbox() {
  const { state, close, next, prev } = useLightbox();
  const { current, collection, index } = state;
  const dialogRef = useRef<HTMLDivElement>(null);
  const closeButtonRef = useRef<HTMLButtonElement>(null);

  // 打开期间锁定页面滚动
  useEffect(() => {
    if (!current) return;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    closeButtonRef.current?.focus();
    return () => {
      document.body.style.overflow = previousOverflow;
    };
  }, [current]);

  // 键盘：Esc 关闭，←/→ 仅在当前结果集内循环
  useEffect(() => {
    if (!current) return;
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") close();
      if (event.key === "ArrowRight") next();
      if (event.key === "ArrowLeft") prev();
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [current, close, next, prev]);

  if (!current) return null;

  const multiple = collection.length > 1;
  const positionLabel = `${index + 1} / ${collection.length}`;

  return createPortal(
    <div
      className="lightbox"
      role="dialog"
      aria-modal="true"
      aria-label={`Photograph viewer: ${current.title}`}
      ref={dialogRef}
      onClick={(event) => {
        // 点击图片之外的深色遮罩区域关闭
        if (event.target === event.currentTarget) close();
      }}
    >
      <button
        ref={closeButtonRef}
        type="button"
        className="lightbox__close"
        aria-label="Close"
        onClick={close}
      >
        <svg viewBox="0 0 24 24" width="26" height="26" aria-hidden="true">
          <path
            d="M5 5l14 14M19 5L5 19"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
          />
        </svg>
      </button>

      {multiple && (
        <button
          type="button"
          className="lightbox__nav lightbox__nav--prev"
          aria-label="Previous photograph"
          onClick={prev}
        >
          <svg viewBox="0 0 24 24" width="30" height="30" aria-hidden="true">
            <path
              d="M15 5l-7 7 7 7"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </button>
      )}

      <div className="lightbox__stage" onClick={(e) => e.stopPropagation()}>
        <figure className="lightbox__figure">
          <div className="lightbox__stage-inner">
            <AspectImage
              photo={current}
              imgClassName="lightbox__img"
              loading="eager"
            />
          </div>
          {/* 桌面端：侧边/下方信息层；移动端 CSS 将其改为底部信息条 */}
          <figcaption className="lightbox__info">
            <div className="lightbox__meta">
              <h3 className="lightbox__title">{current.title}</h3>
              <p className="lightbox__category">
                {categoryLabel(current.category)}
              </p>
            </div>
            <p className="lightbox__caption">{current.caption}</p>
            <p className="lightbox__position">{positionLabel}</p>
          </figcaption>
        </figure>
      </div>

      {multiple && (
        <button
          type="button"
          className="lightbox__nav lightbox__nav--next"
          aria-label="Next photograph"
          onClick={next}
        >
          <svg viewBox="0 0 24 24" width="30" height="30" aria-hidden="true">
            <path
              d="M9 5l7 7-7 7"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </button>
      )}
    </div>,
    document.body,
  );
}
