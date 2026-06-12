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
import { examResultSchema, type ExamResultInput } from "@/lib/validations";
import { useCreateExam } from "@/hooks/use-student-data";
import { EXAM_TYPES } from "@/lib/constants";
import { toISODate } from "@/lib/weeks";

interface Props {
  open: boolean;
  onClose: () => void;
  studentId: string;
}

export function ExamModal({ open, onClose, studentId }: Props) {
  const create = useCreateExam(studentId);
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(examResultSchema),
    defaultValues: {
      exam_name: "",
      exam_date: toISODate(new Date()),
      exam_type: "LGS Denemesi",
      score: 0,
    },
  });

  async function onSubmit(values: ExamResultInput) {
    try {
      await create.mutateAsync(values);
      toast.success("Deneme sonucu eklendi. 🎯");
      reset();
      onClose();
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Bir hata oluştu.");
    }
  }

  return (
    <Modal open={open} onClose={onClose} title="Deneme sınavı" description="Deneme sonucu ekle">
      <form id="exam-form" onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <Field label="Deneme adı" htmlFor="exam_name" error={errors.exam_name?.message}>
          <Input id="exam_name" placeholder="Türkiye Geneli LGS Denemesi" {...register("exam_name")} />
        </Field>
        <div className="grid grid-cols-2 gap-3">
          <Field label="Tarih" htmlFor="exam_date" error={errors.exam_date?.message}>
            <Input id="exam_date" type="date" {...register("exam_date")} />
          </Field>
          <Field label="Tür" htmlFor="exam_type" optional error={errors.exam_type?.message}>
            <Select id="exam_type" {...register("exam_type")}>
              {EXAM_TYPES.map((t) => (
                <option key={t} value={t}>
                  {t}
                </option>
              ))}
            </Select>
          </Field>
        </div>
        <Field label="Toplam puan" htmlFor="score" error={errors.score?.message}>
          <Input id="score" type="number" step="0.01" min={0} placeholder="412" {...register("score")} />
        </Field>
      </form>
      <div className="mt-5 flex justify-end gap-2">
        <Button variant="ghost" type="button" onClick={onClose}>
          Vazgeç
        </Button>
        <Button form="exam-form" type="submit" disabled={create.isPending}>
          {create.isPending ? <Spinner className="text-white" /> : "Ekle"}
        </Button>
      </div>
    </Modal>
  );
}
