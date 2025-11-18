import { GamePageContent } from './GamePageContent'

export default async function GamePage({
  params,
}: {
  params: Promise<{ gameId: string }>
}) {
  const { gameId } = await params
  return <GamePageContent gameId={gameId} />
}
