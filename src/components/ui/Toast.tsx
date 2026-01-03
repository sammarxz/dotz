"use client";

import { cn } from "@/lib/utils";
import { ReactNode } from "react";
import * as React from "react";

// Gerenciador simples de toast
class SimpleToastManager {
  private toasts: ToastData[] = [];
  private listeners: Array<(toasts: ToastData[]) => void> = [];

  add(toast: ToastData): string {
    this.toasts.push(toast);
    this.notify();
    return toast.id;
  }

  remove(id: string) {
    this.toasts = this.toasts.filter(t => t.id !== id);
    this.notify();
  }

  close(id: string) {
    this.remove(id);
  }

  subscribe(listener: (toasts: ToastData[]) => void) {
    this.listeners.push(listener);
    listener(this.toasts);
    return () => {
      this.listeners = this.listeners.filter(l => l !== listener);
    };
  }

  private notify() {
    this.listeners.forEach(listener => listener([...this.toasts]));
  }

  get toastsList() {
    return [...this.toasts];
  }
}

const toastManager = new SimpleToastManager();

interface ToastData {
  id: string;
  title?: string;
  description?: string;
  variant?: "default" | "success" | "error";
  duration?: number;
}

interface ToastProps {
  title?: string;
  description?: string;
  variant?: "default" | "success" | "error";
  duration?: number;
}

export function toast({ title, description, variant = "default", duration = 3000 }: ToastProps) {
  const id = `toast-${Date.now()}-${Math.random()}`;
  const toastData: ToastData = {
    id,
    title,
    description,
    variant,
    duration,
  };

  toastManager.add(toastData);

  if (duration > 0) {
    setTimeout(() => {
      toastManager.remove(id);
    }, duration);
  }

  return id;
}

interface ToastProviderProps {
  children: ReactNode;
}

export function ToastProvider({ children }: ToastProviderProps) {
  return (
    <>
      {children}
      <ToastViewport />
    </>
  );
}

function ToastViewport() {
  const [toasts, setToasts] = React.useState<ToastData[]>([]);

  React.useEffect(() => {
    return toastManager.subscribe(setToasts);
  }, []);

  if (toasts.length === 0) return null;

  return (
    <div className="fixed bottom-0 right-0 z-[100] flex max-h-screen w-full flex-col-reverse p-4 sm:max-w-[420px] sm:flex-col gap-2">
      {toasts.map((toastData) => (
        <ToastComponent key={toastData.id} toast={toastData} />
      ))}
    </div>
  );
}

interface ToastComponentProps {
  toast: ToastData;
}

function ToastComponent({ toast: toastData }: ToastComponentProps) {
  const variantClasses = {
    default: "bg-zinc-900 border-zinc-800 text-white",
    success: "bg-green-900 border-green-800 text-green-100",
    error: "bg-red-900 border-red-800 text-red-100",
  };

  return (
    <div
      className={cn(
        "group pointer-events-auto relative flex w-full items-center justify-between space-x-4 overflow-hidden rounded-md border p-6 pr-8 shadow-lg transition-all",
        variantClasses[toastData.variant || "default"]
      )}
    >
      <div className="grid gap-1">
        {toastData.title && (
          <div className="text-sm font-semibold">
            {toastData.title}
          </div>
        )}
        {toastData.description && (
          <div className="text-sm opacity-90">
            {toastData.description}
          </div>
        )}
      </div>
      <button
        onClick={() => toastManager.remove(toastData.id)}
        className="absolute right-2 top-2 rounded-md p-1 text-zinc-400 opacity-0 transition-opacity hover:text-zinc-200 focus:opacity-100 focus:outline-none focus:ring-2 group-hover:opacity-100"
      >
        <span className="sr-only">Close</span>
        <svg
          className="h-4 w-4"
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M18 6L6 18M6 6l12 12" />
        </svg>
      </button>
    </div>
  );
}

// Hook para usar toast
export function useToast() {
  return {
    toast: (props: ToastProps) => toast(props),
    success: (title: string, description?: string) =>
      toast({ title, description, variant: "success" }),
    error: (title: string, description?: string) =>
      toast({ title, description, variant: "error" }),
  };
}
