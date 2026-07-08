import './globals.css';

export const metadata = {
  title: 'ForgeVision',
  description: 'Dalla tua mente alla realtà'
};

export default function RootLayout({ children }) {
  return (
    <html lang="it">
      <body>{children}</body>
    </html>
  );
}
