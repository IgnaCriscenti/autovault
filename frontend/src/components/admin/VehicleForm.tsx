// Formulario de alta/edicion de vehiculos: React Hook Form + Zod, con errores por campo y del servidor.
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { getErrorMessage } from "../../lib/api";
import { emptyVehicle, toVehicleFormValues, vehicleSchema, type VehicleFormValues } from "../../schemas/vehicle.schema";
import { BODY_TYPES, FUEL_TYPES, TRANSMISSIONS, type Vehicle } from "../../types/vehicle";
import { BODY_LABELS, FUEL_LABELS, TRANSMISSION_LABELS } from "../../lib/vehicle-format";
import { Field, FieldWrapper, FormError, inputClass } from "../ui/Field";
import { sketchfabSearchUrl } from "../../lib/sketchfab";
import { SketchfabPreview } from "./SketchfabPreview";

interface VehicleFormProps {
  vehicle: Vehicle | null; // null = alta
  onSave: (values: VehicleFormValues) => Promise<void>;
  onCancel: () => void;
}

export const VehicleForm = ({ vehicle, onSave, onCancel }: VehicleFormProps) => {
  const {
    register,
    handleSubmit,
    reset,
    setError,
    setValue,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<VehicleFormValues>({
    resolver: zodResolver(vehicleSchema),
    // `values` reinicia el form cada vez que cambia el vehiculo que se edita.
    values: vehicle ? toVehicleFormValues(vehicle) : emptyVehicle(),
  });
  // watch: valores en vivo para el bloque de Sketchfab (busqueda y vista previa).
  const [brand, model, sketchfabValue, imageUrl] = watch(["brand", "model", "sketchfabModelId", "imageUrl"]);

  const onSubmit = async (values: VehicleFormValues) => {
    try {
      await onSave(values);
      reset(emptyVehicle());
    } catch (err) {
      setError("root.server", { message: getErrorMessage(err) });
    }
  };

  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      noValidate
      className="flex flex-col gap-4 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm"
    >
      <h3 className="text-lg font-semibold text-slate-900">
        {vehicle ? `Editando: ${vehicle.brand} ${vehicle.model}` : "Nuevo vehiculo"}
      </h3>

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        <Field label="Marca *" error={errors.brand?.message} {...register("brand")} />
        <Field label="Modelo *" error={errors.model?.message} {...register("model")} />
        <Field label="Año *" type="number" error={errors.year?.message} {...register("year", { valueAsNumber: true })} />
        <Field
          label="Precio (USD) *"
          type="number"
          min={0}
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
        <Field label="Color" error={errors.color?.message} {...register("color")} />

        <FieldWrapper label="Combustible *" error={errors.fuelType?.message}>
          <select className={inputClass} {...register("fuelType")}>
            {FUEL_TYPES.map((value) => (
              <option key={value} value={value}>
                {FUEL_LABELS[value]}
              </option>
            ))}
          </select>
        </FieldWrapper>
        <FieldWrapper label="Transmision *" error={errors.transmission?.message}>
          <select className={inputClass} {...register("transmission")}>
            {TRANSMISSIONS.map((value) => (
              <option key={value} value={value}>
                {TRANSMISSION_LABELS[value]}
              </option>
            ))}
          </select>
        </FieldWrapper>
        <FieldWrapper label="Carroceria *" error={errors.bodyType?.message}>
          <select className={inputClass} {...register("bodyType")}>
            {BODY_TYPES.map((value) => (
              <option key={value} value={value}>
                {BODY_LABELS[value]}
              </option>
            ))}
          </select>
        </FieldWrapper>

        <Field label="Fecha de publicacion *" type="date" error={errors.listedAt?.message} {...register("listedAt")} />
        <div className="sm:col-span-2">
          <Field
            label="URL de la imagen"
            type="url"
            placeholder="https://..."
            error={errors.imageUrl?.message}
            {...register("imageUrl")}
          />
        </div>
      </div>

      <FieldWrapper label="Descripcion" error={errors.description?.message}>
        <textarea rows={3} className={inputClass} {...register("description")} />
      </FieldWrapper>

      <fieldset className="flex flex-col gap-2 rounded-xl border border-dashed border-slate-300 p-4">
        <legend className="px-1 text-sm font-semibold text-slate-700">Vista 3D (opcional)</legend>
        <p className="text-xs text-slate-500">
          Busca el modelo en{" "}
          <a
            href={sketchfabSearchUrl(`${brand} ${model}`.trim() || "car")}
            target="_blank"
            rel="noreferrer"
            className="font-medium text-brand-700 underline"
          >
            Sketchfab{brand ? ` ("${`${brand} ${model}`.trim()}")` : ""} ↗
          </a>{" "}
          y pega aca la URL de la pagina del modelo.
        </p>
        <Field
          label="URL o id del modelo de Sketchfab"
          placeholder="https://sketchfab.com/3d-models/..."
          error={errors.sketchfabModelId?.message}
          {...register("sketchfabModelId")}
        />
        <SketchfabPreview
          value={sketchfabValue}
          currentImageUrl={imageUrl}
          onUseThumbnail={(url) => setValue("imageUrl", url, { shouldDirty: true, shouldValidate: true })}
        />
      </fieldset>

      <label className="flex items-center gap-2 text-sm text-slate-700">
        <input type="checkbox" className="h-4 w-4" {...register("available")} />
        Disponible para la venta
      </label>

      <FormError message={errors.root?.server?.message} />

      <div className="flex gap-2">
        <button
          type="submit"
          disabled={isSubmitting}
          className="rounded-lg bg-brand-600 px-4 py-2 font-medium text-white transition hover:bg-brand-700 disabled:opacity-50"
        >
          {isSubmitting ? "Guardando..." : vehicle ? "Guardar cambios" : "Crear vehiculo"}
        </button>
        {vehicle && (
          <button
            type="button"
            onClick={onCancel}
            className="rounded-lg border border-slate-300 px-4 py-2 text-slate-700 hover:bg-slate-100"
          >
            Cancelar edicion
          </button>
        )}
      </div>
    </form>
  );
};
