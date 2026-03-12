import { LoginForm } from "@/components/auth/login-form";

export default function SignInPage() {
  return (
    <div className="min-h-screen bg-background text-foreground px-6 py-12 flex flex-col items-center justify-center animate-in fade-in duration-1000">
      <div className="w-full max-w-sm relative z-10">
        <header className="text-center mb-10">
          <div className="flex items-center justify-center gap-3 mb-4">
            <div className="h-px w-8 bg-primary/30" />
            <span className="text-[10px] font-bold tracking-[0.4em] uppercase text-primary/60">Signature Series</span>
            <div className="h-px w-8 bg-primary/30" />
          </div>
          <h1 className="text-4xl font-heading mb-2 text-foreground">
            Reel<span className="text-primary italic font-normal">Sophia</span>
          </h1>
          <p className="text-sm text-muted-foreground/40 italic font-sans px-4">
            Security Gateway
          </p>
        </header>

        <div className="velvet-card p-6 shadow-2xl overflow-hidden bg-card/80 border border-white/5">
          <div className="text-white text-center mb-6 font-bold uppercase tracking-widest text-[10px] opacity-40">Identify Yourself</div>
          <LoginForm />
        </div>
      </div>

      {/* Background Ambience */}
      <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
        <div className="absolute top-1/4 -right-1/4 w-[600px] h-[600px] bg-primary/20 blur-[120px] rounded-full animate-breath-glow" />
        <div className="absolute bottom-1/4 -left-1/4 w-[600px] h-[600px] bg-accent/10 blur-[120px] rounded-full animate-breath-glow" style={{ animationDelay: "-2s" }} />
      </div>
    </div>
  );
}
