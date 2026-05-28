import { useEffect, useRef, useState } from 'react'
import { createPhaserGame } from './game/PhaserGame'
import { on, off } from './game/EventBus'
import HUD from './components/HUD'

function App() {
  const containerRef = useRef(null)
  const [player, setPlayer] = useState({
    name: 'Hero',
    hp: 100,
    maxHp: 100,
    mp: 50,
    maxMp: 50,
    level: 1,
    gold: 0,
  })

  useEffect(() => {
    const game = createPhaserGame('game-container')

    const onPlayerMoved = (data) => {
      console.log('player moved to', data.col, data.row)
    }

    const onEncounter = (data) => {
      console.log('encounter!', data.monster)
    }

    on('player:moved', onPlayerMoved)
    on('encounter:start', onEncounter)

    return () => {
      off('player:moved', onPlayerMoved)
      off('encounter:start', onEncounter)
      game.destroy(true)
    }
  }, [])

  return (
    <div style={{ position: 'relative', width: '100vw', height: '100vh' }}>
      <div id="game-container" ref={containerRef} style={{ width: '100%', height: '100%' }} />
      <HUD player={player} />
    </div>
  )
}

export default App