"use client";

// Minimal toast container — extend with a full toast library as needed
export function Toaster() {
  return <div id="toast-root" aria-live="polite" aria-atomic="true" className="fixed bottom-4 right-4 z-50 flex flex-col gap-2" />;
}
