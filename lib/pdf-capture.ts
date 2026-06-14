import { jsPDF } from "jspdf";
import html2canvas from "html2canvas-pro";

/**
 * Bir DOM öğesini birebir ekran görüntüsü olarak A4 PDF'e basar (çok sayfalı).
 * html2canvas-pro modern CSS renklerini (color-mix/oklch) destekler.
 * Yalnızca tarayıcıda çalışır.
 */
export async function captureElementToPdf(el: HTMLElement, fileName: string): Promise<void> {
  const canvas = await html2canvas(el, {
    scale: 2,
    backgroundColor: "#ffffff",
    useCORS: true,
    logging: false,
  });

  const imgData = canvas.toDataURL("image/png");
  const pdf = new jsPDF({ unit: "mm", format: "a4", orientation: "p" });
  const pageW = pdf.internal.pageSize.getWidth();
  const pageH = pdf.internal.pageSize.getHeight();
  const imgW = pageW;
  const imgH = (canvas.height * imgW) / canvas.width;

  let heightLeft = imgH;
  let position = 0;
  pdf.addImage(imgData, "PNG", 0, position, imgW, imgH, undefined, "FAST");
  heightLeft -= pageH;
  while (heightLeft > 0) {
    position -= pageH;
    pdf.addPage();
    pdf.addImage(imgData, "PNG", 0, position, imgW, imgH, undefined, "FAST");
    heightLeft -= pageH;
  }
  pdf.save(fileName);
}
