/** Uygulama geneli sabitler. */

/** Varsayılan dersler — renk kodları subject_name ile eşleştirilir. */
export const DEFAULT_SUBJECTS = [
  { name: "Türkçe", color: "rose" },
  { name: "Matematik", color: "iris" },
  { name: "Fen Bilimleri", color: "mint" },
  { name: "Sosyal Bilgiler", color: "peach" },
  { name: "İngilizce", color: "sky" },
  { name: "Din Kültürü ve Ahlak Bilgisi", color: "lemon" },
] as const;

export type SubjectColor = (typeof DEFAULT_SUBJECTS)[number]["color"];

/** subject_name -> tema rengi (hex). Grafik ve rozetlerde kullanılır. */
export const SUBJECT_COLOR_HEX: Record<string, string> = {
  "Türkçe": "#ff6b9d",
  "Matematik": "#6c5ce7",
  "Fen Bilimleri": "#2fbf91",
  "Sosyal Bilgiler": "#ff9f43",
  "İngilizce": "#4aa3ff",
  "Din Kültürü ve Ahlak Bilgisi": "#f4b740",
};

/** subject_name -> token rengi adı (Tailwind sınıfı için). */
export const SUBJECT_COLOR_TOKEN: Record<string, SubjectColor> = {
  "Türkçe": "rose",
  "Matematik": "iris",
  "Fen Bilimleri": "mint",
  "Sosyal Bilgiler": "peach",
  "İngilizce": "sky",
  "Din Kültürü ve Ahlak Bilgisi": "lemon",
};

export const FALLBACK_SUBJECT_HEX = "#6c5ce7";

export function subjectHex(subjectName: string): string {
  return SUBJECT_COLOR_HEX[subjectName] ?? FALLBACK_SUBJECT_HEX;
}

/** Grafik kategori paleti (sırayla). */
export const CHART_PALETTE = [
  "#6c5ce7",
  "#2fbf91",
  "#ff9f43",
  "#4aa3ff",
  "#ff6b9d",
  "#f4b740",
];

/** Sınıf düzeyleri (LGS odaklı: 5–8, lise düzeyleri de hazır). */
export const GRADE_LEVELS = [5, 6, 7, 8, 9, 10, 11, 12] as const;

/** Lise türleri. */
export const SCHOOL_TYPES = [
  "Fen Lisesi",
  "Anadolu Lisesi",
  "Sosyal Bilimler Lisesi",
  "İmam Hatip Lisesi",
  "Mesleki ve Teknik Anadolu Lisesi",
  "Spor Lisesi",
  "Güzel Sanatlar Lisesi",
] as const;

/** Deneme türleri. */
export const EXAM_TYPES = [
  "LGS Denemesi",
  "Kurum İçi Deneme",
  "Türkiye Geneli",
  "TYT Denemesi",
  "AYT Denemesi",
  "Diğer",
] as const;

/** Hedef lise penceresi: öğrenci puanından +X puana kadar olan liseler "hedef". */
export const TARGET_SCHOOL_WINDOW = 20;

/** Başarı yorumu eşikleri. */
export const SUCCESS_THRESHOLDS = {
  strong: 75,
  medium: 50,
} as const;

export const APP_NAME = "Koçum";
export const APP_TAGLINE = "Öğrenci Koçluk ve Takip Sistemi";
