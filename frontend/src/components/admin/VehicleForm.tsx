// Formulario de alta/edición de vehículos: React Hook Form + Zod, con errores por campo y del servidor.
import type { ReactNode } from "react";
import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Box, ExternalLinkIcon, Loader2Icon, PencilIcon, PlusIcon } from "lucide-react";
import { getErrorMessage } from "../../lib/api";
import { emptyVehicle, toVehicleFormValues, vehicleSchema, type VehicleFormValues } from "../../schemas/vehicle.schema";
import { BODY_TYPES, FUEL_TYPES, TRANSMISSIONS, type Vehicle } from "../../types/vehicle";
import { BODY_LABELS, FUEL_LABELS, TRANSMISSION_LABELS } from "../../lib/vehicle-format";
import { sketchfabSearchUrl } from "../../lib/sketchfab";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { NativeSelect, NativeSelectOption } from "@/components/ui/native-select";
import { Textarea } from "@/components/ui/textarea";
import { Field, FieldWrapper, FormError } from "@/components/ui/Field";
import { VehicleImage } from "../vehicles/VehicleImage";
import { SketchfabPreview } from "./SketchfabPreview";

interface VehicleFormProps {
  vehicle: Vehicle | null; // null = alta
  onSave: (values: VehicleFormValues) => Promise<void>;
  onCancel: () => void;
}

const Section = ({ title, children }: { title: string; children: ReactNode }) => (
  <fieldset className="flex flex-col gap-3">
    <legend className="mb-1 text-xs font-semibold tracking-wider text-muted-foreground uppercase">{title}</legend>
    {children}
  </fieldset>
);

// Los selects nativos de shadcn ocupan todo el ancho y tienen la misma altura que los inputs.
const selectClass = "w-full [&_select]:h-9 [&_select]:bg-background";

export const VehicleForm = ({ vehicle, onSave, onCancel }: VehicleFormProps) => {
  const {
    register,
    control,
    handleSubmit,
    reset,
    setError,
    setValue,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<VehicleFormValues>({
    resolver: zodResolver(vehicleSchema),
    // `values` reinicia el form cada vez que cambia el vehículo que se edita.
    values: vehicle ? toVehicleFormValues(vehicle) : emptyVehicle(),
  });
  // watch: valores en vivo para la vista previa de la foto y el bloque de Sketchfab.
  const [brand, model, sketchfabValue, imageUrl] = watch(["brand", "model", "sketchfabModelId", "imageUrl"]);
  const searchQuery = `${brand} ${model}`.trim();

  const onSubmit = async (values: VehicleFormValues) => {
    try {
      await onSave(values);
      reset(emptyVehicle());
    } catch (err) {
      setError("root.server", { message: getErrorMessage(err) });
    }
  };

  return (
    <Card className={vehicle ? "ring-2 ring-primary/40" : undefined}>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-lg font-semibold">
          {vehicle ? <PencilIcon className="size-4 text-primary" /> : <PlusIcon className="size-4 text-primary" />}
          {vehicle ? `Editando: ${vehicle.brand} ${vehicle.model}` : "Nuevo vehículo"}
        </CardTitle>
        <CardDescription>Los campos con * son obligatorios.</CardDescription>
      </CardHeader>

      <CardContent>
        <form onSubmit={handleSubmit(onSubmit)} noValidate className="flex flex-col gap-6">
          <Section title="Datos principales">
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              <Field label="Marca *" placeholder="Toyota" error={errors.brand?.message} {...register("brand")} />
              <Field label="Modelo *" placeholder="Corolla XEI" error={errors.model?.message} {...register("model")} />
              <Field label="Año *" type="number" error={errors.year?.message} {...register("year", { valueAsNumber: true })} />
              <Field
                label="Precio (USD) *"
                type="number"
                min={0}
                placeholder="25000"
                error={errors.price?.message}
                {...register("price", { valueAsNumber: true })}
              />
              <Field
                label="Kilometraje *"
                type="number"
                min={0}
                error={errors.mileage?.message}
                {...register("mileage", { valueAsNumber: true })}
              />
              <Field label="Color" placeholder="Gris plata" error={errors.color?.message} {...register("color")} />
            </div>
          </Section>

          <Section title="Características">
            <div className="grid gap-4 sm:grid-cols-3">
              <FieldWrapper label="Combustible *" error={errors.fuelType?.message}>
                <NativeSelect className={selectClass} {...register("fuelType")}>
                  {FUEL_TYPES.map((value) => (
                    <NativeSelectOption key={value} value={value}>
                      {FUEL_LABELS[value]}
                    </NativeSelectOption>
                  ))}
                </NativeSelect>
              </FieldWrapper>
              <FieldWrapper label="Transmisión *" error={errors.transmission?.message}>
                <NativeSelect className={selectClass} {...register("transmission")}>
                  {TRANSMISSIONS.map((value) => (
                    <NativeSelectOption key={value} value={value}>
                      {TRANSMISSION_LABELS[value]}
                    </NativeSelectOption>
                  ))}
                </NativeSelect>
              </FieldWrapper>
              <FieldWrapper label="Carrocería *" error={errors.bodyType?.message}>
                <NativeSelect className={selectClass} {...register("bodyType")}>
                  {BODY_TYPES.map((value) => (
                    <NativeSelectOption key={value} value={value}>
                      {BODY_LABELS[value]}
                    </NativeSelectOption>
                  ))}
                </NativeSelect>
              </FieldWrapper>
            </div>
            <FieldWrapper label="Descripción" error={errors.description?.message}>
              <Textarea rows={3} placeholder="Estado, equipamiento, service..." className="bg-background" {...register("description")} />
            </FieldWrapper>
          </Section>

          <Section title="Foto y vista 3D">
            <div className="grid items-start gap-4 sm:grid-cols-[1fr_160px]">
              <Field
                label="URL de la foto"
                type="url"
                placeholder="https://..."
                hint="Podés usar la miniatura del modelo 3D (abajo)."
                error={errors.imageUrl?.message}
                {...register("imageUrl")}
              />
              <VehicleImage
                key={imageUrl}
                src={imageUrl || undefined}
                alt="Vista previa de la foto"
                className="aspect-video w-full rounded-lg ring-1 ring-foreground/10"
              />
            </div>
            <div className="flex flex-col gap-3 rounded-xl border border-dashed p-4">
              <p className="flex flex-wrap items-center gap-1 text-sm text-muted-foreground">
                <Box className="size-4 text-primary" /> Buscá el modelo en
                <a
                  href={sketchfabSearchUrl(searchQuery || "car")}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-1 font-medium text-primary hover:underline"
                >
                  Sketchfab{searchQuery ? ` ("${searchQuery}")` : ""} <ExternalLinkIcon className="size-3" />
                </a>
                y pegá acá la URL de la página del modelo.
              </p>
              <Field
                label="URL o id del modelo de Sketchfab (opcional)"
                placeholder="https://sketchfab.com/3d-models/..."
                error={errors.sketchfabModelId?.message}
                {...register("sketchfabModelId")}
              />
              <SketchfabPreview
                value={sketchfabValue}
                currentImageUrl={imageUrl}
                onUseThumbnail={(url) => setValue("imageUrl", url, { shouldDirty: true, shouldValidate: true })}
              />
            </div>
          </Section>

          <Section title="Publicación">
            <div className="grid items-end gap-4 sm:grid-cols-2">
              <Field label="Fecha de publicación *" type="date" error={errors.listedAt?.message} {...register("listedAt")} />
              {/* El Checkbox de shadcn no es un <input> nativo: se conecta al form con <Controller>. */}
              <Controller
                control={control}
                name="available"
                render={({ field }) => (
                  <Label className="h-9 font-normal">
                    <Checkbox checked={field.value} onCheckedChange={(c) => field.onChange(c === true)} />
                    Disponible para la venta
                  </Label>
                )}
              />
            </div>
          </Section>

          <FormError message={errors.root?.server?.message} />

          <div className="flex flex-wrap gap-2">
            <Button type="submit" size="lg" disabled={isSubmitting} className="h-10 px-5">
              {isSubmitting && <Loader2Icon className="animate-spin" />}
              {isSubmitting ? "Guardando..." : vehicle ? "Guardar cambios" : "Publicar vehículo"}
            </Button>
            {vehicle && (
              <Button type="button" variant="outline" size="lg" onClick={onCancel} className="h-10">
                Cancelar edición
              </Button>
            )}
          </div>
        </form>
      </CardContent>
    </Card>
  );
};
