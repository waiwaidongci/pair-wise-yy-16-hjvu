import { getCategoryLabel, type Photo } from "../data/photos";
import { useLightbox } from "../lightbox/LightboxContext";
import SmartImage from "./SmartImage";

interface PhotoCardProps {
  photo: Photo;
  /** 卡片被点击时灯箱应使用的结果集（通常是当前页面展示的全部照片）。 */
  collection: Photo[];
}

/**
 * 网格中的一张照片：点击把「当前结果集」连同起始照片一起交给全局灯箱，
 * 保证灯箱循环范围与页面所见一致。
 */
export default function PhotoCard({ photo, collection }: PhotoCardProps) {
  const { open } = useLightbox();

  return (
    <button
      type="button"
      className="photo-card"
      onClick={() => open(collection, photo.id)}
      aria-label={`查看照片：${photo.title}`}
    >
      <SmartImage photo={photo} />
      <span className="photo-card__overlay">
        <span className="photo-card__meta">
          <span className="photo-card__title">{photo.title}</span>
          <span className="photo-card__category">
            {getCategoryLabel(photo.category)}
          </span>
        </span>
      </span>
    </button>
  );
}
