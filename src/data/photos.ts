/**
 * 统一照片数据访问层（single source of truth）。
 *
 * 所有页面（/work、/work/:seriesId、首页预览、灯箱）都只能通过这里读取
 * 照片、标题与说明文字；组件内禁止再硬编码一份照片列表。
 *
 * 数据源为任务提供、保持原样的 ../../mock-data/photos.json，
 * 图片文件在构建前已原样拷贝到 public/photos/ 下。
 */
import raw from "../../mock-data/photos.json";

export interface Category {
  id: string;
  label: string;
}

export interface Series {
  id: string;
  title: string;
  category: string;
  summary: string;
  photoIds: string[];
}

export interface Photo {
  id: string;
  category: string;
  seriesId: string;
  file: string;
  title: string;
  altText: string;
  caption: string;
  width: number;
  height: number;
  order: number;
}

interface PhotosData {
  categories: Category[];
  series: Series[];
  photos: Photo[];
}

const data = raw as PhotosData;

export const categories: Category[] = data.categories;
export const seriesList: Series[] = data.series;

/** 全部照片，保持 photos.json 中的原始顺序（已按系列与 order 排好）。 */
export const photos: Photo[] = data.photos;

const photoById = new Map<string, Photo>(photos.map((p) => [p.id, p]));
const seriesById = new Map<string, Series>(seriesList.map((s) => [s.id, s]));
const categoryLabelById = new Map<string, string>(
  categories.map((c) => [c.id, c.label]),
);

export function getPhoto(id: string): Photo {
  const photo = photoById.get(id);
  if (!photo) throw new Error(`未知照片 id：${id}`);
  return photo;
}

export function getSeries(seriesId: string): Series {
  const series = seriesById.get(seriesId);
  if (!series) throw new Error(`未知系列 id：${seriesId}`);
  return series;
}

export function getCategoryLabel(categoryId: string): string {
  return categoryLabelById.get(categoryId) ?? categoryId;
}

/** public 目录下的静态图片地址（自动适配 base）。 */
export function photoSrc(photo: Photo): string {
  const base = import.meta.env.BASE_URL.replace(/\/$/, "");
  return `${base}/${photo.file}`;
}

/** 某分类下的照片，按 order 排序。 */
export function photosByCategory(categoryId: string): Photo[] {
  return photos
    .filter((p) => p.category === categoryId)
    .sort((a, b) => a.order - b.order);
}

/** 某系列的完整照片集合，严格按 series.photoIds 声明的顺序。 */
export function photosForSeries(series: Series): Photo[] {
  return series.photoIds.map(getPhoto);
}

/** 首页精选预览：每个系列取首张作为封面。 */
export function seriesCover(series: Series): Photo {
  return getPhoto(series.photoIds[0]);
}
