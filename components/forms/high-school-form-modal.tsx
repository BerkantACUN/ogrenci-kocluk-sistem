"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { Modal } from "@/components/ui/modal";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Field } from "@/components/ui/field";
import { Spinner } from "@/components/ui/spinner";
import { highSchoolSchema, type HighSchoolInput } from "@/lib/validations";
import { useCreateHighSchool, useUpdateHighSchool } from "@/hooks/use-high-schools";
import { SCHOOL_TYPES } from "@/lib/constants";
import type { HighSchool } from "@/lib/types";

interface Props {
  open: boolean;
  onClose: () => void;
  initial?: HighSchool;
  /** Yeni kayıt sahibi: null = global (yönetici), aksi halde öğretmen id'si. */
  ownerId: string | null;
}

export function HighSchoolFormModal({ open, onClose, initial, ownerId }: Props) {
  const create = useCreateHighSchool();
  const update = useUpdateHighSchool();
  const editing = Boolean(initial);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(highSchoolSchema),
    defaultValues: {
      school_name: initial?.school_name ?? "",
      city: initial?.city ?? "",
      district: initial?.district ?? "",
      school_type: initial?.school_type ?? "Anadolu Lisesi",
      base_score: initial?.base_score ?? 0,
      percentile: initial?.percentile ?? null,
      quota: initial?.quota ?? null,
      year: initial?.year ?? new Date().getFullYear(),
    },
  });

  async function onSubmit(values: HighSchoolInput) {
    try {
      if (editing && initial) {
        await update.mutateAsync({ id: initial.id, input: values });
        toast.success("Lise güncellendi.");
      } else {
        await create.mutateAsync({ input: values, teacherId: ownerId });
        toast.success("Lise eklendi. 🏫");
      }
      reset();
      onClose();
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Bir hata oluştu.");
    }
  }

  const loading = create.isPending || update.isPending;

  return (
    <Modal open={open} onClose={onClose} title={editing ? "Liseyi düzenle" : "Yeni lise"}>
      <form id="hs-form" onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <Field label="Lise adı" htmlFor="school_name" error={errors.school_name?.message}>
          <Input id="school_name" placeholder="Bornova Anadolu Lisesi" {...register("school_name")} />
        </Field>
        <div className="grid grid-cols-2 gap-3">
          <Field label="İl" htmlFor="city" error={errors.city?.message}>
            <Input id="city" placeholder="İzmir" {...register("city")} />
          </Field>
          <Field label="İlçe" htmlFor="district" optional error={errors.district?.message}>
            <Input id="district" placeholder="Bornova" {...register("district")} />
          </Field>
        </div>
        <Field label="Okul türü" htmlFor="school_type" optional error={errors.school_type?.message}>
          <Select id="school_type" {...register("school_type")}>
            {SCHOOL_TYPES.map((t) => (
              <option key={t} value={t}>
                {t}
              </option>
            ))}
          </Select>
        </Field>
        <div className="grid grid-cols-3 gap-3">
          <Field label="Taban puanı" htmlFor="base_score" error={errors.base_score?.message}>
            <Input id="base_score" type="number" step="0.01" placeholder="405" {...register("base_score")} />
          </Field>
          <Field label="Yüzdelik" htmlFor="percentile" optional error={errors.percentile?.message}>
            <Input id="percentile" type="number" step="0.01" placeholder="5.2" {...register("percentile")} />
          </Field>
          <Field label="Yıl" htmlFor="year" error={errors.year?.message}>
            <Input id="year" type="number" placeholder="2026" {...register("year")} />
          </Field>
        </div>
        <Field label="Kontenjan" htmlFor="quota" optional error={errors.quota?.message}>
          <Input id="quota" type="number" placeholder="120" {...register("quota")} />
        </Field>
      </form>
      <div className="mt-5 flex justify-end gap-2">
        <Button variant="ghost" type="button" onClick={onClose}>
          Vazgeç
        </Button>
        <Button form="hs-form" type="submit" disabled={loading}>
          {loading ? <Spinner className="text-white" /> : editing ? "Kaydet" : "Ekle"}
        </Button>
      </div>
    </Modal>
  );
}
