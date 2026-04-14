"use client";

import { Toaster } from "sonner";

export default function ToastProvider() {
  return (
    <Toaster
      position="bottom-right"
      theme="dark"
      richColors
      closeButton
      toastOptions={{
        classNames: {
          toast: "!bg-jungle-900 !border-jungle-700/50 !text-white",
        },
      }}
    />
  );
}
