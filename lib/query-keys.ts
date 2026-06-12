/** Merkezi React Query anahtarları. */
export const qk = {
  profile: ["profile"] as const,
  subjects: ["subjects"] as const,
  classes: ["classes"] as const,
  classDetail: (id: string) => ["classes", id] as const,
  students: (classId?: string) => ["students", classId ?? "all"] as const,
  student: (id: string) => ["student", id] as const,
  weekly: (studentId: string) => ["weekly", studentId] as const,
  reading: (studentId: string) => ["reading", studentId] as const,
  exams: (studentId: string) => ["exams", studentId] as const,
  highSchools: ["highSchools"] as const,
  teachers: ["teachers"] as const,
  dashboard: ["dashboard"] as const,
};
