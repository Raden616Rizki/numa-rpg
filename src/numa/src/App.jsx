import { useEffect, useRef, useState } from 'react'
import { createPhaserGame } from './game/PhaserGame'
import { on, off, emit } from './game/EventBus'
import HUD from './components/HUD'
import BattleScreen from './components/BattleScreen'
import LevelUpScreen from './components/LevelUpScreen'
import { STARTING_ITEMS } from './game/data/items'
import { expToNextLevel, calcLevelUpStats } from './game/systems/BattleSystem'
import { SPELLS } from './game/data/spells'

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
    exp: 0,
    gold: 0,
  })
  const [inventory, setInventory] = useState(STARTING_ITEMS)
  const [battle, setBattle] = useState(null)
  const [levelUp, setLevelUp] = useState(null)

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
    setBattle(null)
    emit('battle:end', {})

    setPlayer(prev => {
      const newHp = result.finalHp ?? prev.hp
      const newMp = result.finalMp ?? prev.mp
      const newGold = result.won ? prev.gold + result.gold : prev.gold
      const newExp = result.won ? prev.exp + result.exp : prev.exp

      const needed = expToNextLevel(prev.level)

      if (result.won && newExp >= needed) {
        const gains = calcLevelUpStats(prev.level + 1)
        const newLevel = prev.level + 1

        // cek apakah ada sihir baru di level ini
        const newSpell = SPELLS.find(s => s.unlocksAtLevel === newLevel)
        if (newSpell) gains.newSpell = newSpell.name

        setLevelUp({ gains, newLevel })

        return {
          ...prev,
          level: newLevel,
          exp: newExp - needed,
          hp: newHp + gains.hp,
          maxHp: prev.maxHp + gains.hp,
          mp: newMp + gains.mp,
          maxMp: prev.maxMp + gains.mp,
          atk: prev.atk + gains.atk,
          def: prev.def + gains.def,
          gold: newGold,
        }
      }

      return { ...prev, hp: newHp, mp: newMp, gold: newGold, exp: newExp }
    })
  }

  return (
    <div style={{ position: 'relative', width: '100vw', height: '100vh' }}>
      <div id="game-container" ref={containerRef} style={{ width: '100%', height: '100%' }} />
      <HUD player={player} expToNextLevel={expToNextLevel} />
      {battle && (
        <BattleScreen
          monster={battle}
          player={player}
          inventory={inventory}
          onBattleEnd={handleBattleEnd}
          onInventoryChange={handleInventoryChange}
        />
      )}
      {levelUp && !battle && (
        <LevelUpScreen
          gains={levelUp.gains}
          newLevel={levelUp.newLevel}
          onClose={() => setLevelUp(null)}
        />
      )}
    </div>
  )
}

export default App