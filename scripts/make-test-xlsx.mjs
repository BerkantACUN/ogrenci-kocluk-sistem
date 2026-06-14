// Test amaçlı örnek deneme xlsx üretir (eşleştirme testi için).
import * as XLSX from "xlsx";

const headers = [
  "Okul No",
  "Ad Soyad",
  "Türkçe D", "Türkçe Y", "Türkçe B",
  "Matematik D", "Matematik Y", "Matematik B",
  "Fen D", "Fen Y", "Fen B",
  "Sosyal D", "Sosyal Y", "Sosyal B",
  "İngilizce D", "İngilizce Y", "İngilizce B",
  "Din D", "Din Y", "Din B",
  "Puan",
];

const rows = [
  headers,
  ["101", "Ayşe Şahin", 16, 3, 1, 15, 4, 1, 14, 5, 1, 8, 1, 1, 7, 2, 1, 8, 1, 1, 421],
  ["102", "Elif Yıldız", 18, 1, 1, 17, 2, 1, 16, 3, 1, 9, 1, 0, 8, 1, 1, 9, 0, 1, 448],
  ["103", "Emir Aydın", 13, 5, 2, 14, 5, 1, 12, 6, 2, 7, 2, 1, 6, 3, 1, 7, 2, 1, 398],
  ["104", "Mehmet Çelik", 12, 6, 2, 13, 6, 1, 11, 7, 2, 6, 3, 1, 6, 3, 1, 6, 3, 1, 372],
  ["105", "Yusuf Demir", 14, 4, 2, 14, 5, 1, 13, 5, 2, 7, 2, 1, 7, 2, 1, 7, 2, 1, 405],
  ["106", "Zeynep Kaya", 19, 1, 0, 18, 1, 1, 17, 2, 1, 9, 1, 0, 9, 1, 0, 9, 1, 0, 462],
  ["999", "Olmayan Öğrenci", 10, 5, 5, 10, 5, 5, 10, 5, 5, 5, 3, 2, 5, 3, 2, 5, 3, 2, 300],
];

const ws = XLSX.utils.aoa_to_sheet(rows);
const wb = XLSX.utils.book_new();
XLSX.utils.book_append_sheet(wb, ws, "Deneme");
XLSX.writeFile(wb, "C:/Users/acunb/Desktop/Öğrenci Koçluk/test-deneme.xlsx");
console.log("test-deneme.xlsx üretildi");
