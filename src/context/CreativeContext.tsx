"use client";

import { createContext, useContext, useState, type ReactNode } from "react";

type CreativeCtx = {
  /** Object URL (blob:) vagy Supabase public URL — a legutóbb kiválasztott kreatív */
  previewUrl: string | null;
  setPreviewUrl: (url: string | null) => void;
};

const CreativeContext = createContext<CreativeCtx>({
  previewUrl: null,
  setPreviewUrl: () => {},
});

export function useCreative() {
  return useContext(CreativeContext);
}

export function CreativeProvider({ children }: { children: ReactNode }) {
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  return (
    <CreativeContext.Provider value={{ previewUrl, setPreviewUrl }}>
      {children}
    </CreativeContext.Provider>
  );
}
