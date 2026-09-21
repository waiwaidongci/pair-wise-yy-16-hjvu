import type { Photo } from "../types";
import { categoryLabel } from "../data/photos";
import { useLightbox } from "../lightbox/LightboxContext";
import { AspectImage } from "./AspectImage";

interface PhotoCardProps {
  photo: Photo;
  /**
   * 当前页面的“结果集”。点击卡片时连同索引一并交给灯箱，
   * 灯箱的左右切换只在这个集合内循环。
   */
  collection: Photo[];
}

/** 统一的照片触发层：网格中任何一张照片都通过它打开灯箱。 */
export function PhotoCard({ photo, collection }: PhotoCardProps) {
  const { open } = useLightbox();
  const index = collection.findIndex((item) => item.id === photo.id);

  return (
    <figure className="photo-card">
      <button
        type="button"
        className="photo-card__frame"
        aria-label={`View photograph: ${photo.title}`}
        onClick={() => open(collection, index)}
      >
        <AspectImage photo={photo} imgClassName="photo-card__img" />
        <span className="photo-card__overlay" aria-hidden="true">
          <span className="photo-card__view">View</span>
        </span>
      </button>
      <figcaption className="photo-card__caption">
        <span className="photo-card__title">{photo.title}</span>
        <span className="photo-card__category">
          {categoryLabel(photo.category)}
        </span>
      </figcaption>
    </figure>
  );
}
