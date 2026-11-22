// Campos de formulario sobre los componentes de shadcn/ui (Label + Input), con mensaje de error.
// Reciben lo que devuelve register() de React Hook Form via props (incluida la ref).
import { useId, type InputHTMLAttributes, type ReactNode } from "react";
import { CircleAlertIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import { Input } from "./input";
import { Label } from "./label";

interface FieldProps extends InputHTMLAttributes<HTMLInputElement> {
  label: string;
  error?: string;
  hint?: string;
}

// Estilo de input de shadcn para controles nativos que todavia no usan un componente propio.
export const inputClass =
  "h-9 w-full min-w-0 rounded-lg border border-input bg-background px-2.5 text-sm outline-none transition-colors focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 aria-invalid:border-destructive";

export const FieldError =({ message }: { message?: string }) =>
  message ? <p className="text-xs font-medium text-destructive">{message}</p> : null;

export const Field = ({ label, error, hint, id, className, ...inputProps }: FieldProps) => {
  const autoId = useId();
  const inputId = id ?? autoId;
  return (
    <div className="grid gap-1.5">
      <Label htmlFor={inputId}>{label}</Label>
      <Input id={inputId} aria-invalid={!!error} className={cn("h-9 bg-background", className)} {...inputProps} />
      {hint && !error && <p className="text-xs text-muted-foreground">{hint}</p>}
      <FieldError message={error} />
    </div>
  );
};

// Para selects / textareas / controles propios: el <label> envuelve al control.
export const FieldWrapper = ({ label, error, children }: { label: string; error?: string; children: ReactNode }) => (
  <Label className="grid gap-1.5">
    {label}
    {children}
    <FieldError message={error} />
  </Label>
);

export const FormError = ({ message }: { message?: string }) =>
  message ? (
    <p
      role="alert"
      className="flex items-start gap-2 rounded-lg border border-destructive/20 bg-destructive/5 p-3 text-sm text-destructive"
    >
      <CircleAlertIcon className="mt-0.5 size-4 shrink-0" />
      {message}
    </p>
  ) : null;
