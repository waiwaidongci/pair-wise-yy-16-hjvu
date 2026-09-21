import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import type { Photo } from "../data/photos";

/**
 * 全局灯箱状态层。
 *
 * 关键点：open() 不只接收当前照片，还必须接收「当前结果集」——
 * 即页面此刻实际展示的那一组照片（/work 上是筛选后的结果，
 * 系列页上是该系列的照片，首页是精选封面）。灯箱的上一张/下一张
 * 永远只在这个集合内循环，不会遍历全部照片。
 */
interface LightboxState {
  photos: Photo[];
  index: number;
}

interface LightboxContextValue {
  open: (photos: Photo[], startId: string) => void;
  close: () => void;
  showPrev: () => void;
  showNext: () => void;
  state: LightboxState | null;
  current: Photo | null;
}

const LightboxContext = createContext<LightboxContextValue | null>(null);

export function LightboxProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<LightboxState | null>(null);

  const open = useCallback((set: Photo[], startId: string) => {
    if (set.length === 0) return;
    const index = Math.max(
      0,
      set.findIndex((p) => p.id === startId),
    );
    setState({ photos: set, index });
  }, []);

  const close = useCallback(() => setState(null), []);

  // 在当前结果集内循环移动
  const move = useCallback((delta: number) => {
    setState((prev) => {
      if (!prev || prev.photos.length === 0) return prev;
      const len = prev.photos.length;
      return {
        ...prev,
        index: (prev.index + delta + len) % len,
      };
    });
  }, []);

  const showPrev = useCallback(() => move(-1), [move]);
  const showNext = useCallback(() => move(1), [move]);

  const current = state ? state.photos[state.index] : null;

  const value = useMemo(
    () => ({ open, close, showPrev, showNext, state, current }),
    [open, close, showPrev, showNext, state, current],
  );

  return (
    <LightboxContext.Provider value={value}>
      {children}
    </LightboxContext.Provider>
  );
}

export function useLightbox(): LightboxContextValue {
  const ctx = useContext(LightboxContext);
  if (!ctx) throw new Error("useLightbox 必须在 LightboxProvider 内使用");
  return ctx;
}
