import { Bricolage_Grotesque } from 'next/font/google';
import './globals.css';

const bricolageFont = Bricolage_Grotesque({
  variable: '--font-bricolage',
  weight: ['400', '600', '700'],
  subsets: ['latin'],
});

export const metadata = {
  title: 'PDFlux',
  description: 'Document Signer & Annotation Tool',
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className={`${bricolageFont.variable} antialiased`}>
        {children}
      </body>
    </html>
  );
}
