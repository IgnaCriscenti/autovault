// Label + input + mensaje de error. Recibe lo que devuelve register() de React Hook Form via props.
import type { InputHTMLAttributes, ReactNode } from "react";

interface FieldProps extends InputHTMLAttributes<HTMLInputElement> {
  label: string;
  error?: string;
}

export const inputClass =
  "rounded-lg border border-slate-300 bg-white px-3 py-2 text-slate-900 outline-none transition focus:border-brand-600 focus:ring-2 focus:ring-brand-100 aria-invalid:border-red-500";

export const Field = ({ label, error, ...inputProps }: FieldProps) => (
  <FieldWrapper label={label} error={error}>
    <input aria-invalid={!!error} className={inputClass} {...inputProps} />
  </FieldWrapper>
);

export const FieldWrapper = ({ label, error, children }: { label: string; error?: string; children: ReactNode }) => (
  <label className="flex flex-col gap-1 text-sm font-medium text-slate-700">
    {label}
    {children}
    {error && <span className="text-xs font-normal text-red-600">{error}</span>}
  </label>
);

export const FormError = ({ message }: { message?: string }) =>
  message ? (
    <p role="alert" className="rounded-lg bg-red-50 p-3 text-sm text-red-700">
      {message}
    </p>
  ) : null;
