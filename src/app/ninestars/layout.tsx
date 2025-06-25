import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Nine Stars - 九星',
  description: 'Welcome to the Nine Stars page. This is a beautiful and modern page design.',
};

export default function NinestarsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
} 