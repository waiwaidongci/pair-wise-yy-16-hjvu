/**
 * 统一照片数据层（single source of truth）
 *
 * 所有页面（首页精选、/work 网格、/work/:seriesId 系列详情、灯箱）都只能
 * 通过本模块读取 mock-data/photos.json，禁止在组件中另写一份照片列表。
 */
import raw from "./photos.json";
import type { Category, Photo, Series } from "../types";

export const categories = raw.categories as Category[];
export const seriesList = raw.series as Series[];

/** 保持 photos.json 中给定的排列顺序 */
export const photos = raw.photos as Photo[];

const photoMap = new Map(photos.map((photo) => [photo.id, photo]));
const seriesMap = new Map(seriesList.map((series) => [series.id, series]));
const categoryMap = new Map(categories.map((category) => [category.id, category]));

/** 照片在 public/ 下的静态资源路径（file 字段形如 photos/portrait/portrait-01.jpg） */
export function photoUrl(photo: Photo): string {
  return `/${photo.file}`;
}

export function getPhoto(id: string): Photo | undefined {
  return photoMap.get(id);
}

export function getSeries(seriesId: string): Series | undefined {
  return seriesMap.get(seriesId);
}

export function categoryLabel(categoryId: string): string {
  return categoryMap.get(categoryId)?.label ?? categoryId;
}

/** “全部”筛选的哨兵 id */
export const ALL_CATEGORIES = "all";

export type CategoryFilter = string;

export function isCategoryId(id: string | null): id is string {
  return id !== null && categoryMap.has(id);
}

/**
 * 作品集页的选择器：按分类筛选照片。
 * 返回的数组即“当前结果集”，也是灯箱循环导航的边界。
 */
export function selectPhotos(categoryId: CategoryFilter): Photo[] {
  if (categoryId === ALL_CATEGORIES) return photos;
  return photos.filter((photo) => photo.category === categoryId);
}

/** 系列详情页：同一数据模型下按 series.photoIds 取该系列的完整照片集合 */
export function selectSeriesPhotos(series: Series): Photo[] {
  return series.photoIds
    .map((id) => photoMap.get(id))
    .filter((photo): photo is Photo => Boolean(photo));
}
