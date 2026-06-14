"use client";

import { useRef, useState } from "react";
import * as XLSX from "xlsx";
import { toast } from "sonner";
import { Upload, Download, CheckCircle2, AlertCircle, Users } from "lucide-react";
import { Modal } from "@/components/ui/modal";
import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";
import { parseStudentRows, type StudentParseResult } from "@/lib/excel-import";
import { useImportStudents } from "@/hooks/use-import-students";

interface Props {
  open: boolean;
  onClose: () => void;
  classId: string;
  defaultGrade: number;
}

const TEMPLATE_HEADERS = [
  "Ad",
  "Soyad",
  "Okul No",
  "Sınıf Düzeyi",
  "Okul Adı",
  "Veli Adı",
  "Veli E-posta",
  "Veli Telefon",
  "Not",
];

export function StudentImportModal({ open, onClose, classId, defaultGrade }: Props) {
  const importMut = useImportStudents(classId);
  const fileRef = useRef<HTMLInputElement>(null);
  const [result, setResult] = useState<StudentParseResult | null>(null);
  const [fileName, setFileName] = useState("");

  function downloadTemplate() {
    const rows = [
      TEMPLATE_HEADERS,
      ["Ali", "Yılmaz", "101", String(defaultGrade), "Atatürk Ortaokulu", "Ayşe Yılmaz", "veli@ornek.com", "05554443322", "LGS hedefliyor"],
      ["Zeynep", "Demir", "102", String(defaultGrade), "Atatürk Ortaokulu", "", "", "", ""],
    ];
    const ws = XLSX.utils.aoa_to_sheet(rows);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Öğrenciler");
    XLSX.writeFile(wb, "ogrenci-sablonu.xlsx");
    toast.success("Şablon indirildi — öğrencileri doldurup yükle. 📄");
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
      const parsed = parseStudentRows(rows, defaultGrade);
      setResult(parsed);
      if (parsed.valid.length === 0 && parsed.invalid.length === 0) {
        toast.error("Geçerli satır bulunamadı. Şablonu kullandığından emin ol.");
      }
    } catch {
      toast.error("Dosya okunamadı. Geçerli bir Excel/CSV yükle.");
    }
  }

  async function confirm() {
    if (!result || result.valid.length === 0) {
      toast.error("Eklenecek öğrenci yok.");
      return;
    }
    try {
      const n = await importMut.mutateAsync(result.valid);
      toast.success(`${n} öğrenci sınıfa eklendi. 🎒`);
      reset();
      onClose();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Aktarım başarısız.");
    }
  }

  function reset() {
    setResult(null);
    setFileName("");
    if (fileRef.current) fileRef.current.value = "";
  }

  return (
    <Modal
      open={open}
      onClose={onClose}
      title="Excel ile öğrenci ekle"
      description="Tek tabloyla tüm sınıfı yükle — tek tek eklemekle uğraşma"
      className="max-w-2xl"
    >
      <div className="space-y-4">
        <div className="flex flex-wrap items-center gap-2 rounded-input bg-cloud/50 p-3">
          <Users className="h-5 w-5 text-iris" />
          <p className="flex-1 text-[12.5px] text-gravel">
            Şablonu indir, öğrencileri doldur (en az <b>Ad</b> ve <b>Soyad</b>), sonra yükle. Boş bırakılan
            sınıf düzeyi {defaultGrade} olarak alınır.
          </p>
          <Button size="sm" variant="soft" type="button" onClick={downloadTemplate}>
            <Download className="h-4 w-4" /> Şablon indir
          </Button>
        </div>

        <label className="flex cursor-pointer flex-col items-center justify-center gap-2 rounded-card border-2 border-dashed border-chalk bg-white px-6 py-8 text-center transition-colors hover:border-iris hover:bg-iris-soft/30">
          <Upload className="h-6 w-6 text-iris" />
          <span className="text-[13px] font-medium text-graphite">
            {fileName || "Excel veya CSV dosyası seç"}
          </span>
          <span className="text-[11.5px] text-slate">.xlsx, .xls, .csv</span>
          <input ref={fileRef} type="file" accept=".xlsx,.xls,.csv" className="hidden" onChange={onFile} />
        </label>

        {result && (
          <div className="space-y-3">
            <div className="flex gap-2">
              <span className="inline-flex items-center gap-1.5 rounded-pill bg-mint-soft px-3 py-1 text-[12px] font-semibold text-mint">
                <CheckCircle2 className="h-3.5 w-3.5" /> {result.valid.length} öğrenci
              </span>
              {result.invalid.length > 0 && (
                <span className="inline-flex items-center gap-1.5 rounded-pill bg-danger-soft px-3 py-1 text-[12px] font-semibold text-danger">
                  <AlertCircle className="h-3.5 w-3.5" /> {result.invalid.length} hatalı
                </span>
              )}
            </div>

            {result.valid.length > 0 && (
              <div className="max-h-44 overflow-y-auto rounded-input border border-chalk">
                {result.valid.map((r) => (
                  <div key={r.rowIndex} className="flex items-center justify-between gap-2 border-b border-chalk px-3 py-1.5 text-[12.5px] last:border-0">
                    <span className="flex items-center gap-1.5 text-ink">
                      <CheckCircle2 className="h-3.5 w-3.5 text-mint" /> {r.first_name} {r.last_name}
                    </span>
                    <span className="text-[11.5px] text-gravel">
                      {r.grade_level}. sınıf
                      {r.student_no ? ` · no ${r.student_no}` : ""}
                      {r.parent_email ? " · veli ✓" : ""}
                    </span>
                  </div>
                ))}
              </div>
            )}

            {result.invalid.length > 0 && (
              <div className="max-h-28 overflow-y-auto rounded-input border border-danger/30 bg-danger-soft/30">
                {result.invalid.map((r) => (
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
        <Button onClick={confirm} disabled={importMut.isPending || !result || result.valid.length === 0}>
          {importMut.isPending ? <Spinner className="text-white" /> : `Ekle (${result?.valid.length ?? 0})`}
        </Button>
      </div>
    </Modal>
  );
}
