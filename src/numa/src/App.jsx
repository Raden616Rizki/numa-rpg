import { useEffect, useRef, useState } from 'react'
import { createPhaserGame } from './game/PhaserGame'
import { on, off, emit } from './game/EventBus'
import HUD from './components/HUD'
import BattleScreen from './components/BattleScreen'
import LevelUpScreen from './components/LevelUpScreen'
import NPCDialog from './components/NPCDialog'
import QuestLog from './components/QuestLog'
import NPCOverlay from './components/NPCOverlay'
import ShopScreen from './components/ShopScreen'
import SaveLoadScreen from './components/SaveLoadScreen'
import MainMenu from './components/MainMenu'
import { STARTING_ITEMS } from './game/data/items'
import { expToNextLevel, calcLevelUpStats } from './game/systems/BattleSystem'
import { SPELLS } from './game/data/spells'
import { generateQuest } from './game/data/quests'
import { saveGame, loadGame, deleteSave, hasSave } from './game/systems/SaveSystem'
import ItemSpellMenu from './components/ItemSpellMenu'
import Toast from './components/Toast'
import ConfirmModal from './components/ConfirmModal'
import { FaBoxOpen } from 'react-icons/fa'
import { DEFAULT_EQUIPMENT, calcEquipmentStats, EQUIPMENT } from './game/data/equipment'
import EquipmentScreen from './components/EquipmentScreen'
import { GiBroadsword } from "react-icons/gi";

const DEFAULT_PLAYER = {
  name: 'Hero',
  hp: 100, maxHp: 100,
  mp: 50, maxMp: 50,
  atk: 12, def: 5,
  level: 1, exp: 0, gold: 0,
}

function App() {
  const containerRef = useRef(null)
  const [gameStarted, setGameStarted] = useState(false)
  const [player, setPlayer] = useState(DEFAULT_PLAYER)
  const [inventory, setInventory] = useState(STARTING_ITEMS)
  const [quests, setQuests] = useState([])
  const [battle, setBattle] = useState(null)
  const [levelUp, setLevelUp] = useState(null)
  const [activeNPC, setActiveNPC] = useState(null)
  const [activeQuest, setActiveQuest] = useState(null)
  const [shop, setShop] = useState(false)
  const [showSaveLoad, setShowSaveLoad] = useState(false)
  const [savedAt, setSavedAt] = useState(loadGame()?.savedAt ?? null)
  const [position, setPosition] = useState({ tileX: 0, tileY: 0 })
  const [toast, setToast] = useState(null)
  const [confirmDelete, setConfirmDelete] = useState(false)
  const [showItemMenu, setShowItemMenu] = useState(false)
  const [equipped, setEquipped] = useState(DEFAULT_EQUIPMENT)
  const [equipmentInventory, setEquipmentInventory] = useState([])
  const [showEquipment, setShowEquipment] = useState(false)

  const playerRef = useRef(player)
  const inventoryRef = useRef(inventory)
  const questsRef = useRef(quests)
  const positionRef = useRef(position)

  useEffect(() => { playerRef.current = player }, [player])
  useEffect(() => { inventoryRef.current = inventory }, [inventory])
  useEffect(() => { questsRef.current = quests }, [quests])
  useEffect(() => { positionRef.current = position }, [position])

  useEffect(() => {
    if (!gameStarted) return

    const game = createPhaserGame('game-container')

    const onEncounter = (data) => setBattle(data.monster)
    const onNPCInteract = (data) => {
      if (data.npc.isMerchant) {
        setActiveNPC(data.npc)
        setShop(false)
      } else {
        setActiveQuest(generateQuest(playerRef.current.level))
        setActiveNPC(data.npc)
      }
    }
    const onPosition = (data) => setPosition(data)

    on('encounter:start', onEncounter)
    on('npc:interact', onNPCInteract)
    on('player:position', onPosition)

    return () => {
      off('encounter:start', onEncounter)
      off('npc:interact', onNPCInteract)
      off('player:position', onPosition)
      game.destroy(true)
    }
  }, [gameStarted])

  function showToast(message, type = 'success') {
    setToast({ message, type })
  }

  function handleSave() {
    const timestamp = new Date().toISOString()
    saveGame({
      player: playerRef.current,
      inventory: inventoryRef.current,
      quests: questsRef.current,
      position: positionRef.current,
      equipped,
      equipmentInventory,
      savedAt: timestamp,
    })
    setSavedAt(timestamp)
    setShowSaveLoad(false)
    showToast('Game berhasil disimpan!')
  }

  function handleLoad() {
    const save = loadGame()
    if (!save) return
    setPlayer(save.player)
    setInventory(save.inventory)
    setQuests(save.quests ?? [])
    setPosition(save.position)
    setSavedAt(save.savedAt)
    setShowSaveLoad(false)
    showToast('Game berhasil di-load!', 'info')

    setGameStarted(false)
    setTimeout(() => setGameStarted(true), 100)
  }

  function handleDeleteSave() {
    deleteSave()
    setSavedAt(null)
    setShowSaveLoad(false)
    setConfirmDelete(false)
    showToast('Save file dihapus.', 'error')
  }

  function handleUseItemOutside(itemId, result) {
    setPlayer(prev => ({ ...prev, hp: result.hp, mp: result.mp }))
    setInventory(prev => prev.map(s =>
      s.itemId === itemId ? { ...s, quantity: s.quantity - 1 } : s
    ))
    showToast(result.message, 'success')
  }

  function handleUseSpellOutside(spell, healAmt) {
    setPlayer(prev => ({
      ...prev,
      hp: Math.min(prev.maxHp, prev.hp + healAmt),
      mp: prev.mp - spell.mpCost,
    }))
    showToast(`${spell.name}! Pulih ${healAmt} HP!`, 'success')
  }

  function handleNewGame() {
    setPlayer(DEFAULT_PLAYER)
    setInventory(STARTING_ITEMS)
    setQuests([])
    setGameStarted(true)
  }

  function handleContinue() {
    const save = loadGame()
    if (!save) return
    setPlayer(save.player)
    setInventory(save.inventory)
    setQuests(save.quests ?? [])
    setPosition(save.position)
    setEquipped(save.equipped ?? DEFAULT_EQUIPMENT)
    setEquipmentInventory(save.equipmentInventory ?? [])
    setGameStarted(true)
  }

  function handleAcceptShop() {
    setShop(true)
    setActiveNPC(null)
  }

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
    setShop(false)
  }

  function handleBuy(itemId, price) {
    setPlayer(prev => ({ ...prev, gold: prev.gold - price }))
    setInventory(prev => {
      const existing = prev.find(s => s.itemId === itemId)
      if (existing) {
        return prev.map(s => s.itemId === itemId
          ? { ...s, quantity: s.quantity + 1 } : s)
      }
      return [...prev, { itemId, quantity: 1 }]
    })
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

      if (result.won && result.monsterName) {
        setQuests(qs => qs.map(q =>
          q.target === result.monsterName && !q.completed
            ? {
              ...q,
              progress: Math.min(q.progress + 1, q.targetCount),
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

  function getEffectivePlayer() {
    const bonuses = calcEquipmentStats(equipped)
    return {
      ...player,
      atk: player.atk + (bonuses.atk ?? 0),
      def: player.def + (bonuses.def ?? 0),
      maxHp: player.maxHp + (bonuses.hp ?? 0),
      maxMp: player.maxMp + (bonuses.mp ?? 0),
    }
  }

  function handleEquip(slot, itemId) {
    setEquipped(prev => ({ ...prev, [slot]: itemId }))
  }

  function handleUnequip(slot) {
    setEquipped(prev => ({ ...prev, [slot]: null }))
  }

  function handleBuyEquipment(itemId, price) {
    setPlayer(prev => ({ ...prev, gold: prev.gold - price }))
    setEquipmentInventory(prev => [...prev, itemId])
  }

  if (!gameStarted) {
    return (
      <MainMenu
        hasSave={hasSave()}
        onNewGame={handleNewGame}
        onContinue={handleContinue}
      />
    )
  }

  return (
    <div style={{ position: 'relative', width: '100vw', height: '100vh' }}>
      <div id="game-container" ref={containerRef} style={{ width: '100%', height: '100%' }} />

      <HUD player={getEffectivePlayer()} expToNextLevel={expToNextLevel} />
      <NPCOverlay />
      <QuestLog quests={quests} />

      {/* Tombol save */}
      <button onClick={() => setShowSaveLoad(true)} style={{
        position: 'absolute', top: 50, left: 12,
        background: 'rgba(0,0,0,0.6)', border: '1px solid #444',
        borderRadius: 4, padding: '6px 10px',
        color: '#aaa', cursor: 'pointer',
        fontSize: 11, zIndex: 50,
        fontFamily: 'Courier New',
      }}>
        Save / Load
      </button>

      {battle && (
        <BattleScreen
          monster={battle} player={getEffectivePlayer()} inventory={inventory}
          onBattleEnd={handleBattleEnd} onInventoryChange={handleInventoryChange}
        />
      )}
      {levelUp && !battle && (
        <LevelUpScreen
          gains={levelUp.gains} newLevel={levelUp.newLevel}
          onClose={() => setLevelUp(null)}
        />
      )}
      {activeNPC && !battle && !shop && (
        <NPCDialog
          npc={activeNPC} quest={activeQuest}
          onAcceptQuest={activeNPC.isMerchant ? handleAcceptShop : handleAcceptQuest}
          onDecline={handleDeclineQuest}
        />
      )}
      {shop && !battle && (
        <ShopScreen
          playerGold={player.gold}
          inventory={inventory}
          equipmentInventory={equipmentInventory}
          onBuy={handleBuy}
          onBuyEquipment={handleBuyEquipment}
          onClose={() => setShop(false)}
        />
      )}
      {showSaveLoad && (
        <SaveLoadScreen
          hasSave={hasSave()} savedAt={savedAt}
          onSave={handleSave} onLoad={handleLoad}
          onDelete={() => { setShowSaveLoad(false); setConfirmDelete(true) }}
          onClose={() => setShowSaveLoad(false)}
        />
      )}
      {!battle && (
        <button onClick={() => setShowItemMenu(true)} style={{
          position: 'absolute', top: 50, left: 110,
          background: 'rgba(0,0,0,0.6)', border: '1px solid #444',
          borderRadius: 4, padding: '6px 10px',
          color: '#aaa', cursor: 'pointer',
          fontSize: 11, zIndex: 50,
          fontFamily: 'Courier New',
          display: 'flex', alignItems: 'center', gap: 6,
        }}>
          <FaBoxOpen size={11} /> Item/Sihir
        </button>
      )}
      {!battle && (
        <button onClick={() => setShowEquipment(true)} style={{
          position: 'absolute', top: 50, left: 210,
          background: 'rgba(0,0,0,0.6)', border: '1px solid #444',
          borderRadius: 4, padding: '6px 10px',
          color: '#aaa', cursor: 'pointer',
          fontSize: 11, zIndex: 50,
          fontFamily: 'Courier New',
          display: 'flex', alignItems: 'center', gap: 6,
        }}>
          <GiBroadsword size={11} /> Equipment
        </button>
      )}

      {showEquipment && !battle && (
        <EquipmentScreen
          equipped={equipped}
          equipmentInventory={equipmentInventory}
          basePlayer={player}
          onEquip={handleEquip}
          onUnequip={handleUnequip}
          onClose={() => setShowEquipment(false)}
        />
      )}
      {showItemMenu && !battle && (
        <ItemSpellMenu
          player={getEffectivePlayer()}
          inventory={inventory}
          onUseItem={handleUseItemOutside}
          onUseSpell={handleUseSpellOutside}
          onClose={() => setShowItemMenu(false)}
        />
      )}
      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast(null)}
        />
      )}
      {confirmDelete && (
        <ConfirmModal
          message="Yakin ingin menghapus save file? Progress tidak bisa dikembalikan."
          onConfirm={handleDeleteSave}
          onCancel={() => setConfirmDelete(false)}
        />
      )}
    </div>
  )
}

export default App