import { useState } from "react";
import { photoSrc, type Photo } from "../data/photos";

interface SmartImageProps {
  photo: Photo;
  /** 容器如何填充：cover 用于网格（比例已与照片一致，不会裁切），contain 用于灯箱。 */
  fit?: "cover" | "contain";
  loading?: "lazy" | "eager";
  className?: string;
}

/**
 * 按照片真实 width/height 用 aspect-ratio 预先撑开占位空间，
 * 图片加载完成前布局已经稳定，避免 CLS；加载期间显示暗色底。
 */
export default function SmartImage({
  photo,
  fit = "cover",
  loading = "lazy",
  className,
}: SmartImageProps) {
  const [loaded, setLoaded] = useState(false);

  return (
    <div
      className={className ? `smart-image ${className}` : "smart-image"}
      style={{ aspectRatio: `${photo.width} / ${photo.height}` }}
    >
      {!loaded && <div className="smart-image__placeholder" aria-hidden />}
      <img
        src={photoSrc(photo)}
        alt={photo.altText}
        width={photo.width}
        height={photo.height}
        loading={loading}
        onLoad={() => setLoaded(true)}
        className={loaded ? "is-loaded" : ""}
        style={{ objectFit: fit }}
        draggable={false}
      />
    </div>
  );
}
