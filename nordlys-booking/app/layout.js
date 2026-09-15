import './globals.css';

export const metadata = {
  title: 'Nordlys Norsk — Book a Norwegian course',
  description: 'Norwegian courses — classroom, virtual, online, and private. Book and pay online.',
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
