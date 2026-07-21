export const metadata = {
  title: 'TicketAI — Support Ticket Deflection Analyzer',
  description: 'AI-powered support ticket analysis',
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="true" />
        <link
          href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="antialiased bg-[#0B0F19] text-[#F8FAFC]">{children}</body>
    </html>
  );
}
