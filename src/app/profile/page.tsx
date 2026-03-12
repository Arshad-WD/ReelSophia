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
    initialKey = dbUser?.openRouterKey ? "sk-or-v1-****************" : "";
  }

  return (
    <div className="pt-8 lg:pt-12 pb-32 px-5 lg:px-10 max-w-2xl mx-auto min-h-screen">
      {/* Header */}
      <header className="mb-10">
        <h1 className="text-3xl font-bold text-foreground tracking-tight mb-1">
          Profile
        </h1>
        <p className="text-sm text-muted-foreground">
          Manage your account and API settings
        </p>
      </header>

      <UserProfile
        appearance={{
          elements: {
            rootBox: "w-full",
            cardBox: "w-full shadow-none",
            card: "velvet-card !rounded-2xl !shadow-none w-full !bg-card/80 border-border/50",
            navbar: "hidden",
            headerTitle: "font-heading font-bold text-foreground text-xl",
            headerSubtitle: "text-muted-foreground text-sm",
            profileSectionTitleText: "text-xs font-semibold text-primary uppercase tracking-wider",
            userPreviewMainIdentifier: "font-semibold text-foreground",
            userPreviewSecondaryIdentifier: "text-muted-foreground text-sm",
            formButtonPrimary: "btn-primary !rounded-xl !py-3",
            formFieldLabel: "text-xs text-muted-foreground font-medium uppercase tracking-wider",
            formFieldInput: "bg-white/[0.03] border-border/30 focus:border-primary/40 rounded-xl text-foreground",
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
