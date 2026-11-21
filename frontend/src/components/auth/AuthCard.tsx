import type { ReactNode } from "react";

export const AuthCard = ({ title, children }: { title: string; children: ReactNode }) => (
  <section className="mx-auto mt-8 w-full max-w-sm rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
    <h2 className="mb-4 text-xl font-semibold text-slate-900">{title}</h2>
    {children}
  </section>
);

export const Divider = () => (
  <div className="my-4 flex items-center gap-3 text-xs text-slate-400">
    <span className="h-px flex-1 bg-slate-200" />o<span className="h-px flex-1 bg-slate-200" />
  </div>
);

export const primaryButton =
  "rounded-lg bg-brand-600 py-2 font-medium text-white transition hover:bg-brand-700 disabled:opacity-50";
export const secondaryButton =
  "flex w-full items-center justify-center gap-2 rounded-lg border border-slate-300 py-2 font-medium text-slate-900 transition hover:bg-slate-100";
