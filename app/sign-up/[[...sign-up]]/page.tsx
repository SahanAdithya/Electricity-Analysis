import { SignUp } from "@clerk/nextjs";

export default function SignUpPage() {
  return (
    <div className="min-h-screen bg-zinc-50 flex flex-col items-center justify-center p-6">
      <div className="mb-12 text-center space-y-2">
        <h1 className="text-4xl font-black tracking-tighter text-green-500 uppercase">Join Us</h1>
        <p className="text-zinc-500 font-bold uppercase tracking-widest text-[10px]">Create an account to start tracking</p>
      </div>
      
      <div className="w-full max-w-md">
        <SignUp 
          appearance={{
            elements: {
              rootBox: "w-full",
              card: "bg-white shadow-[0_20px_50px_rgba(0,0,0,0.1)] border border-zinc-200 rounded-[32px] p-8",
              headerTitle: "text-2xl font-black text-zinc-900 tracking-tight text-center mb-1",
              headerSubtitle: "text-zinc-500 text-xs text-center font-medium mb-8",
              socialButtonsBlockButton: "border border-zinc-200 rounded-xl hover:bg-zinc-50 transition-all py-3 font-bold text-zinc-700",
              socialButtonsBlockButtonText: "text-zinc-700 font-bold",
              dividerRow: "my-8",
              dividerLine: "bg-zinc-200",
              dividerText: "text-zinc-400 text-[10px] font-black uppercase tracking-widest",
              formFieldLabel: "text-[10px] font-black uppercase tracking-widest text-zinc-500 mb-2",
              formFieldInput: "bg-zinc-50 border border-zinc-200 rounded-xl py-3 px-4 focus:ring-2 focus:ring-green-500/20 focus:border-green-500 transition-all",
              formButtonPrimary: "bg-green-500 hover:bg-green-600 text-white rounded-xl py-4 font-black uppercase tracking-widest text-xs shadow-lg shadow-green-500/20 transition-all",
              footerActionText: "text-zinc-500 font-medium",
              footerActionLink: "text-green-500 font-black hover:text-green-600 transition-colors",
            },
            layout: {
              socialButtonsPlacement: "top",
              showOptionalFields: false,
            },
            variables: {
              colorPrimary: "#22c55e", // Tailwind green-500
            }
          }}
          signInUrl="/sign-in"
        />
      </div>

      <div className="mt-12 flex flex-col items-center gap-4">
        <div className="h-px w-32 bg-zinc-200"></div>
        <p className="text-[10px] font-black uppercase tracking-widest text-zinc-400 flex items-center gap-2">
          Secured by <span className="text-zinc-600">Clerk</span>
        </p>
      </div>
    </div>
  );
}
