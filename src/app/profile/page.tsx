import { UserProfile } from "@clerk/nextjs";
import { currentUser } from "@clerk/nextjs/server";
import { db } from "@/lib/db";
import { ApiKeySettings } from "@/components/api-key-settings";

export default async function ProfilePage() {
  const user = await currentUser();
  let initialKey = "";

  if (user) {
    const dbUser = await db.user.findUnique({
        where: { id: user.id },
        select: { openRouterKey: true }
    });
    // Truncate to placeholder if it exists, or empty if it doesn't
    initialKey = dbUser?.openRouterKey ? "sk-or-v1-****************" : "";
  }

  return (
    <div className="px-5 pt-8 max-w-md mx-auto pb-24 min-h-screen">
      {/* Header */}
      <div className="mb-12">
        <h1 className="text-3xl font-sans font-extrabold tracking-tighter text-white italic underline decoration-primary/40 underline-offset-8 uppercase mb-3">
          Identity
        </h1>
        <p className="text-[10px] text-muted-foreground font-sans font-bold uppercase tracking-[0.3em]">
          ARCHIVIST PRIVILEGES & AUTHENTICATION
        </p>
      </div>
      
      <UserProfile
        appearance={{
          elements: {
            rootBox: "w-full",
            cardBox: "w-full shadow-none",
            card: "journal-card !rounded-2xl !shadow-none w-full !bg-black border-white/5",
            navbar: "hidden",
            headerTitle: "font-sans font-extrabold text-white uppercase italic",
            headerSubtitle: "font-sans font-bold text-[10px] uppercase tracking-[0.2em] text-muted-foreground/60",
            profileSectionTitleText: "font-sans font-extrabold text-[10px] uppercase tracking-[0.3em] text-primary/80",
            userPreviewMainIdentifier: "font-sans font-extrabold text-white",
            userPreviewSecondaryIdentifier: "font-sans text-muted-foreground/60",
            formButtonPrimary: "btn-journal-primary !rounded-full !py-4",
            formFieldLabel: "font-sans font-extrabold text-[9px] uppercase tracking-[0.2em] text-muted-foreground/40",
            formFieldInput: "editorial-input !rounded-full !bg-white/5 !border-white/5 focus:!border-primary/40",
          },
        }}
        routing="hash"
      />
      
      <div className="mt-8">
        <ApiKeySettings initialKey={initialKey} />
      </div>
    </div>
  );
}
