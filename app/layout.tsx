import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'Werewolves Game',
  description: 'A multiplayer Werewolves and Villagers game',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className="antialiased">{children}</body>
    </html>
  )
}
