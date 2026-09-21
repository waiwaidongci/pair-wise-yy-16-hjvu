import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import type { Photo } from "../types";

interface LightboxState {
  /** 当前展示的照片 */
  current: Photo | null;
  /** 当前结果集（如某分类筛选结果）；上一张/下一张只在此集合内循环 */
  collection: Photo[];
  /** 当前照片在结果集中的位置 */
  index: number;
}

interface LightboxContextValue {
  open: (collection: Photo[], index: number) => void;
  close: () => void;
  next: () => void;
  prev: () => void;
  state: LightboxState;
}

const LightboxContext = createContext<LightboxContextValue | null>(null);

export function LightboxProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<LightboxState>({
    current: null,
    collection: [],
    index: -1,
  });

  const open = useCallback((collection: Photo[], index: number) => {
    if (collection.length === 0) return;
    const safeIndex = Math.min(Math.max(index, 0), collection.length - 1);
    setState({ current: collection[safeIndex], collection, index: safeIndex });
  }, []);

  const close = useCallback(() => {
    setState({ current: null, collection: [], index: -1 });
  }, []);

  const step = useCallback((delta: number) => {
    setState((prev) => {
      const { collection } = prev;
      if (collection.length === 0) return prev;
      // 循环导航严格限定在打开灯箱时传入的结果集内
      const nextIndex =
        (prev.index + delta + collection.length) % collection.length;
      return { ...prev, index: nextIndex, current: collection[nextIndex] };
    });
  }, []);

  const next = useCallback(() => step(1), [step]);
  const prev = useCallback(() => step(-1), [step]);

  const value = useMemo(
    () => ({ open, close, next, prev, state }),
    [open, close, next, prev, state],
  );

  return (
    <LightboxContext.Provider value={value}>
      {children}
    </LightboxContext.Provider>
  );
}

export function useLightbox(): LightboxContextValue {
  const context = useContext(LightboxContext);
  if (!context) {
    throw new Error("useLightbox 必须在 <LightboxProvider> 内使用");
  }
  return context;
}
