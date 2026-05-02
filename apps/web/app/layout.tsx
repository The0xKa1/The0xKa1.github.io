import type { Metadata } from "next";
import "./globals.css";
import "katex/dist/katex.min.css";
import "highlight.js/styles/github.css";

export const metadata: Metadata = {
  title: {
    default: "ka1的笔记本",
    template: "%s | ka1的笔记本",
  },
  description: "人生苦短，纵情燃烧 - 个人笔记与博客",
  metadataBase: new URL("https://note.the0xka1.cc"),
  openGraph: {
    siteName: "ka1的笔记本",
    locale: "zh_CN",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="zh-CN" suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://cdn.jsdelivr.net" />
        <link
          rel="stylesheet"
          href="https://cdn.jsdelivr.net/npm/lxgw-wenkai-screen-webfont@1.1.0/style.css"
        />
        <link
          rel="stylesheet"
          href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.1/css/all.min.css"
        />
        <script id="theme-init"
          dangerouslySetInnerHTML={{
            __html: `const t=localStorage.getItem('theme')||'light';document.documentElement.setAttribute('data-theme',t);`,
          }}
        />
      </head>
      <body className="min-h-screen antialiased">{children}</body>
    </html>
  );
}
