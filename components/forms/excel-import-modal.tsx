"use client";

import { useRef, useState } from "react";
import * as XLSX from "xlsx";
import { toast } from "sonner";
import { Upload, Download, CheckCircle2, AlertCircle, FileSpreadsheet } from "lucide-react";
import { Modal } from "@/components/ui/modal";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Field } from "@/components/ui/field";
import { Spinner } from "@/components/ui/spinner";
import { parseExamRows, type ParseResult } from "@/lib/excel-import";
import { useImportClassExams } from "@/hooks/use-import-exams";
import { EXAM_TYPES } from "@/lib/constants";
import { toISODate } from "@/lib/weeks";
import type { Student, Subject } from "@/lib/types";

interface Props {
  open: boolean;
  onClose: () => void;
  students: Student[];
  subjects: Subject[];
}

const SUBJ_SHORT = ["Türkçe", "Matematik", "Fen", "Sosyal", "İngilizce", "Din"];
const TEMPLATE_HEADERS = [
  "Okul No",
  "Ad Soyad",
  ...SUBJ_SHORT.flatMap((s) => [`${s} D`, `${s} Y`, `${s} B`]),
  "Puan",
];

export function ExcelImportModal({ open, onClose, students, subjects }: Props) {
  const importMut = useImportClassExams();
  const fileRef = useRef<HTMLInputElement>(null);

  const [examName, setExamName] = useState("");
  const [examDate, setExamDate] = useState(toISODate(new Date()));
  const [examType, setExamType] = useState("LGS Denemesi");
  const [result, setResult] = useState<ParseResult | null>(null);
  const [fileName, setFileName] = useState("");

  function downloadTemplate() {
    const rows = [
      TEMPLATE_HEADERS,
      ...students.map((s) => [
        s.student_no ?? "",
        `${s.first_name} ${s.last_name}`,
        ...Array(SUBJ_SHORT.length * 3).fill(""),
        "",
      ]),
    ];
    const ws = XLSX.utils.aoa_to_sheet(rows);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Deneme");
    XLSX.writeFile(wb, "deneme-sablonu.xlsx");
    toast.success("Şablon indirildi — D/Y/B sütunlarını doldurup yükle. 📄");
  }

  async function onFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setFileName(file.name);
    try {
      const buf = await file.arrayBuffer();
      const wb = XLSX.read(buf);
      const ws = wb.Sheets[wb.SheetNames[0]];
      const rows = XLSX.utils.sheet_to_json<Record<string, unknown>>(ws, { defval: "" });
      const parsed = parseExamRows(rows, students, subjects);
      setResult(parsed);
      if (parsed.subjectColumnsFound.length === 0) {
        toast.error("Ders sütunları bulunamadı. Şablonu kullandığından emin ol.");
      }
    } catch {
      toast.error("Dosya okunamadı. Geçerli bir Excel/CSV yükle.");
    }
  }

  async function confirm() {
    if (!examName.trim()) {
      toast.error("Deneme adı giriniz.");
      return;
    }
    if (!result || result.matched.length === 0) {
      toast.error("Eşleşen öğrenci yok.");
      return;
    }
    try {
      const n = await importMut.mutateAsync({
        exam_name: examName.trim(),
        exam_date: examDate,
        exam_type: examType,
        rows: result.matched,
      });
      toast.success(`${n} öğrenciye deneme aktarıldı. 🎉`);
      reset();
      onClose();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Aktarım başarısız.");
    }
  }

  function reset() {
    setResult(null);
    setFileName("");
    setExamName("");
    if (fileRef.current) fileRef.current.value = "";
  }

  return (
    <Modal
      open={open}
      onClose={onClose}
      title="Excel ile deneme yükle"
      description="Tek tabloyla tüm sınıfa deneme aktar — öğrenci no veya ad-soyadla eşleşir"
      className="max-w-2xl"
    >
      <div className="space-y-4">
        <div className="grid grid-cols-3 gap-3">
          <Field label="Deneme adı">
            <Input placeholder="Türkiye Geneli" value={examName} onChange={(e) => setExamName(e.target.value)} />
          </Field>
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
        </div>

        <div className="flex flex-wrap items-center gap-2 rounded-input bg-cloud/50 p-3">
          <FileSpreadsheet className="h-5 w-5 text-mint" />
          <p className="flex-1 text-[12.5px] text-gravel">
            Önce şablonu indir, D/Y/B sütunlarını doldur, sonra yükle. Eşleştirme <b>Okul No</b> veya{" "}
            <b>Ad Soyad</b> ile yapılır.
          </p>
          <Button size="sm" variant="soft" type="button" onClick={downloadTemplate}>
            <Download className="h-4 w-4" /> Şablon indir
          </Button>
        </div>

        {/* Dosya yükleme */}
        <label className="flex cursor-pointer flex-col items-center justify-center gap-2 rounded-card border-2 border-dashed border-chalk bg-white px-6 py-8 text-center transition-colors hover:border-iris hover:bg-iris-soft/30">
          <Upload className="h-6 w-6 text-iris" />
          <span className="text-[13px] font-medium text-graphite">
            {fileName || "Excel veya CSV dosyası seç"}
          </span>
          <span className="text-[11.5px] text-slate">.xlsx, .xls, .csv</span>
          <input ref={fileRef} type="file" accept=".xlsx,.xls,.csv" className="hidden" onChange={onFile} />
        </label>

        {/* Önizleme */}
        {result && (
          <div className="space-y-3">
            <div className="flex gap-2">
              <span className="inline-flex items-center gap-1.5 rounded-pill bg-mint-soft px-3 py-1 text-[12px] font-semibold text-mint">
                <CheckCircle2 className="h-3.5 w-3.5" /> {result.matched.length} eşleşti
              </span>
              {result.unmatched.length > 0 && (
                <span className="inline-flex items-center gap-1.5 rounded-pill bg-danger-soft px-3 py-1 text-[12px] font-semibold text-danger">
                  <AlertCircle className="h-3.5 w-3.5" /> {result.unmatched.length} eşleşmedi
                </span>
              )}
            </div>

            {result.matched.length > 0 && (
              <div className="max-h-44 overflow-y-auto rounded-input border border-chalk">
                {result.matched.map((r) => {
                  const tot = r.subjects.reduce(
                    (a, s) => ({ c: a.c + s.correct, w: a.w + s.wrong, b: a.b + s.blank }),
                    { c: 0, w: 0, b: 0 },
                  );
                  return (
                    <div key={r.rowIndex} className="flex items-center justify-between gap-2 border-b border-chalk px-3 py-1.5 text-[12.5px] last:border-0">
                      <span className="flex items-center gap-1.5 text-ink">
                        <CheckCircle2 className="h-3.5 w-3.5 text-mint" /> {r.studentName}
                        <span className="text-[11px] text-slate">({r.matchedBy === "no" ? "no" : "isim"})</span>
                      </span>
                      <span className="text-[11.5px] text-gravel">
                        {tot.c}D {tot.w}Y {tot.b}B{r.score ? ` · ${r.score} puan` : ""}
                      </span>
                    </div>
                  );
                })}
              </div>
            )}

            {result.unmatched.length > 0 && (
              <div className="max-h-28 overflow-y-auto rounded-input border border-danger/30 bg-danger-soft/30">
                {result.unmatched.map((r) => (
                  <div key={r.rowIndex} className="flex items-center justify-between gap-2 px-3 py-1.5 text-[12px] text-danger">
                    <span>{r.label}</span>
                    <span className="text-[11px]">{r.reason}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      <div className="mt-5 flex justify-end gap-2">
        <Button variant="ghost" type="button" onClick={onClose}>
          Vazgeç
        </Button>
        <Button onClick={confirm} disabled={importMut.isPending || !result || result.matched.length === 0}>
          {importMut.isPending ? <Spinner className="text-white" /> : `Aktar (${result?.matched.length ?? 0})`}
        </Button>
      </div>
    </Modal>
  );
}
