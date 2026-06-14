// Test amaçlı örnek öğrenci xlsx üretir.
import * as XLSX from "xlsx";

const headers = ["Ad", "Soyad", "Okul No", "Sınıf Düzeyi", "Okul Adı", "Veli Adı", "Veli E-posta", "Veli Telefon", "Not"];
const rows = [
  headers,
  ["Ahmet", "Korkmaz", "201", "8", "Neriman İbrahim Küçükkurt Ortaokulu", "Hasan Korkmaz", "hasan@ornek.com", "05551112233", "Yeni kayıt"],
  ["Selin", "Arslan", "202", "8", "Neriman İbrahim Küçükkurt Ortaokulu", "Derya Arslan", "derya@ornek.com", "05551112244", ""],
  ["Kerem", "Doğan", "203", "", "Neriman İbrahim Küçükkurt Ortaokulu", "", "", "", "Sınıf düzeyi boş → varsayılan"],
  ["Eksik", "", "204", "8", "", "", "", "", "Soyad eksik → hatalı"],
];
const ws = XLSX.utils.aoa_to_sheet(rows);
const wb = XLSX.utils.book_new();
XLSX.utils.book_append_sheet(wb, ws, "Öğrenciler");
XLSX.writeFile(wb, "C:/Users/acunb/Desktop/Öğrenci Koçluk/test-ogrenci.xlsx");
console.log("test-ogrenci.xlsx üretildi");
