import {ClerkProvider} from "@clerk/nextjs";
import type { Metadata } from "next";
import { Cormorant_Garamond, Inter, JetBrains_Mono } from "next/font/google";
import { ConvexClientProvider } from "@/components/convex-client-provider";
import { ThemeProvider } from "@/components/theme-provider";
import "./globals.css";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

const cormorant = Cormorant_Garamond({
  variable: "--font-cormorant",
  subsets: ["latin"],
  weight: ["400", "500", "600"],
});

const jetbrains = JetBrains_Mono({
  variable: "--font-jetbrains",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Codeium",
  description: "AI code review for your GitHub repos",
};

const clerkAppearance = {
  elements: {
    rootBox: "w-full",
    card: "bg-card border border-border shadow-sm",
    headerTitle: "text-foreground font-medium",
    headerSubtitle: "text-muted-foreground",
    socialButtonsBlockButton: "border-border bg-background hover:bg-accent text-foreground",
    socialButtonsBlockButtonText: "text-foreground",
    dividerLine: "bg-border",
    dividerText: "text-muted-foreground",
    formFieldLabel: "text-muted-foreground",
    formFieldInput: "bg-background border-border text-foreground placeholder:text-muted-foreground/50",
    formButtonPrimary: "bg-primary hover:bg-[#a9583e] text-primary-foreground",
    footerActionLink: "text-primary hover:text-primary/80",
    identityPreviewEditButton: "text-primary",
    modalCloseButton: "text-muted-foreground hover:text-foreground",
    overlay: "bg-black/40",
  },
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      suppressHydrationWarning
      className={`${inter.variable} ${cormorant.variable} ${jetbrains.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">
        <script
          // Apply saved theme before first paint to avoid flash
          dangerouslySetInnerHTML={{
            __html: `(function(){try{var t=localStorage.getItem("codeium-theme")||"system";var d=t==="dark"||(t==="system"&&window.matchMedia("(prefers-color-scheme: dark)").matches);document.documentElement.classList.toggle("dark",d);}catch(e){}})();`,
          }}
        />
        <ClerkProvider appearance={clerkAppearance}>
          <ThemeProvider>
            <ConvexClientProvider>{children}</ConvexClientProvider>
          </ThemeProvider>
        </ClerkProvider>
      </body>
    </html>
  );
}