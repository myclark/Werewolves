import Link from 'next/link'

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-24">
      <div className="z-10 max-w-5xl w-full items-center justify-center font-mono text-sm">
        <h1 className="text-6xl font-bold text-center mb-8">
          Werewolves Game
        </h1>
        <p className="text-xl text-center mb-8">
          A multiplayer social deduction game
        </p>
        <div className="flex gap-4 items-center justify-center">
          <Link
            href="/login"
            className="rounded-lg bg-blue-600 px-6 py-3 text-white hover:bg-blue-700 transition"
          >
            Play Now
          </Link>
        </div>
      </div>
    </main>
  )
}
