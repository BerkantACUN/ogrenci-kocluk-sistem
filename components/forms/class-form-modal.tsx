"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { Modal } from "@/components/ui/modal";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select } from "@/components/ui/select";
import { Field } from "@/components/ui/field";
import { Spinner } from "@/components/ui/spinner";
import { classroomSchema, type ClassroomInput } from "@/lib/validations";
import { useCreateClass, useUpdateClass } from "@/hooks/use-classes";
import { GRADE_LEVELS } from "@/lib/constants";
import type { Classroom } from "@/lib/types";

interface Props {
  open: boolean;
  onClose: () => void;
  initial?: Classroom;
}

export function ClassFormModal({ open, onClose, initial }: Props) {
  const create = useCreateClass();
  const update = useUpdateClass();
  const editing = Boolean(initial);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<ClassroomInput>({
    resolver: zodResolver(classroomSchema),
    defaultValues: {
      class_name: initial?.class_name ?? "",
      grade_level: initial?.grade_level ?? 8,
      school_name: initial?.school_name ?? "",
      description: initial?.description ?? "",
    },
  });

  async function onSubmit(values: ClassroomInput) {
    try {
      if (editing && initial) {
        await update.mutateAsync({ id: initial.id, input: values });
        toast.success("Sınıf güncellendi.");
      } else {
        await create.mutateAsync(values);
        toast.success("Sınıf oluşturuldu. 🎒");
      }
      reset();
      onClose();
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Bir hata oluştu.");
    }
  }

  const loading = create.isPending || update.isPending;

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={editing ? "Sınıfı düzenle" : "Yeni sınıf"}
      description="Örn: 8/A, LGS Koçluk Grubu"
    >
      <form id="class-form" onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <Field label="Sınıf adı" htmlFor="class_name" error={errors.class_name?.message}>
          <Input id="class_name" placeholder="8/A" {...register("class_name")} />
        </Field>
        <div className="grid grid-cols-2 gap-3">
          <Field label="Sınıf düzeyi" htmlFor="grade_level" error={errors.grade_level?.message}>
            <Select id="grade_level" {...register("grade_level", { valueAsNumber: true })}>
              {GRADE_LEVELS.map((g) => (
                <option key={g} value={g}>
                  {g}. Sınıf
                </option>
              ))}
            </Select>
          </Field>
          <Field label="Okul adı" htmlFor="school_name" optional error={errors.school_name?.message}>
            <Input id="school_name" placeholder="Atatürk O.O." {...register("school_name")} />
          </Field>
        </div>
        <Field label="Açıklama" htmlFor="description" optional error={errors.description?.message}>
          <Textarea id="description" placeholder="Kısa not…" {...register("description")} />
        </Field>
      </form>
      <div className="mt-5 flex justify-end gap-2">
        <Button variant="ghost" onClick={onClose} type="button">
          Vazgeç
        </Button>
        <Button form="class-form" type="submit" disabled={loading}>
          {loading ? <Spinner className="text-white" /> : editing ? "Kaydet" : "Oluştur"}
        </Button>
      </div>
    </Modal>
  );
}
