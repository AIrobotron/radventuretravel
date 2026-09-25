import "./styles.css";

export const metadata = {
  title: "Telco AI Operations",
  description: "Autonomous Assurance Lab",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
