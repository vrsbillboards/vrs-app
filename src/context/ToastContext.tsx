"use client";

import { createContext, useCallback, useContext, useState, type ReactNode } from "react";
import { AlertCircle, CheckCircle, Info, X } from "lucide-react";

export type ToastType = "success" | "error" | "info";

type Toast = { id: string; type: ToastType; message: string };

type ToastCtx = { toast: (message: string, type?: ToastType) => void };

const ToastContext = createContext<ToastCtx>({ toast: () => {} });

export function useToast() {
  return useContext(ToastContext);
}

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const toast = useCallback((message: string, type: ToastType = "info") => {
    const id = Math.random().toString(36).slice(2);
    setToasts((prev) => [...prev, { id, type, message }]);
    setTimeout(() => setToasts((prev) => prev.filter((t) => t.id !== id)), 4500);
  }, []);

  const dismiss = (id: string) => setToasts((prev) => prev.filter((t) => t.id !== id));

  return (
    <ToastContext.Provider value={{ toast }}>
      {children}

      {/* Toast tálca — jobb alsó sarok */}
      <div
        aria-live="polite"
        aria-label="Értesítések"
        className="pointer-events-none fixed bottom-5 right-5 z-[20000] flex flex-col items-end gap-2"
      >
        {toasts.map((t) => (
          <div
            key={t.id}
            className={`pointer-events-auto flex min-w-[280px] max-w-[360px] animate-toast-in items-start gap-3 rounded-xl border px-4 py-3 shadow-2xl backdrop-blur-sm ${
              t.type === "success"
                ? "border-[#d4ff00]/40 bg-[#0c0f0b]/95 text-[#d4ff00]"
                : t.type === "error"
                  ? "border-[#5a1a1a] bg-[#100505]/95 text-[#ff6b6b]"
                  : "border-[#1f2a1f] bg-[#0c0f0b]/95 text-[#cfcfcf]"
            }`}
          >
            <span className="mt-0.5 shrink-0">
              {t.type === "success" ? (
                <CheckCircle className="h-4 w-4" strokeWidth={2} />
              ) : t.type === "error" ? (
                <AlertCircle className="h-4 w-4" strokeWidth={2} />
              ) : (
                <Info className="h-4 w-4" strokeWidth={2} />
              )}
            </span>
            <p className="flex-1 text-[13px] leading-snug">{t.message}</p>
            <button
              type="button"
              onClick={() => dismiss(t.id)}
              aria-label="Bezárás"
              className="mt-0.5 shrink-0 opacity-40 transition hover:opacity-100"
            >
              <X className="h-3.5 w-3.5" strokeWidth={2} />
            </button>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}
