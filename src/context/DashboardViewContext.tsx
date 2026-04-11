"use client";

import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import type { DashboardViewId } from "@/types/dashboard";

type DashboardViewContextValue = {
  /** Aktuálisan megjelenített nézet */
  view: DashboardViewId;
  /** Közvetlen állítás (pl. szűrősáv „Térkép” gomb) */
  setView: (view: DashboardViewId) => void;
  /** Navigáció (jövőbeli analytics / middleware hookolható) */
  navigate: (view: DashboardViewId) => void;
};

const DashboardViewContext = createContext<DashboardViewContextValue | null>(null);

export function DashboardViewProvider({
  children,
  initialView = "map",
}: {
  children: ReactNode;
  initialView?: DashboardViewId;
}) {
  const [view, setView] = useState<DashboardViewId>(initialView);

  const navigate = useCallback((next: DashboardViewId) => {
    setView(next);
  }, []);

  const value = useMemo(
    () => ({ view, setView, navigate }),
    [view, navigate]
  );

  return (
    <DashboardViewContext.Provider value={value}>
      {children}
    </DashboardViewContext.Provider>
  );
}

export function useDashboardView(): DashboardViewContextValue {
  const ctx = useContext(DashboardViewContext);
  if (!ctx) {
    throw new Error("useDashboardView csak DashboardViewProvider belül használható.");
  }
  return ctx;
}
