import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "The Urban Hive Project: 2026 Annual Report",
  description: "Cultivating rooftop sanctuaries and connected pollinator corridors across London.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="en"
      className="scroll-smooth bg-[#FBF9F5] text-[#243324] antialiased selection:bg-[#E8DCC4] selection:text-[#1F2B1D]"
    >
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Fraunces:ital,opsz,wght@0,9..144,300..800;1,9..144,300..700&family=Newsreader:ital,opsz,wght@0,6..72,300..700;1,6..72,300..700&family=Plus+Jakarta+Sans:ital,wght@0,300..800;1,300..700&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="bg-[#FBF9F5] text-[#243324] overflow-x-hidden min-h-screen">
        {children}
      </body>
    </html>
  );
}
