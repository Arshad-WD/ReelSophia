import { SignUp } from "@clerk/nextjs";

export default function SignUpPage() {
  return (
    <div className="flex items-center justify-center min-h-screen px-4">
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold tracking-tight mb-2">
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-accent">
              ReelSophia
            </span>
          </h1>
          <p className="text-sm text-muted-foreground">
            Create your knowledge vault
          </p>
        </div>
        <SignUp
          appearance={{
            elements: {
              rootBox: "w-full",
              cardBox: "w-full shadow-none",
              card: "glass-card !rounded-2xl !shadow-none w-full",
            },
          }}
        />
      </div>
    </div>
  );
}
