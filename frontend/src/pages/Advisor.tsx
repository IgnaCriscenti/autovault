// Ruta "/asesor" (usuarios logueados): chat con el asesor virtual (agente de LangChain + Groq).
// La respuesta llega por SSE: el texto aparece a medida que el modelo lo genera, y mientras corre una
// tool se muestra que esta consultando. No usa RTK Query: RTK Query espera UNA respuesta por request,
// y aca llegan muchos eventos.
import { useEffect, useRef, useState, type FormEvent, type KeyboardEvent } from "react";
import { useDispatch } from "react-redux";
import { toast } from "sonner";
import {
  ArrowUpIcon,
  BoxIcon,
  CarIcon,
  CheckCircle2Icon,
  ListIcon,
  Loader2Icon,
  RotateCcwIcon,
  SearchIcon,
  SparklesIcon,
  SquareIcon,
  TagIcon,
  Trash2Icon,
  XCircleIcon,
  type LucideIcon,
} from "lucide-react";
import { useSession } from "../lib/auth-client";
import { readSSE } from "../lib/sse";
import { loadChat, saveChat } from "../lib/chat-storage";
import { getErrorMessage } from "../lib/api";
import { useDeleteVehicleMutation, vehiclesApi } from "../store/api";
import type { AppDispatch } from "../store";
import { cn } from "@/lib/utils";
import { LogoMark } from "@/components/brand/Logo";
import { ChatMarkdown } from "@/components/chat/ChatMarkdown";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";
import { Textarea } from "@/components/ui/textarea";

type ToolCall = { name: string; args: Record<string, unknown> };
// Pedido de eliminacion: el agente NO elimina, pide confirmacion; decide el usuario con Sí / No.
type DeletionStatus = "pending" | "deleting" | "deleted" | "cancelled" | "failed";
type Deletion = { vehicleId: string; vehicle: string; status: DeletionStatus; error?: string };
type ChatMessage = {
  id: string;
  role: "user" | "assistant";
  text: string;
  tools: ToolCall[];
  error?: string;
  deletion?: Deletion;
};

// Lo que se le cuenta al modelo en el historial sobre la decision del usuario (el no la ve de otra forma).
const DELETION_NOTES: Partial<Record<DeletionStatus, string>> = {
  deleted: "[El usuario confirmó en el cartel y la publicación se eliminó]",
  cancelled: "[El usuario canceló la eliminación en el cartel: la publicación sigue publicada]",
  failed: "[La eliminación falló: la publicación sigue publicada]",
};

// Al volver a la pagina, un cartel que quedo abierto cuenta como "No".
const restore = (messages: ChatMessage[]): ChatMessage[] =>
  messages.map((m) =>
    m.deletion && (m.deletion.status === "pending" || m.deletion.status === "deleting")
      ? { ...m, deletion: { ...m.deletion, status: "cancelled" } }
      : m,
  );

// Mismos limites que valida el backend (schemas/agent.schema.ts).
const MAX_MESSAGE = 1000;
const MAX_HISTORY = 8;

// Nombre tecnico de la tool -> lo que ve el usuario (mientras corre y despues, como etiqueta).
const TOOLS: Record<string, { running: string; done: string; icon: LucideIcon }> = {
  search_vehicles: { running: "Buscando en el catálogo…", done: "Buscó en el catálogo", icon: SearchIcon },
  get_vehicle_detail: { running: "Mirando el detalle…", done: "Vio el detalle", icon: CarIcon },
  list_brands: { running: "Consultando las marcas…", done: "Consultó las marcas", icon: TagIcon },
  list_my_vehicles: { running: "Revisando tus publicaciones…", done: "Revisó tus publicaciones", icon: ListIcon },
  set_vehicle_availability: { running: "Actualizando la publicación…", done: "Cambió la disponibilidad", icon: BoxIcon },
  request_vehicle_deletion: { running: "Preparando la eliminación…", done: "Pidió tu confirmación", icon: Trash2Icon },
};
// Si el agente uso alguna de estas, los datos cambiaron: se refresca el catalogo (cache de RTK Query).
// (La eliminacion la hace la mutation de RTK Query, que ya invalida la cache sola.)
const WRITE_TOOLS = ["set_vehicle_availability"];

const SUGGESTIONS = [
  "¿Qué SUV automáticas hay por menos de US$ 40.000?",
  "Busco un auto económico para la ciudad",
  "Compará las pick-ups disponibles",
  "¿Qué autos se pueden ver en 3D?",
  "Mostrame mis publicaciones",
];

export const Advisor = () => {
  const { data: session } = useSession();
  const user = session!.user; // la ruta esta protegida: siempre hay sesion
  const firstName = user.name.split(" ")[0];
  const dispatch = useDispatch<AppDispatch>();

  // La conversacion sobrevive a navegar (ej: abrir un auto desde un link del chat y volver).
  const [messages, setMessages] = useState<ChatMessage[]>(() => restore(loadChat<ChatMessage>(user.id)));
  const [input, setInput] = useState("");
  const [status, setStatus] = useState<string | null>(null);
  // Id del mensaje cuyo pedido de eliminacion se esta confirmando (cartel abierto).
  const [confirmingId, setConfirmingId] = useState<string | null>(null);
  const [deleteVehicle] = useDeleteVehicleMutation();
  const abortRef = useRef<AbortController | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const loading = status !== null;

  // Guarda la conversacion cuando termina cada respuesta (no en cada token).
  useEffect(() => {
    if (!loading) saveChat(user.id, messages);
  }, [messages, loading, user.id]);

  // Siempre mostrar lo ultimo: el scroll baja con cada token.
  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight });
  }, [messages, status]);

  // Si se sale de la pagina con una respuesta en curso, se corta (y el backend corta la llamada a Groq).
  useEffect(() => () => abortRef.current?.abort(), []);

  // Actualiza un mensaje sin mutar el array.
  const updateMessage = (id: string, update: (m: ChatMessage) => ChatMessage) =>
    setMessages((prev) => prev.map((m) => (m.id === id ? update(m) : m)));

  // Cambia el estado del pedido de eliminacion. `from`: solo si esta en alguno de esos estados.
  const setDeletion = (id: string, change: Partial<Deletion>, from?: DeletionStatus[]) =>
    updateMessage(id, (m) =>
      m.deletion && (!from || from.includes(m.deletion.status)) ? { ...m, deletion: { ...m.deletion, ...change } } : m,
    );

  const send = async (text: string) => {
    const message = text.trim().slice(0, MAX_MESSAGE);
    if (!message || loading) return;

    // Historial: los ultimos mensajes con texto, para entender preguntas de seguimiento.
    // Si hubo un cartel de eliminacion, se le cuenta al modelo que decidio el usuario.
    const history = messages
      .filter((m) => m.text && !m.error)
      .slice(-MAX_HISTORY)
      .map((m) => {
        const note = m.deletion && DELETION_NOTES[m.deletion.status];
        return { role: m.role, content: (note ? `${m.text}\n\n${note}` : m.text).slice(0, 4000) };
      });

    setInput("");
    setStatus("Pensando…");
    // El mensaje del asistente arranca vacio y se va llenando con cada evento "token".
    const assistantId = crypto.randomUUID();
    const updateAssistant = (update: (m: ChatMessage) => ChatMessage) => updateMessage(assistantId, update);
    setMessages((prev) => [
      ...prev,
      { id: crypto.randomUUID(), role: "user", text: message, tools: [] },
      { id: assistantId, role: "assistant", text: "", tools: [] },
    ]);

    const abort = new AbortController();
    abortRef.current = abort;
    const usedTools: string[] = [];
    let askedDeletion = false;

    try {
      const response = await fetch("/api/v1/agent/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message, history }),
        signal: abort.signal,
      });

      // Auth (401) y validacion (400) fallan ANTES de abrir el stream: llegan como JSON normal.
      if (!response.ok) {
        const body = await response.json().catch(() => null);
        throw new Error(
          response.status === 401
            ? "Tu sesión expiró. Volvé a iniciar sesión."
            : (body?.error?.message ?? `Error ${response.status}`),
        );
      }

      await readSSE(response, ({ event, data }) => {
        const payload = data as {
          text?: string;
          name?: string;
          args?: ToolCall["args"];
          message?: string;
          vehicleId?: string;
          vehicle?: string;
        };
        if (event === "tool" && payload.name) {
          const call: ToolCall = { name: payload.name, args: payload.args ?? {} };
          usedTools.push(call.name);
          setStatus(TOOLS[call.name]?.running ?? "Consultando…");
          updateAssistant((m) => ({ ...m, tools: [...m.tools, call] }));
        }
        if (event === "token" && payload.text) {
          const chunk = payload.text;
          setStatus("Escribiendo…");
          updateAssistant((m) => ({ ...m, text: m.text + chunk }));
        }
        // El agente pidio eliminar: se guarda el pedido y el cartel se abre al terminar la respuesta.
        if (event === "confirm_delete" && payload.vehicleId && payload.vehicle) {
          const { vehicleId, vehicle } = payload;
          askedDeletion = true;
          updateAssistant((m) => ({ ...m, deletion: { vehicleId, vehicle, status: "pending" } }));
        }
        if (event === "error") {
          updateAssistant((m) => ({ ...m, error: payload.message ?? "El asesor no pudo responder" }));
        }
      });
      if (askedDeletion) setConfirmingId(assistantId);
    } catch (err) {
      const error = abort.signal.aborted
        ? "Cancelaste la respuesta."
        : err instanceof Error
          ? err.message
          : "No se pudo conectar con el asesor";
      // Si se corto a mitad de camino, un pedido de eliminacion que haya llegado cuenta como "No".
      updateAssistant((m) => ({
        ...m,
        error,
        deletion: m.deletion && { ...m.deletion, status: "cancelled" },
      }));
    } finally {
      if (usedTools.some((name) => WRITE_TOOLS.includes(name))) {
        dispatch(vehiclesApi.util.invalidateTags(["Vehicles"]));
      }
      setStatus(null);
      abortRef.current = null;
      inputRef.current?.focus();
    }
  };

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    void send(input);
  };

  // Enter envia; Shift+Enter hace un salto de linea.
  const handleKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey && !e.nativeEvent.isComposing) {
      e.preventDefault();
      void send(input);
    }
  };

  const reset = () => {
    setMessages([]);
    inputRef.current?.focus();
  };

  // ── Cartel "¿Eliminar...? Sí / No" ──────────────────────────────────────────────────────────
  const confirming = messages.find((m) => m.id === confirmingId)?.deletion;

  // "Sí": la eliminacion la hace el FRONT con la API REST (DELETE /vehicles/:id), que vuelve a
  // chequear que sea el dueño o admin. La mutation de RTK Query refresca el catalogo sola.
  const confirmDeletion = async () => {
    const id = confirmingId;
    if (!id || !confirming) return;
    setDeletion(id, { status: "deleting" });
    try {
      await deleteVehicle(confirming.vehicleId).unwrap();
      setDeletion(id, { status: "deleted" });
      toast.success("Vehículo eliminado", { description: confirming.vehicle });
    } catch (err) {
      const error = getErrorMessage(err);
      setDeletion(id, { status: "failed", error });
      toast.error("No se pudo eliminar", { description: error });
    }
  };

  // "No" (o cerrar el cartel con Esc / clic afuera). Solo si seguia pendiente: si se toco "Sí",
  // el estado ya es "deleting" y no se pisa.
  const closeConfirm = (open: boolean) => {
    if (open || !confirmingId) return;
    setDeletion(confirmingId, { status: "cancelled" }, ["pending"]);
    setConfirmingId(null);
    inputRef.current?.focus();
  };

  return (
    <section className="flex flex-col gap-6">
      <div className="flex flex-wrap items-end justify-between gap-x-4 gap-y-3">
        <div>
          <p className="flex items-center gap-1.5 text-sm font-medium text-primary">
            <SparklesIcon className="size-4" /> Inteligencia artificial
          </p>
          <h1 className="text-3xl font-bold">Asesor virtual</h1>
          <p className="hidden text-muted-foreground sm:block">
            Contale qué auto buscás y te recomienda opciones reales del catálogo.
          </p>
        </div>
        <Button variant="outline" onClick={reset} disabled={loading || messages.length === 0}>
          <RotateCcwIcon /> Nueva conversación
        </Button>
      </div>

      <Card className="flex h-[calc(100dvh-12rem)] min-h-[28rem] flex-col gap-0 overflow-hidden p-0 sm:h-[calc(100dvh-16rem)]">
        {/* Mensajes */}
        <div ref={scrollRef} className="flex-1 overflow-y-auto px-4 py-6 sm:px-6" aria-live="polite">
          {messages.length === 0 ? (
            <div className="mx-auto flex h-full max-w-xl flex-col items-center justify-center gap-5 text-center">
              <LogoMark className="size-14" />
              <div>
                <h2 className="font-heading text-xl font-semibold">¡Hola, {firstName}! ¿Qué auto estás buscando?</h2>
                <p className="mt-1 text-sm text-muted-foreground">
                  Podés preguntar por presupuesto, marca, tipo de carrocería o combustible, comparar opciones o
                  gestionar tus publicaciones.
                </p>
              </div>
              <div className="flex flex-wrap justify-center gap-2">
                {SUGGESTIONS.map((suggestion) => (
                  <Button
                    key={suggestion}
                    variant="outline"
                    size="sm"
                    className="h-auto rounded-full py-1.5 whitespace-normal"
                    onClick={() => void send(suggestion)}
                  >
                    {suggestion}
                  </Button>
                ))}
              </div>
            </div>
          ) : (
            <ul className="mx-auto flex max-w-3xl flex-col gap-5">
              {messages.map((m, i) =>
                m.role === "user" ? (
                  <li
                    key={m.id}
                    className="max-w-[85%] self-end rounded-2xl rounded-br-md bg-primary px-4 py-2.5 text-sm whitespace-pre-wrap text-primary-foreground"
                  >
                    {m.text}
                  </li>
                ) : (
                  <li key={m.id} className="flex max-w-full gap-3 self-start">
                    <LogoMark className="mt-0.5 size-8 shrink-0" />
                    <div className="flex min-w-0 flex-col gap-2">
                      {/* Las tools aparecen ANTES del texto: el agente primero consulta y despues responde. */}
                      {m.tools.length > 0 && <ToolBadges tools={m.tools} />}
                      {m.text ? (
                        <div className="rounded-2xl rounded-tl-md bg-muted/60 px-4 py-2.5">
                          <ChatMarkdown text={m.text} />
                        </div>
                      ) : (
                        loading && i === messages.length - 1 && <TypingIndicator label={status} />
                      )}
                      {m.error && (
                        <p
                          role="alert"
                          className={cn(
                            "text-sm",
                            m.error === "Cancelaste la respuesta." ? "text-muted-foreground" : "text-destructive",
                          )}
                        >
                          {m.error}
                        </p>
                      )}
                      {m.deletion && <DeletionNotice deletion={m.deletion} onReview={() => setConfirmingId(m.id)} />}
                    </div>
                  </li>
                ),
              )}
            </ul>
          )}
        </div>

        {/* Caja de texto */}
        <form onSubmit={handleSubmit} className="border-t bg-card p-3 sm:p-4">
          <div className="mx-auto flex max-w-3xl items-end gap-2">
            <label htmlFor="advisor-input" className="sr-only">
              Mensaje para el asesor
            </label>
            <Textarea
              id="advisor-input"
              ref={inputRef}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              maxLength={MAX_MESSAGE}
              rows={1}
              autoFocus
              placeholder="Ej: busco una SUV híbrida para la familia"
              className="max-h-40 min-h-11 resize-none rounded-xl py-2.5"
            />
            {loading ? (
              <Button
                type="button"
                variant="outline"
                size="icon-lg"
                className="size-11 shrink-0 rounded-xl"
                onClick={() => abortRef.current?.abort()}
                aria-label="Detener respuesta"
              >
                <SquareIcon className="fill-current" />
              </Button>
            ) : (
              <Button
                type="submit"
                size="icon-lg"
                className="size-11 shrink-0 rounded-xl"
                disabled={!input.trim()}
                aria-label="Enviar mensaje"
              >
                <ArrowUpIcon />
              </Button>
            )}
          </div>
          <p className="mx-auto mt-2 max-w-3xl text-center text-xs text-muted-foreground">
            Las respuestas las genera una IA con los datos del catálogo. Verificá los detalles en cada publicación.
          </p>
        </form>
      </Card>

      {/* La decision de eliminar es del humano: el agente solo puede pedirla. */}
      <ConfirmDialog
        open={!!confirming && confirming.status === "pending"}
        onOpenChange={closeConfirm}
        destructive
        icon={<Trash2Icon />}
        title="¿Eliminar el vehículo?"
        description={
          <>
            El asesor te pide confirmar la eliminación de <strong>{confirming?.vehicle}</strong>. La publicación se
            borra del catálogo y no se puede deshacer.
          </>
        }
        confirmLabel="Sí, eliminar"
        cancelLabel="No"
        onConfirm={() => void confirmDeletion()}
      />
    </section>
  );
};

// Estado del pedido de eliminacion, debajo de la respuesta del asesor.
const DeletionNotice = ({ deletion, onReview }: { deletion: Deletion; onReview: () => void }) => {
  const { status, vehicle, error } = deletion;
  const content: Record<DeletionStatus, { icon: LucideIcon; text: string; className: string }> = {
    pending: { icon: Trash2Icon, text: `Esperando tu confirmación para eliminar ${vehicle}`, className: "text-muted-foreground" },
    deleting: { icon: Loader2Icon, text: `Eliminando ${vehicle}…`, className: "text-muted-foreground" },
    deleted: { icon: CheckCircle2Icon, text: `Eliminaste ${vehicle}`, className: "text-emerald-700" },
    cancelled: { icon: XCircleIcon, text: `Cancelaste la eliminación de ${vehicle}`, className: "text-muted-foreground" },
    failed: { icon: XCircleIcon, text: `No se pudo eliminar ${vehicle}${error ? `: ${error}` : ""}`, className: "text-destructive" },
  };
  const { icon: Icon, text, className } = content[status];

  return (
    <div className={cn("flex flex-wrap items-center gap-1.5 text-sm", className)}>
      <Icon className={cn("size-4 shrink-0", status === "deleting" && "animate-spin")} />
      <span>{text}</span>
      {status === "pending" && (
        <Button variant="link" size="sm" className="h-auto p-0" onClick={onReview}>
          Responder
        </Button>
      )}
    </div>
  );
};

// Etiquetas de las tools que uso el agente para esta respuesta. El tooltip muestra la llamada tecnica.
const ToolBadges = ({ tools }: { tools: ToolCall[] }) => (
  <ul className="flex flex-wrap gap-1.5" aria-label="Consultas que hizo el asesor">
    {tools.map((t, i) => {
      const info = TOOLS[t.name];
      const Icon = info?.icon ?? SearchIcon;
      return (
        <li
          key={i}
          title={`${t.name}(${Object.keys(t.args).length ? JSON.stringify(t.args) : ""})`}
          className="inline-flex items-center gap-1 rounded-full border bg-background px-2 py-0.5 text-xs text-muted-foreground"
        >
          <Icon className="size-3" /> {info?.done ?? t.name}
        </li>
      );
    })}
  </ul>
);

const TypingIndicator = ({ label }: { label: string | null }) => (
  <div className="flex items-center gap-2 rounded-2xl rounded-tl-md bg-muted/60 px-4 py-3 text-sm text-muted-foreground">
    <span className="flex gap-1" aria-hidden>
      {[0, 150, 300].map((delay) => (
        <span
          key={delay}
          className="size-1.5 animate-bounce rounded-full bg-muted-foreground/60"
          style={{ animationDelay: `${delay}ms` }}
        />
      ))}
    </span>
    {label}
  </div>
);
