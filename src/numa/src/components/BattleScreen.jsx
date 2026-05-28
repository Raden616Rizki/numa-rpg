import { useState } from 'react'
import { FaHeart } from 'react-icons/fa'
import { GiSwordClash, GiRun, GiSpellBook } from 'react-icons/gi'
import { FaBoxOpen } from 'react-icons/fa'
import { calcDamage, calcSpell, applyItem, getMonsterAction } from '../game/systems/BattleSystem'
import { getAvailableSpells } from '../game/data/spells'
import { ITEMS } from '../game/data/items'

export default function BattleScreen({ monster: initialMonster, player, inventory, onBattleEnd, onInventoryChange }) {
    const [monster, setMonster] = useState(initialMonster)
    const [playerHp, setPlayerHp] = useState(player.hp)
    const [playerMp, setPlayerMp] = useState(player.mp)
    const [log, setLog] = useState([`Seekor ${initialMonster.name} muncul!`])
    const [phase, setPhase] = useState('player_turn')
    const [menu, setMenu] = useState('main') // main | spells | items
    const [stunned, setStunned] = useState(false)

    const availableSpells = getAvailableSpells(player.level)

    function addLog(msg) {
        setLog(prev => [...prev, msg])
    }

    function endPlayerTurn() {
        setMenu('main')
    }

    function doMonsterTurn(currentHp) {
        setPhase('enemy_turn')
        setTimeout(() => {
            if (stunned) {
                addLog(`${monster.name} terkena stun, tidak bisa bergerak!`)
                setStunned(false)
                setPhase('player_turn')
                return
            }

            const action = getMonsterAction(monster)
            addLog(action.message)

            if (action.type === 'attack' || action.type === 'power_attack') {
                const atkMult = action.type === 'power_attack' ? 1.5 : 1
                const { damage } = calcDamage(Math.floor(monster.atk * atkMult), player.def)
                addLog(`Kamu menerima ${damage} damage!`)
                const newHp = currentHp - damage

                if (newHp <= 0) {
                    addLog('Kamu kalah...')
                    setPlayerHp(0)
                    setPhase('ended')
                    setTimeout(() => onBattleEnd({ won: false, finalHp: 0, finalMp: playerMp }), 1500)
                    return
                }

                setPlayerHp(newHp)
            }

            setPhase('player_turn')
        }, 900)
    }

    function handleAttack() {
        if (phase !== 'player_turn') return
        const { damage, isCrit } = calcDamage(player.atk, monster.def)
        addLog(isCrit
            ? `Serangan kritis! ${damage} damage!`
            : `Kamu menyerang untuk ${damage} damage!`
        )
        resolveMonsterHp(monster.hp - damage)
        endPlayerTurn()
    }

    function handleSpell(spell) {
        if (playerMp < spell.mpCost) {
            addLog('MP tidak cukup!')
            return
        }

        const result = calcSpell(spell, player.level)
        setPlayerMp(prev => prev - spell.mpCost)

        if (result.damage) {
            addLog(`${spell.name}! ${result.damage} damage!`)
            if (result.stun) addLog(`${monster.name} terkena stun!`)
            setStunned(result.stun ?? false)
            resolveMonsterHp(monster.hp - result.damage)
        } else if (result.heal) {
            const healed = Math.min(result.heal, player.maxHp - playerHp)
            setPlayerHp(prev => prev + healed)
            addLog(`${spell.name}! Pulih ${healed} HP!`)
            doMonsterTurn(playerHp + healed)
        }

        endPlayerTurn()
    }

    function handleItem(itemId) {
        const slot = inventory.find(s => s.itemId === itemId && s.quantity > 0)
        if (!slot) return

        const item = ITEMS[itemId]
        const result = applyItem(item, { hp: playerHp, mp: playerMp, maxHp: player.maxHp, maxMp: player.maxMp })

        addLog(result.message)
        setPlayerHp(result.hp)
        setPlayerMp(result.mp)

        onInventoryChange(itemId, -1)
        doMonsterTurn(result.hp)
        endPlayerTurn()
    }

    function handleRun() {
        if (phase !== 'player_turn') return
        const success = Math.random() < 0.5
        if (success) {
            addLog('Berhasil kabur!')
            setPhase('ended')
            setTimeout(() => onBattleEnd({ won: false, fled: true, finalHp: playerHp, finalMp: playerMp }), 1000)
        } else {
            addLog('Gagal kabur!')
            doMonsterTurn(playerHp)
        }
        endPlayerTurn()
    }

    function resolveMonsterHp(newHp) {
        if (newHp <= 0) {
            addLog(`${monster.name} dikalahkan!`)
            addLog(`+${monster.exp} EXP  +${monster.gold} Gold`)
            setMonster(prev => ({ ...prev, hp: 0 }))
            setPhase('ended')
            setTimeout(() => onBattleEnd({ won: true, exp: monster.exp, gold: monster.gold, finalHp: playerHp, finalMp: playerMp, monsterName: monster.name }), 1500)
        } else {
            setMonster(prev => ({ ...prev, hp: newHp }))
            doMonsterTurn(playerHp)
        }
    }

    const monsterHpPct = Math.max(0, monster.hp / monster.maxHp * 100)
    const playerHpPct = Math.max(0, playerHp / player.maxHp * 100)
    const playerMpPct = Math.max(0, playerMp / player.maxMp * 100)
    const isPlayerTurn = phase === 'player_turn'

    return (
        <div style={{
            position: 'absolute', inset: 0,
            background: 'rgba(0,0,0,0.85)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            zIndex: 100,
        }}>
            <div style={{
                background: '#111', border: '2px solid #333',
                borderRadius: 8, padding: 24,
                width: '90%', maxWidth: 420,
                display: 'flex', flexDirection: 'column', gap: 16,
            }}>

                {/* Monster status */}
                <div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
                        <span style={{ color: '#ff8888', fontSize: 15, fontWeight: 'bold' }}>{monster.name}</span>
                        <span style={{ color: '#888', fontSize: 12 }}>{Math.max(0, monster.hp)}/{monster.maxHp}</span>
                    </div>
                    <div style={{ height: 8, background: '#333', borderRadius: 4, overflow: 'hidden' }}>
                        <div style={{ width: `${monsterHpPct}%`, height: '100%', background: '#e05555', borderRadius: 4, transition: 'width 0.3s ease' }} />
                    </div>
                </div>

                {/* Battle log */}
                <div style={{
                    background: '#0a0a0a', border: '1px solid #222',
                    borderRadius: 4, padding: '8px 10px',
                    minHeight: 80, maxHeight: 120, overflowY: 'auto',
                    display: 'flex', flexDirection: 'column', gap: 3,
                }}>
                    {log.map((entry, i) => (
                        <span key={i} style={{
                            color: i === log.length - 1 ? '#fff' : '#555',
                            fontSize: 12, fontFamily: 'Courier New',
                        }}>
                            {entry}
                        </span>
                    ))}
                </div>

                {/* Player status */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                    <StatBar label="HP" value={playerHp} max={player.maxHp} pct={playerHpPct} color="#e05555" icon={<FaHeart color="#e05555" size={10} />} />
                    <StatBar label="MP" value={playerMp} max={player.maxMp} pct={playerMpPct} color="#4488dd" icon={<FaHeart color="#4488dd" size={10} />} />
                </div>

                {/* Main menu */}
                {menu === 'main' && (
                    <div style={{ display: 'flex', gap: 8 }}>
                        <ActionButton icon={<GiSwordClash size={15} />} label="Serang" onClick={handleAttack} disabled={!isPlayerTurn} color="#cc4444" />
                        <ActionButton icon={<GiSpellBook size={15} />} label="Sihir" onClick={() => setMenu('spells')} disabled={!isPlayerTurn || availableSpells.length === 0} color="#4455cc" />
                        <ActionButton icon={<FaBoxOpen size={15} />} label="Item" onClick={() => setMenu('items')} disabled={!isPlayerTurn} color="#448844" />
                        <ActionButton icon={<GiRun size={15} />} label="Kabur" onClick={handleRun} disabled={!isPlayerTurn} color="#555566" />
                    </div>
                )}

                {/* Spell menu */}
                {menu === 'spells' && (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                        <span style={{ color: '#888', fontSize: 11, marginBottom: 2 }}>Pilih sihir:</span>
                        {availableSpells.map(spell => (
                            <button key={spell.id} onClick={() => handleSpell(spell)} disabled={playerMp < spell.mpCost} style={{
                                padding: '8px 12px', background: playerMp < spell.mpCost ? '#1a1a1a' : '#1a1a3a',
                                border: '1px solid #334', borderRadius: 4,
                                color: playerMp < spell.mpCost ? '#444' : '#aabbff',
                                fontSize: 12, cursor: playerMp < spell.mpCost ? 'not-allowed' : 'pointer',
                                display: 'flex', justifyContent: 'space-between',
                            }}>
                                <span>{spell.name} — {spell.description}</span>
                                <span style={{ color: '#4488dd' }}>{spell.mpCost} MP</span>
                            </button>
                        ))}
                        <button onClick={() => setMenu('main')} style={{
                            padding: '6px', background: 'transparent',
                            border: '1px solid #333', borderRadius: 4,
                            color: '#666', fontSize: 11, cursor: 'pointer',
                        }}>
                            Kembali
                        </button>
                    </div>
                )}

                {/* Item menu */}
                {menu === 'items' && (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                        <span style={{ color: '#888', fontSize: 11, marginBottom: 2 }}>Pilih item:</span>
                        {inventory.filter(s => s.quantity > 0).length === 0 && (
                            <span style={{ color: '#555', fontSize: 12 }}>Tidak ada item.</span>
                        )}
                        {inventory.filter(s => s.quantity > 0).map(slot => {
                            const item = ITEMS[slot.itemId]
                            return (
                                <button key={slot.itemId} onClick={() => handleItem(slot.itemId)} style={{
                                    padding: '8px 12px', background: '#1a1a1a',
                                    border: '1px solid #333', borderRadius: 4,
                                    color: '#aaa', fontSize: 12, cursor: 'pointer',
                                    display: 'flex', justifyContent: 'space-between',
                                }}>
                                    <span>{item.name} — {item.description}</span>
                                    <span style={{ color: '#888' }}>x{slot.quantity}</span>
                                </button>
                            )
                        })}
                        <button onClick={() => setMenu('main')} style={{
                            padding: '6px', background: 'transparent',
                            border: '1px solid #333', borderRadius: 4,
                            color: '#666', fontSize: 11, cursor: 'pointer',
                        }}>
                            Kembali
                        </button>
                    </div>
                )}

            </div>
        </div>
    )
}

function StatBar({ label, value, max, pct, color, icon }) {
    return (
        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            {icon}
            <span style={{ color, fontSize: 10, width: 20 }}>{label}</span>
            <div style={{ flex: 1, height: 7, background: '#222', borderRadius: 3, overflow: 'hidden', border: '1px solid #333' }}>
                <div style={{ width: `${pct}%`, height: '100%', background: color, borderRadius: 3, transition: 'width 0.3s ease' }} />
            </div>
            <span style={{ color: '#777', fontSize: 10 }}>{value}/{max}</span>
        </div>
    )
}

function ActionButton({ icon, label, onClick, disabled, color }) {
    return (
        <button onClick={onClick} disabled={disabled} style={{
            flex: 1, padding: '9px 0',
            background: disabled ? '#1a1a1a' : color,
            border: `1px solid ${disabled ? '#333' : color}`,
            borderRadius: 4, color: disabled ? '#444' : '#fff',
            fontSize: 12, cursor: disabled ? 'not-allowed' : 'pointer',
            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 5,
            transition: 'all 0.15s',
        }}>
            {icon} {label}
        </button>
    )
}