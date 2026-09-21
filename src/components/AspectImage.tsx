import type { CSSProperties } from "react";
import type { Photo } from "../types";
import { photoUrl } from "../data/photos";

interface AspectImageProps {
  photo: Photo;
  imgClassName?: string;
  style?: CSSProperties;
  loading?: "lazy" | "eager";
  sizes?: string;
}

/**
 * 用照片真实的 width/height 通过 aspect-ratio 预先撑开占位空间，
 * 浏览器在图片下载完成前就完成布局，避免加载后跳动（CLS）。
 */
export function AspectImage({
  photo,
  imgClassName,
  style,
  loading = "lazy",
  sizes,
}: AspectImageProps) {
  return (
    <img
      src={photoUrl(photo)}
      alt={photo.altText}
      width={photo.width}
      height={photo.height}
      loading={loading}
      sizes={sizes}
      className={imgClassName}
      style={{
        aspectRatio: `${photo.width} / ${photo.height}`,
        ...style,
      }}
    />
  );
}
