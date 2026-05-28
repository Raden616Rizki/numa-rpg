import { useEffect, useRef, useState } from 'react'
import { createPhaserGame } from './game/PhaserGame'
import { on, off, emit } from './game/EventBus'
import HUD from './components/HUD'
import BattleScreen from './components/BattleScreen'
import { STARTING_ITEMS } from './game/data/items'

function App() {
  const containerRef = useRef(null)
  const [player, setPlayer] = useState({
    name: 'Hero',
    hp: 100,
    maxHp: 100,
    mp: 50,
    maxMp: 50,
    atk: 12,
    def: 5,
    level: 1,
    gold: 0,
  })
  const [inventory, setInventory] = useState(STARTING_ITEMS)
  const [battle, setBattle] = useState(null)

  useEffect(() => {
    const game = createPhaserGame('game-container')

    const onEncounter = (data) => setBattle(data.monster)

    on('encounter:start', onEncounter)
    return () => {
      off('encounter:start', onEncounter)
      game.destroy(true)
    }
  }, [])

  function handleInventoryChange(itemId, delta) {
    setInventory(prev => prev.map(slot =>
      slot.itemId === itemId
        ? { ...slot, quantity: slot.quantity + delta }
        : slot
    ))
  }

  function handleBattleEnd(result) {
    setPlayer(prev => ({
      ...prev,
      hp: result.finalHp ?? prev.hp,
      mp: result.finalMp ?? prev.mp,
      gold: result.won ? prev.gold + result.gold : prev.gold,
    }))
    setBattle(null)
    emit('battle:end', {})
  }

  return (
    <div style={{ position: 'relative', width: '100vw', height: '100vh' }}>
      <div id="game-container" ref={containerRef} style={{ width: '100%', height: '100%' }} />
      <HUD player={player} />
      {battle && (
        <BattleScreen
          monster={battle}
          player={player}
          inventory={inventory}
          onBattleEnd={handleBattleEnd}
          onInventoryChange={handleInventoryChange}
        />
      )}
    </div>
  )
}

export default App