import { useEffect, useRef, useState } from 'react'
import { createPhaserGame } from './game/PhaserGame'
import { on, off, emit } from './game/EventBus'
import HUD from './components/HUD'
import BattleScreen from './components/BattleScreen'
import LevelUpScreen from './components/LevelUpScreen'
import NPCDialog from './components/NPCDialog'
import QuestLog from './components/QuestLog'
import { STARTING_ITEMS } from './game/data/items'
import { expToNextLevel, calcLevelUpStats } from './game/systems/BattleSystem'
import { SPELLS } from './game/data/spells'
import { generateQuest } from './game/data/quests'

function App() {
  const containerRef = useRef(null)
  const [player, setPlayer] = useState({
    name: 'Hero',
    hp: 100, maxHp: 100,
    mp: 50, maxMp: 50,
    atk: 12, def: 5,
    level: 1, exp: 0, gold: 0,
  })
  const [inventory, setInventory] = useState(STARTING_ITEMS)
  const [battle, setBattle] = useState(null)
  const [levelUp, setLevelUp] = useState(null)
  const [activeNPC, setActiveNPC] = useState(null)
  const [activeQuest, setActiveQuest] = useState(null)
  const [quests, setQuests] = useState([])
  const playerRef = useRef(player)

  useEffect(() => {
    playerRef.current = player
  }, [player])

  useEffect(() => {
    const game = createPhaserGame('game-container')

    const onEncounter = (data) => setBattle(data.monster)

    const onNPCInteract = (data) => {
      const quest = generateQuest(playerRef.current.level)
      setActiveQuest(quest)
      setActiveNPC(data.npc)
    }

    on('encounter:start', onEncounter)
    on('npc:interact', onNPCInteract)

    return () => {
      off('encounter:start', onEncounter)
      off('npc:interact', onNPCInteract)
      game.destroy(true)
    }
  }, [])

  function handleAcceptQuest() {
    if (!activeQuest || !activeNPC) return
    setQuests(prev => [...prev, activeQuest])
    emit('npc:quest_accepted', { npcId: activeNPC.id })
    setActiveNPC(null)
    setActiveQuest(null)
  }

  function handleDeclineQuest() {
    setActiveNPC(null)
    setActiveQuest(null)
  }

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

      // update quest progress
      if (result.won && result.monsterName) {
        setQuests(qs => qs.map(q =>
          q.target === result.monsterName && !q.completed
            ? {
              ...q, progress: Math.min(q.progress + 1, q.targetCount),
              completed: q.progress + 1 >= q.targetCount
            }
            : q
        ))
      }

      if (result.won && newExp >= needed) {
        const gains = calcLevelUpStats(prev.level + 1)
        const newLevel = prev.level + 1
        const newSpell = SPELLS.find(s => s.unlocksAtLevel === newLevel)
        if (newSpell) gains.newSpell = newSpell.name
        setLevelUp({ gains, newLevel })
        return {
          ...prev,
          level: newLevel, exp: newExp - needed,
          hp: newHp + gains.hp, maxHp: prev.maxHp + gains.hp,
          mp: newMp + gains.mp, maxMp: prev.maxMp + gains.mp,
          atk: prev.atk + gains.atk, def: prev.def + gains.def,
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
      <QuestLog quests={quests} />
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
      {activeNPC && !battle && (
        <NPCDialog
          npc={activeNPC}
          quest={activeQuest}
          onAcceptQuest={handleAcceptQuest}
          onDecline={handleDeclineQuest}
        />
      )}
    </div>
  )
}

export default App