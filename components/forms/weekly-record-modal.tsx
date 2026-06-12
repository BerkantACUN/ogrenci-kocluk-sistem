"use client";

import { useState } from "react";
import { toast } from "sonner";
import { Modal } from "@/components/ui/modal";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Field } from "@/components/ui/field";
import { Spinner } from "@/components/ui/spinner";
import { WeekSelect } from "./week-select";
import { useSubjects } from "@/hooks/use-subjects";
import { useCreateWeeklyRecord } from "@/hooks/use-student-data";
import { currentWeek, type WeekRange } from "@/lib/weeks";
import { successRate } from "@/lib/calc";
import { formatPercent } from "@/lib/utils";

interface Props {
  open: boolean;
  onClose: () => void;
  studentId: string;
}

export function WeeklyRecordModal({ open, onClose, studentId }: Props) {
  const { data: subjects } = useSubjects();
  const create = useCreateWeeklyRecord(studentId);

  const [week, setWeek] = useState<WeekRange>(currentWeek());
  const [subjectId, setSubjectId] = useState("");
  const [topic, setTopic] = useState("");
  const [correct, setCorrect] = useState("");
  const [wrong, setWrong] = useState("");

  const c = Number(correct) || 0;
  const w = Number(wrong) || 0;
  const rate = successRate(c, w);

  async function submit() {
    if (!subjectId) {
      toast.error("Lütfen ders seçin.");
      return;
    }
    try {
      await create.mutateAsync({
        subject_id: subjectId,
        week_start_date: week.start,
        week_end_date: week.end,
        topic,
        correct_count: c,
        wrong_count: w,
      });
      toast.success("Haftalık kayıt eklendi. 📝");
      setTopic("");
      setCorrect("");
      setWrong("");
      onClose();
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Bir hata oluştu.");
    }
  }

  return (
    <Modal open={open} onClose={onClose} title="Haftalık ders verisi" description="Ders, konu ve doğru/yanlış girişi">
      <div className="space-y-4">
        <Field label="Hafta" htmlFor="week">
          <WeekSelect id="week" value={week.start} onChange={setWeek} />
        </Field>
        <Field label="Ders" htmlFor="subject">
          <Select id="subject" value={subjectId} onChange={(e) => setSubjectId(e.target.value)}>
            <option value="">— Ders seç —</option>
            {(subjects ?? []).map((s) => (
              <option key={s.id} value={s.id}>
                {s.subject_name}
              </option>
            ))}
          </Select>
        </Field>
        <Field label="Konu" htmlFor="topic" optional>
          <Input id="topic" placeholder="Çarpanlar ve Katlar" value={topic} onChange={(e) => setTopic(e.target.value)} />
        </Field>
        <div className="grid grid-cols-2 gap-3">
          <Field label="Doğru" htmlFor="correct">
            <Input id="correct" type="number" min={0} inputMode="numeric" value={correct} onChange={(e) => setCorrect(e.target.value)} placeholder="35" />
          </Field>
          <Field label="Yanlış" htmlFor="wrong">
            <Input id="wrong" type="number" min={0} inputMode="numeric" value={wrong} onChange={(e) => setWrong(e.target.value)} placeholder="10" />
          </Field>
        </div>
        <div className="flex items-center justify-between rounded-input bg-iris-soft px-3.5 py-2.5 text-[13px]">
          <span className="text-graphite">Toplam {c + w} soru</span>
          <span className="font-semibold text-iris">Başarı {formatPercent(rate)}</span>
        </div>
      </div>
      <div className="mt-5 flex justify-end gap-2">
        <Button variant="ghost" type="button" onClick={onClose}>
          Vazgeç
        </Button>
        <Button onClick={submit} disabled={create.isPending}>
          {create.isPending ? <Spinner className="text-white" /> : "Ekle"}
        </Button>
      </div>
    </Modal>
  );
}
