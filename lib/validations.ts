import { z } from "zod";
import { GRADE_LEVELS } from "./constants";

const gradeEnum = z
  .number({ message: "Sınıf düzeyi seçiniz" })
  .refine((v) => (GRADE_LEVELS as readonly number[]).includes(v), "Geçerli bir sınıf düzeyi seçiniz");

export const registerSchema = z
  .object({
    name: z.string().min(2, "Ad en az 2 karakter olmalı"),
    surname: z.string().min(2, "Soyad en az 2 karakter olmalı"),
    email: z.string().email("Geçerli bir e-posta giriniz"),
    password: z.string().min(6, "Şifre en az 6 karakter olmalı"),
    phone: z.string().optional().or(z.literal("")),
    branch: z.string().optional().or(z.literal("")),
    school_name: z.string().optional().or(z.literal("")),
  });
export type RegisterInput = z.infer<typeof registerSchema>;

export const loginSchema = z.object({
  email: z.string().email("Geçerli bir e-posta giriniz"),
  password: z.string().min(1, "Şifre giriniz"),
});
export type LoginInput = z.infer<typeof loginSchema>;

export const classroomSchema = z.object({
  class_name: z.string().min(1, "Sınıf adı giriniz"),
  grade_level: gradeEnum,
  school_name: z.string().optional().or(z.literal("")),
  description: z.string().optional().or(z.literal("")),
});
export type ClassroomInput = z.infer<typeof classroomSchema>;

export const studentSchema = z.object({
  first_name: z.string().min(1, "Öğrenci adı giriniz"),
  last_name: z.string().min(1, "Öğrenci soyadı giriniz"),
  grade_level: gradeEnum,
  class_id: z.string().uuid().optional().nullable(),
  school_name: z.string().optional().or(z.literal("")),
  parent_name: z.string().optional().or(z.literal("")),
  parent_email: z.string().email("Geçerli bir veli e-postası giriniz").optional().or(z.literal("")),
  parent_phone: z.string().optional().or(z.literal("")),
  note: z.string().optional().or(z.literal("")),
});
export type StudentInput = z.infer<typeof studentSchema>;

export const weeklyRecordSchema = z.object({
  subject_id: z.string().uuid("Ders seçiniz"),
  week_start_date: z.string().min(1),
  week_end_date: z.string().min(1),
  topic: z.string().optional().or(z.literal("")),
  correct_count: z.coerce.number().int().min(0, "0 veya daha büyük"),
  wrong_count: z.coerce.number().int().min(0, "0 veya daha büyük"),
});
export type WeeklyRecordInput = z.infer<typeof weeklyRecordSchema>;

export const readingRecordSchema = z.object({
  week_start_date: z.string().min(1),
  week_end_date: z.string().min(1),
  book_name: z.string().min(1, "Kitap adı giriniz"),
  page_count: z.coerce.number().int().min(0, "0 veya daha büyük"),
});
export type ReadingRecordInput = z.infer<typeof readingRecordSchema>;

export const examResultSchema = z.object({
  exam_name: z.string().min(1, "Deneme adı giriniz"),
  exam_date: z.string().min(1, "Tarih seçiniz"),
  exam_type: z.string().optional().or(z.literal("")),
  score: z.coerce.number().min(0, "0 veya daha büyük").max(600, "Geçerli bir puan giriniz"),
});
export type ExamResultInput = z.infer<typeof examResultSchema>;

export const highSchoolSchema = z.object({
  school_name: z.string().min(1, "Lise adı giriniz"),
  city: z.string().min(1, "İl giriniz"),
  district: z.string().optional().or(z.literal("")),
  school_type: z.string().optional().or(z.literal("")),
  base_score: z.coerce.number().min(0).max(600),
  percentile: z.coerce.number().min(0).max(100).optional().nullable(),
  quota: z.coerce.number().int().min(0).optional().nullable(),
  year: z.coerce.number().int().min(2000).max(2100),
});
export type HighSchoolInput = z.infer<typeof highSchoolSchema>;
