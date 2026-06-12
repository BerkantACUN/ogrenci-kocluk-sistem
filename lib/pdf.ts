import { jsPDF } from "jspdf";
import autoTable from "jspdf-autotable";
import type { ReportData } from "./reports";
import { APP_NAME } from "./constants";
import { formatDate, formatDateShort } from "./weeks";

/**
 * NOT (Faz 2): jsPDF standart fontları Türkçe ş/ğ/ı/İ glyph'lerini içermez.
 * MVP'de güvenli okunabilirlik için hafif normalizasyon uygulanır.
 * Tam Türkçe glyph desteği için bir Unicode TTF (örn. Roboto/DejaVu) gömülmeli.
 */
function tr(text: string): string {
  return text
    .replaceAll("ı", "i")
    .replaceAll("İ", "I")
    .replaceAll("ş", "s")
    .replaceAll("Ş", "S")
    .replaceAll("ğ", "g")
    .replaceAll("Ğ", "G")
    .replaceAll("ç", "c")
    .replaceAll("Ç", "C")
    .replaceAll("ö", "o")
    .replaceAll("Ö", "O")
    .replaceAll("ü", "u")
    .replaceAll("Ü", "U");
}

const IRIS: [number, number, number] = [108, 92, 231];
const INK: [number, number, number] = [27, 26, 22];
const GRAVEL: [number, number, number] = [111, 108, 97];

function finalY(doc: jsPDF): number {
  return (doc as unknown as { lastAutoTable: { finalY: number } }).lastAutoTable.finalY;
}

export function generateReportPdf(data: ReportData): void {
  const doc = new jsPDF({ unit: "pt", format: "a4" });
  const pageW = doc.internal.pageSize.getWidth();
  const margin = 40;
  let y = 48;

  // Başlık şeridi
  doc.setFillColor(...IRIS);
  doc.rect(0, 0, pageW, 6, "F");

  doc.setFont("helvetica", "bold");
  doc.setFontSize(18);
  doc.setTextColor(...INK);
  doc.text(tr(APP_NAME), margin, y);

  doc.setFont("helvetica", "normal");
  doc.setFontSize(11);
  doc.setTextColor(...GRAVEL);
  const reportTitle = data.reportType === "weekly" ? "Haftalik Rapor" : "Aylik Rapor";
  doc.text(reportTitle, pageW - margin, y, { align: "right" });

  y += 24;

  // Öğrenci kimliği
  const s = data.student;
  doc.setFontSize(13);
  doc.setTextColor(...INK);
  doc.setFont("helvetica", "bold");
  doc.text(tr(`${s.first_name} ${s.last_name}`), margin, y);
  doc.setFont("helvetica", "normal");
  doc.setFontSize(10);
  doc.setTextColor(...GRAVEL);
  y += 16;
  const meta = [`${s.grade_level}. Sinif`, s.school_name ?? "", data.periodLabel].filter(Boolean).join("  ·  ");
  doc.text(tr(meta), margin, y);
  y += 22;

  // Özet kutuları
  const stats: [string, string][] = [
    ["Toplam Soru", String(data.totals.total)],
    ["Genel Basari", `%${data.totals.successRate}`],
    ["Okunan Sayfa", String(data.readingPages)],
    ["Son Deneme", data.lastScore != null ? String(data.lastScore) : "-"],
  ];
  const boxW = (pageW - margin * 2 - 24) / 4;
  stats.forEach(([label, value], i) => {
    const x = margin + i * (boxW + 8);
    doc.setFillColor(243, 242, 236);
    doc.roundedRect(x, y, boxW, 48, 8, 8, "F");
    doc.setFont("helvetica", "bold");
    doc.setFontSize(15);
    doc.setTextColor(...IRIS);
    doc.text(value, x + 10, y + 22);
    doc.setFont("helvetica", "normal");
    doc.setFontSize(8.5);
    doc.setTextColor(...GRAVEL);
    doc.text(tr(label), x + 10, y + 38);
  });
  y += 64;

  // Yorumlar
  if (data.comments.length) {
    doc.setFont("helvetica", "bold");
    doc.setFontSize(11);
    doc.setTextColor(...INK);
    doc.text("Degerlendirme", margin, y);
    y += 6;
    doc.setFont("helvetica", "normal");
    doc.setFontSize(9.5);
    doc.setTextColor(...GRAVEL);
    data.comments.forEach((c) => {
      const lines = doc.splitTextToSize(tr(`•  ${c}`), pageW - margin * 2);
      doc.text(lines, margin, (y += 14));
      y += (lines.length - 1) * 12;
    });
    y += 12;
  }

  // Ders tablosu
  if (data.subjects.length) {
    autoTable(doc, {
      startY: y,
      head: [["Ders", "Dogru", "Yanlis", "Toplam", "Basari"]],
      body: data.subjects.map((sub) => [
        tr(sub.subjectName),
        String(sub.correct),
        String(sub.wrong),
        String(sub.total),
        `%${sub.successRate}`,
      ]),
      styles: { font: "helvetica", fontSize: 9, cellPadding: 5 },
      headStyles: { fillColor: IRIS, textColor: 255, fontStyle: "bold" },
      alternateRowStyles: { fillColor: [248, 247, 243] },
      margin: { left: margin, right: margin },
    });
    y = finalY(doc) + 18;
  }

  // Deneme tablosu
  if (data.exams.length) {
    autoTable(doc, {
      startY: y,
      head: [["Tarih", "Deneme", "Puan"]],
      body: data.exams.map((e) => [formatDateShort(e.date), tr(e.name), String(e.score)]),
      styles: { font: "helvetica", fontSize: 9, cellPadding: 5 },
      headStyles: { fillColor: [255, 107, 157], textColor: 255, fontStyle: "bold" },
      alternateRowStyles: { fillColor: [255, 240, 245] },
      margin: { left: margin, right: margin },
    });
    y = finalY(doc) + 18;
  }

  // Lise eşleştirmesi
  const { eligible, target } = data.schoolMatch;
  if (eligible.length || target.length) {
    doc.setFont("helvetica", "bold");
    doc.setFontSize(11);
    doc.setTextColor(...INK);
    doc.text("Hedeflenebilecek Liseler", margin, y);
    y += 4;
    const rows = [
      ...eligible.slice(0, 6).map((h) => [tr(h.school_name), tr(`${h.city}${h.district ? "/" + h.district : ""}`), String(h.base_score), "Yerlesebilir"]),
      ...target.slice(0, 6).map((h) => [tr(h.school_name), tr(`${h.city}${h.district ? "/" + h.district : ""}`), String(h.base_score), "Hedef"]),
    ];
    autoTable(doc, {
      startY: y + 4,
      head: [["Lise", "Konum", "Taban", "Durum"]],
      body: rows,
      styles: { font: "helvetica", fontSize: 9, cellPadding: 5 },
      headStyles: { fillColor: [47, 191, 145], textColor: 255, fontStyle: "bold" },
      alternateRowStyles: { fillColor: [240, 250, 246] },
      margin: { left: margin, right: margin },
    });
    y = finalY(doc) + 12;
  }

  // Alt bilgi
  const footerY = doc.internal.pageSize.getHeight() - 24;
  doc.setFont("helvetica", "normal");
  doc.setFontSize(8);
  doc.setTextColor(...GRAVEL);
  doc.text(tr(`${APP_NAME} · ${formatDate(new Date())} tarihinde olusturuldu`), margin, footerY);

  const fileName = tr(`${s.first_name}_${s.last_name}_${reportTitle}`).replace(/\s+/g, "_") + ".pdf";
  doc.save(fileName);
}
