import LoginForm from "@/features/auth/components/LoginForm";

export const metadata = {
  title: "Hunter Login | LEVEL UP",
  description: "Authenticate to access your Hunter Operating System",
};

export default function LoginPage() {
  return (
    <div className="min-h-screen flex items-center justify-center p-6 bg-[#090A0F] relative">
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-[#00F0FF]/5 rounded-full blur-[130px] pointer-events-none" />
      <div className="relative z-10 w-full">
        <LoginForm />
      </div>
    </div>
  );
}

