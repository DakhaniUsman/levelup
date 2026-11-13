import RegisterForm from "@/features/auth/components/RegisterForm";

export const metadata = {
  title: "Awaken Profile | LEVEL UP",
  description: "Register your hunter profile into the LEVEL UP system",
};

export default function RegisterPage() {
  return (
    <div className="min-h-screen flex items-center justify-center p-6 bg-[#090A0F] relative">
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-[#8A2BE2]/5 rounded-full blur-[130px] pointer-events-none" />
      <div className="relative z-10 w-full">
        <RegisterForm />
      </div>
    </div>
  );
}

