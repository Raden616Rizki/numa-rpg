import { useEffect, useRef } from 'react'
import { createPhaserGame } from './game/PhaserGame'

function App() {
  const containerRef = useRef(null)

  useEffect(() => {
    const game = createPhaserGame('game-container')
    return () => game.destroy(true)
  }, [])

  return (
    <div id="game-container" ref={containerRef} style={{ width: '100vw', height: '100vh' }} />
  )
}

export default App