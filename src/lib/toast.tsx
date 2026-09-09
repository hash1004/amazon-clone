"use client";

import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
} from "react";

type Toast = { id: number; message: string; kind: "success" | "error" };

const ToastContext = createContext<{
  toast: (message: string, kind?: Toast["kind"]) => void;
} | null>(null);

let nextId = 1;

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const toast = useCallback(
    (message: string, kind: Toast["kind"] = "success") => {
      const id = nextId++;
      setToasts((t) => [...t, { id, message, kind }]);
      setTimeout(() => {
        setToasts((t) => t.filter((x) => x.id !== id));
      }, 2600);
    },
    [],
  );

  const value = useMemo(() => ({ toast }), [toast]);

  return (
    <ToastContext.Provider value={value}>
      {children}
      <div className="pointer-events-none fixed inset-x-0 bottom-4 z-[60] flex flex-col items-center gap-2 px-4">
        {toasts.map((t) => (
          <div
            key={t.id}
            role="status"
            className={`pointer-events-auto flex items-center gap-2 rounded-md px-4 py-2.5 text-sm text-white shadow-lg ${
              t.kind === "error" ? "bg-danger" : "bg-[#1c1917]"
            }`}
          >
            <span aria-hidden>{t.kind === "error" ? "⚠" : "✓"}</span>
            {t.message}
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}

export function useToast() {
  const c = useContext(ToastContext);
  // Fail soft: if no provider, toasts are no-ops.
  return c ?? { toast: () => {} };
}
