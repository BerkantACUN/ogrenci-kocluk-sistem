"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { Sparkles } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { registerSchema, type RegisterInput } from "@/lib/validations";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Field } from "@/components/ui/field";
import { Spinner } from "@/components/ui/spinner";
import { APP_NAME } from "@/lib/constants";

export default function RegisterPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<RegisterInput>({ resolver: zodResolver(registerSchema) });

  async function onSubmit(values: RegisterInput) {
    setLoading(true);
    try {
      const supabase = createClient();
      const { data, error } = await supabase.auth.signUp({
        email: values.email,
        password: values.password,
        options: {
          data: {
            name: values.name,
            surname: values.surname,
            role: "teacher",
            phone: values.phone || "",
            branch: values.branch || "",
            school_name: values.school_name || "",
          },
        },
      });
      if (error) {
        toast.error(`Kayıt başarısız: ${error.message}`);
        return;
      }
      if (data.session) {
        toast.success("Hesabın oluşturuldu! 🎉");
        router.replace("/panel");
        router.refresh();
      } else {
        toast.success("Kayıt alındı. Lütfen e-posta adresini doğrula, sonra giriş yap.");
        router.replace("/giris");
      }
    } finally {
      setLoading(false);
    }
  }

  return (
    <div>
      <div className="mb-6 flex items-center gap-2.5 lg:hidden">
        <span className="inline-flex h-9 w-9 items-center justify-center rounded-input bg-iris text-white">
          <Sparkles className="h-5 w-5" />
        </span>
        <span className="font-display text-[18px] font-bold">{APP_NAME}</span>
      </div>

      <h1 className="font-display text-[26px] font-bold text-ink">Öğretmen hesabı oluştur</h1>
      <p className="mt-1.5 text-[13.5px] text-gravel">Birkaç bilgiyle hemen başla.</p>

      <form onSubmit={handleSubmit(onSubmit)} className="mt-7 space-y-4">
        <div className="grid grid-cols-2 gap-3">
          <Field label="Ad" htmlFor="name" error={errors.name?.message}>
            <Input id="name" placeholder="Ayşe" autoComplete="given-name" {...register("name")} />
          </Field>
          <Field label="Soyad" htmlFor="surname" error={errors.surname?.message}>
            <Input id="surname" placeholder="Yılmaz" autoComplete="family-name" {...register("surname")} />
          </Field>
        </div>
        <Field label="E-posta" htmlFor="email" error={errors.email?.message}>
          <Input id="email" type="email" placeholder="ornek@okul.com" autoComplete="email" {...register("email")} />
        </Field>
        <Field label="Şifre" htmlFor="password" error={errors.password?.message} hint="En az 6 karakter">
          <Input id="password" type="password" placeholder="••••••••" autoComplete="new-password" {...register("password")} />
        </Field>
        <div className="grid grid-cols-2 gap-3">
          <Field label="Branş" htmlFor="branch" optional error={errors.branch?.message}>
            <Input id="branch" placeholder="Matematik" {...register("branch")} />
          </Field>
          <Field label="Telefon" htmlFor="phone" optional error={errors.phone?.message}>
            <Input id="phone" placeholder="05xx" autoComplete="tel" {...register("phone")} />
          </Field>
        </div>
        <Field label="Okul adı" htmlFor="school_name" optional error={errors.school_name?.message}>
          <Input id="school_name" placeholder="Atatürk Ortaokulu" {...register("school_name")} />
        </Field>
        <Button type="submit" size="lg" className="w-full" disabled={loading}>
          {loading ? <Spinner className="text-white" /> : "Hesap oluştur"}
        </Button>
      </form>

      <p className="mt-6 text-center text-[13px] text-gravel">
        Zaten hesabın var mı?{" "}
        <Link href="/giris" className="font-semibold text-iris hover:underline">
          Giriş yap
        </Link>
      </p>
    </div>
  );
}
