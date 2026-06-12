"use client";

import { useEffect, useState } from "react";
import { toast } from "sonner";
import { Plus, Trash2 } from "lucide-react";
import { Modal } from "@/components/ui/modal";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Field } from "@/components/ui/field";
import { Spinner } from "@/components/ui/spinner";
import { useSubjects } from "@/hooks/use-subjects";
import { useCreateExam, type ExamSubjectInput } from "@/hooks/use-student-data";
import { EXAM_TYPES, LGS_QUESTION_COUNTS } from "@/lib/constants";
import { netOf } from "@/lib/calc";
import { toISODate } from "@/lib/weeks";

interface Props {
  open: boolean;
  onClose: () => void;
  studentId: string;
}

interface Row {
  key: string;
  subjectId: string;
  correct: string;
  wrong: string;
  blank: string;
}

let rowSeq = 0;
const newRow = (subjectId = ""): Row => ({
  key: `r${rowSeq++}`,
  subjectId,
  correct: "",
  wrong: "",
  blank: "",
});

export function ExamModal({ open, onClose, studentId }: Props) {
  const { data: subjects } = useSubjects();
  const create = useCreateExam(studentId);

  const [examName, setExamName] = useState("");
  const [examDate, setExamDate] = useState(toISODate(new Date()));
  const [examType, setExamType] = useState("LGS Denemesi");
  const [score, setScore] = useState("");
  const [rows, setRows] = useState<Row[]>([]);

  // Modal açıldığında dersleri varsayılan satır olarak doldur
  useEffect(() => {
    if (open && subjects && subjects.length) {
      setRows(subjects.map((s) => newRow(s.id)));
      setExamName("");
      setExamDate(toISODate(new Date()));
      setExamType("LGS Denemesi");
      setScore("");
    }
  }, [open, subjects]);

  function patchRow(key: string, field: keyof Row, value: string) {
    setRows((rs) => rs.map((r) => (r.key === key ? { ...r, [field]: value } : r)));
  }
  function removeRow(key: string) {
    setRows((rs) => rs.filter((r) => r.key !== key));
  }
  function addRow() {
    setRows((rs) => [...rs, newRow()]);
  }

  // Toplamlar
  const totals = rows.reduce(
    (acc, r) => {
      const c = Number(r.correct) || 0;
      const w = Number(r.wrong) || 0;
      const b = Number(r.blank) || 0;
      acc.correct += c;
      acc.wrong += w;
      acc.blank += b;
      acc.net += netOf(c, w);
      return acc;
    },
    { correct: 0, wrong: 0, blank: 0, net: 0 },
  );
  totals.net = Math.round(totals.net * 100) / 100;

  function subjectName(id: string) {
    return subjects?.find((s) => s.id === id)?.subject_name ?? "";
  }

  async function submit() {
    if (!examName.trim()) {
      toast.error("Deneme adı giriniz.");
      return;
    }
    const subjectRows: ExamSubjectInput[] = rows
      .filter((r) => r.subjectId && (r.correct || r.wrong || r.blank))
      .map((r) => ({
        subject_id: r.subjectId,
        correct: Number(r.correct) || 0,
        wrong: Number(r.wrong) || 0,
        blank: Number(r.blank) || 0,
      }));

    try {
      await create.mutateAsync({
        exam_name: examName.trim(),
        exam_date: examDate,
        exam_type: examType,
        score: Number(score) || 0,
        subjects: subjectRows,
      });
      toast.success("Deneme sonucu eklendi. 🎯");
      onClose();
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Bir hata oluştu.");
    }
  }

  return (
    <Modal
      open={open}
      onClose={onClose}
      title="Deneme sınavı"
      description="Ders bazlı doğru/yanlış/boş gir — net otomatik hesaplanır"
      className="max-w-2xl"
    >
      <div className="space-y-4">
        <Field label="Deneme adı">
          <Input placeholder="Türkiye Geneli LGS Denemesi" value={examName} onChange={(e) => setExamName(e.target.value)} />
        </Field>
        <div className="grid grid-cols-3 gap-3">
          <Field label="Tarih">
            <Input type="date" value={examDate} onChange={(e) => setExamDate(e.target.value)} />
          </Field>
          <Field label="Tür">
            <Select value={examType} onChange={(e) => setExamType(e.target.value)}>
              {EXAM_TYPES.map((t) => (
                <option key={t} value={t}>
                  {t}
                </option>
              ))}
            </Select>
          </Field>
          <Field label="Toplam puan" optional hint="Lise eşleştirmede kullanılır">
            <Input type="number" step="0.01" min={0} placeholder="412" value={score} onChange={(e) => setScore(e.target.value)} />
          </Field>
        </div>

        {/* Ders bazlı kırılım */}
        <div>
          <div className="mb-2 flex items-center justify-between">
            <p className="text-[13px] font-semibold text-graphite">Ders bazlı sonuçlar</p>
            <Button size="sm" variant="soft" type="button" onClick={addRow}>
              <Plus className="h-4 w-4" /> Ders ekle
            </Button>
          </div>

          {/* Başlık */}
          <div className="mb-1 grid grid-cols-[1fr_56px_56px_56px_52px_32px] gap-2 px-1 text-[11px] text-slate">
            <span>Ders</span>
            <span className="text-center">Doğru</span>
            <span className="text-center">Yanlış</span>
            <span className="text-center">Boş</span>
            <span className="text-center">Net</span>
            <span />
          </div>

          <div className="space-y-1.5">
            {rows.map((r) => {
              const c = Number(r.correct) || 0;
              const w = Number(r.wrong) || 0;
              const rowNet = netOf(c, w);
              const qHint = LGS_QUESTION_COUNTS[subjectName(r.subjectId)];
              return (
                <div key={r.key} className="grid grid-cols-[1fr_56px_56px_56px_52px_32px] items-center gap-2">
                  <Select value={r.subjectId} onChange={(e) => patchRow(r.key, "subjectId", e.target.value)} className="h-9 text-[13px]">
                    <option value="">— Ders —</option>
                    {(subjects ?? []).map((s) => (
                      <option key={s.id} value={s.id}>
                        {s.subject_name}
                      </option>
                    ))}
                  </Select>
                  <Input className="h-9 px-1.5 text-center text-[13px]" type="number" min={0} inputMode="numeric" placeholder={qHint ? String(qHint) : "0"} value={r.correct} onChange={(e) => patchRow(r.key, "correct", e.target.value)} />
                  <Input className="h-9 px-1.5 text-center text-[13px]" type="number" min={0} inputMode="numeric" placeholder="0" value={r.wrong} onChange={(e) => patchRow(r.key, "wrong", e.target.value)} />
                  <Input className="h-9 px-1.5 text-center text-[13px]" type="number" min={0} inputMode="numeric" placeholder="0" value={r.blank} onChange={(e) => patchRow(r.key, "blank", e.target.value)} />
                  <span className="text-center text-[13px] font-semibold text-iris">{rowNet.toFixed(2)}</span>
                  <button type="button" onClick={() => removeRow(r.key)} className="flex h-8 w-8 items-center justify-center rounded-input text-slate hover:bg-danger-soft hover:text-danger" aria-label="Sil">
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                </div>
              );
            })}
          </div>

          {/* Toplamlar */}
          <div className="mt-3 grid grid-cols-4 gap-2 rounded-input bg-cloud/60 p-2.5 text-center">
            <Total label="Doğru" value={totals.correct} tone="text-mint" />
            <Total label="Yanlış" value={totals.wrong} tone="text-danger" />
            <Total label="Boş" value={totals.blank} tone="text-gravel" />
            <Total label="Net" value={totals.net} tone="text-iris" fixed />
          </div>
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

function Total({ label, value, tone, fixed }: { label: string; value: number; tone: string; fixed?: boolean }) {
  return (
    <div>
      <p className={`font-display text-[18px] font-bold ${tone}`}>{fixed ? value.toFixed(2) : value}</p>
      <p className="text-[10.5px] text-slate">{label}</p>
    </div>
  );
}
