"use client";

import { useState, Suspense } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { Sparkles } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { loginSchema, type LoginInput } from "@/lib/validations";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Field } from "@/components/ui/field";
import { Spinner } from "@/components/ui/spinner";
import { APP_NAME } from "@/lib/constants";

function LoginForm() {
  const router = useRouter();
  const params = useSearchParams();
  const [loading, setLoading] = useState(false);
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginInput>({ resolver: zodResolver(loginSchema) });

  async function onSubmit(values: LoginInput) {
    setLoading(true);
    try {
      const supabase = createClient();
      const { error } = await supabase.auth.signInWithPassword({
        email: values.email,
        password: values.password,
      });
      if (error) {
        toast.error("Giriş yapılamadı: e-posta veya şifre hatalı.");
        return;
      }
      toast.success("Hoş geldin! 👋");
      router.replace(params.get("next") || "/panel");
      router.refresh();
    } finally {
      setLoading(false);
    }
  }

  return (
    <div>
      <div className="mb-8 flex items-center gap-2.5 lg:hidden">
        <span className="inline-flex h-9 w-9 items-center justify-center rounded-input bg-iris text-white">
          <Sparkles className="h-5 w-5" />
        </span>
        <span className="font-display text-[18px] font-bold">{APP_NAME}</span>
      </div>

      <h1 className="font-display text-[26px] font-bold text-ink">Tekrar hoş geldin</h1>
      <p className="mt-1.5 text-[13.5px] text-gravel">Devam etmek için giriş yap.</p>

      <form onSubmit={handleSubmit(onSubmit)} className="mt-7 space-y-4">
        <Field label="E-posta" htmlFor="email" error={errors.email?.message}>
          <Input id="email" type="email" placeholder="ornek@okul.com" autoComplete="email" {...register("email")} />
        </Field>
        <Field label="Şifre" htmlFor="password" error={errors.password?.message}>
          <Input id="password" type="password" placeholder="••••••••" autoComplete="current-password" {...register("password")} />
        </Field>
        <Button type="submit" size="lg" className="w-full" disabled={loading}>
          {loading ? <Spinner className="text-white" /> : "Giriş yap"}
        </Button>
      </form>

      <p className="mt-6 text-center text-[13px] text-gravel">
        Hesabın yok mu?{" "}
        <Link href="/kayit" className="font-semibold text-iris hover:underline">
          Kayıt ol
        </Link>
      </p>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={<div className="flex justify-center py-10"><Spinner /></div>}>
      <LoginForm />
    </Suspense>
  );
}
