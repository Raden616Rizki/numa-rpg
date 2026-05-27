import { useEffect, useRef } from 'react'
import { createPhaserGame } from './game/PhaserGame'

function App() {
  const containerRef = useRef(null)

  useEffect(() => {
    const game = createPhaserGame('game-container')

    return () => {
      game.destroy(true)
    }
  }, [])

  return (
    <div>
      <h1>RPG Game</h1>
      <div id="game-container" ref={containerRef}></div>
    </div>
  )
}

export default App