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
import { studentSchema, type StudentInput } from "@/lib/validations";
import { useCreateStudent, useUpdateStudent } from "@/hooks/use-students";
import { useClasses } from "@/hooks/use-classes";
import { GRADE_LEVELS } from "@/lib/constants";
import type { Student } from "@/lib/types";

interface Props {
  open: boolean;
  onClose: () => void;
  initial?: Student;
  defaultClassId?: string;
  defaultGrade?: number;
}

export function StudentFormModal({ open, onClose, initial, defaultClassId, defaultGrade }: Props) {
  const create = useCreateStudent();
  const update = useUpdateStudent();
  const { data: classes } = useClasses();
  const editing = Boolean(initial);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<StudentInput>({
    resolver: zodResolver(studentSchema),
    defaultValues: {
      first_name: initial?.first_name ?? "",
      last_name: initial?.last_name ?? "",
      grade_level: initial?.grade_level ?? defaultGrade ?? 8,
      class_id: initial?.class_id ?? defaultClassId ?? null,
      school_name: initial?.school_name ?? "",
      student_no: initial?.student_no ?? "",
      parent_name: initial?.parent_name ?? "",
      parent_email: initial?.parent_email ?? "",
      parent_phone: initial?.parent_phone ?? "",
      note: initial?.note ?? "",
    },
  });

  async function onSubmit(values: StudentInput) {
    try {
      if (editing && initial) {
        await update.mutateAsync({ id: initial.id, input: values });
        toast.success("Öğrenci güncellendi.");
      } else {
        await create.mutateAsync(values);
        toast.success("Öğrenci eklendi. 🧑‍🎓");
      }
      reset();
      onClose();
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Bir hata oluştu.");
    }
  }

  const loading = create.isPending || update.isPending;

  return (
    <Modal open={open} onClose={onClose} title={editing ? "Öğrenciyi düzenle" : "Yeni öğrenci"}>
      <form id="student-form" onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div className="grid grid-cols-2 gap-3">
          <Field label="Ad" htmlFor="first_name" error={errors.first_name?.message}>
            <Input id="first_name" placeholder="Ali" {...register("first_name")} />
          </Field>
          <Field label="Soyad" htmlFor="last_name" error={errors.last_name?.message}>
            <Input id="last_name" placeholder="Yılmaz" {...register("last_name")} />
          </Field>
        </div>
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
          <Field label="Sınıf / Grup" htmlFor="class_id" optional error={errors.class_id?.message}>
            <Select
              id="class_id"
              {...register("class_id", { setValueAs: (v) => (v === "" ? null : v) })}
            >
              <option value="">— Seçilmedi —</option>
              {(classes ?? []).map((c) => (
                <option key={c.id} value={c.id}>
                  {c.class_name}
                </option>
              ))}
            </Select>
          </Field>
        </div>
        <div className="grid grid-cols-2 gap-3">
          <Field label="Okul adı" htmlFor="school_name" optional error={errors.school_name?.message}>
            <Input id="school_name" placeholder="Atatürk O.O." {...register("school_name")} />
          </Field>
          <Field label="Okul no" htmlFor="student_no" optional hint="Excel eşleştirmede kullanılır" error={errors.student_no?.message}>
            <Input id="student_no" placeholder="123" {...register("student_no")} />
          </Field>
        </div>

        <div className="rounded-input bg-cloud/50 p-3">
          <p className="mb-3 text-[12px] font-semibold uppercase tracking-wide text-slate">Veli bilgileri</p>
          <div className="space-y-3">
            <div className="grid grid-cols-2 gap-3">
              <Field label="Veli adı" htmlFor="parent_name" optional error={errors.parent_name?.message}>
                <Input id="parent_name" placeholder="Veli adı soyadı" {...register("parent_name")} />
              </Field>
              <Field label="Veli telefonu" htmlFor="parent_phone" optional error={errors.parent_phone?.message}>
                <Input id="parent_phone" placeholder="05xx" {...register("parent_phone")} />
              </Field>
            </div>
            <Field
              label="Veli e-postası"
              htmlFor="parent_email"
              optional
              hint="Raporlar bu adrese gönderilecek"
              error={errors.parent_email?.message}
            >
              <Input id="parent_email" type="email" placeholder="veli@ornek.com" {...register("parent_email")} />
            </Field>
          </div>
        </div>

        <Field label="Not" htmlFor="note" optional error={errors.note?.message}>
          <Textarea id="note" placeholder="Öğrenci hakkında kısa not…" {...register("note")} />
        </Field>
      </form>
      <div className="mt-5 flex justify-end gap-2">
        <Button variant="ghost" onClick={onClose} type="button">
          Vazgeç
        </Button>
        <Button form="student-form" type="submit" disabled={loading}>
          {loading ? <Spinner className="text-white" /> : editing ? "Kaydet" : "Ekle"}
        </Button>
      </div>
    </Modal>
  );
}
