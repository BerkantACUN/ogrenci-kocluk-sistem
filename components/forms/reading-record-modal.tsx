"use client";

import { useState } from "react";
import { toast } from "sonner";
import { Modal } from "@/components/ui/modal";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Field } from "@/components/ui/field";
import { Spinner } from "@/components/ui/spinner";
import { WeekSelect } from "./week-select";
import { useCreateReading } from "@/hooks/use-student-data";
import { currentWeek, type WeekRange } from "@/lib/weeks";

interface Props {
  open: boolean;
  onClose: () => void;
  studentId: string;
}

export function ReadingRecordModal({ open, onClose, studentId }: Props) {
  const create = useCreateReading(studentId);
  const [week, setWeek] = useState<WeekRange>(currentWeek());
  const [book, setBook] = useState("");
  const [pages, setPages] = useState("");

  async function submit() {
    if (!book.trim()) {
      toast.error("Kitap adı giriniz.");
      return;
    }
    try {
      await create.mutateAsync({
        week_start_date: week.start,
        week_end_date: week.end,
        book_name: book.trim(),
        page_count: Number(pages) || 0,
      });
      toast.success("Kitap okuma kaydı eklendi. 📚");
      setBook("");
      setPages("");
      onClose();
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Bir hata oluştu.");
    }
  }

  return (
    <Modal open={open} onClose={onClose} title="Kitap okuma" description="Haftalık okunan kitap ve sayfa">
      <div className="space-y-4">
        <Field label="Hafta" htmlFor="rweek">
          <WeekSelect id="rweek" value={week.start} onChange={setWeek} />
        </Field>
        <Field label="Kitap adı" htmlFor="book">
          <Input id="book" placeholder="Sol Ayağım" value={book} onChange={(e) => setBook(e.target.value)} />
        </Field>
        <Field label="Okunan sayfa" htmlFor="pages">
          <Input id="pages" type="number" min={0} inputMode="numeric" placeholder="85" value={pages} onChange={(e) => setPages(e.target.value)} />
        </Field>
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
