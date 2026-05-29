import { useState } from 'react'
import { GiSpellBook } from 'react-icons/gi'
import { FaBoxOpen, FaTimes } from 'react-icons/fa'
import { ITEMS } from '../game/data/items'
import { getAvailableSpells } from '../game/data/spells'
import { applyItem } from '../game/systems/BattleSystem'

export default function ItemSpellMenu({ player, inventory, onUseItem, onUseSpell, onClose }) {
    const [tab, setTab] = useState('items')
    const availableSpells = getAvailableSpells(player.level)

    function handleUseItem(itemId) {
        const item = ITEMS[itemId]
        const result = applyItem(item, {
            hp: player.hp, mp: player.mp,
            maxHp: player.maxHp, maxMp: player.maxMp,
        })
        onUseItem(itemId, result)
    }

    function handleUseSpell(spell) {
        if (player.mp < spell.mpCost) return
        const healAmt = spell.heal ? spell.heal(player.level) : 0
        onUseSpell(spell, healAmt)
    }

    return (
        <div style={{
            position: 'absolute', inset: 0,
            background: 'rgba(0,0,0,0.75)',
            display: 'flex', alignItems: 'flex-end',
            justifyContent: 'center',
            paddingBottom: 40, zIndex: 100,
        }}>
            <div style={{
                background: '#111', border: '2px solid #444',
                borderRadius: 8, padding: 20,
                width: '90%', maxWidth: 420,
                display: 'flex', flexDirection: 'column', gap: 14,
            }}>

                {/* Header */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ color: '#e8b84b', fontSize: 14, fontWeight: 'bold' }}>
                        Item & Sihir
                    </span>
                    <button onClick={onClose} style={{
                        background: 'none', border: 'none',
                        color: '#666', cursor: 'pointer', padding: 4,
                    }}>
                        <FaTimes size={14} />
                    </button>
                </div>

                {/* Tabs */}
                <div style={{ display: 'flex', gap: 8 }}>
                    <TabButton active={tab === 'items'} onClick={() => setTab('items')} icon={<FaBoxOpen size={12} />} label="Item" />
                    <TabButton active={tab === 'spells'} onClick={() => setTab('spells')} icon={<GiSpellBook size={12} />} label="Sihir" />
                </div>

                {/* Item tab */}
                {tab === 'items' && (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                        {inventory.filter(s => s.quantity > 0).length === 0 && (
                            <span style={{ color: '#555', fontSize: 12 }}>Tidak ada item.</span>
                        )}
                        {inventory.filter(s => s.quantity > 0).map(slot => {
                            const item = ITEMS[slot.itemId]
                            if (!item) return null
                            return (
                                <div key={slot.itemId} style={{
                                    display: 'flex', alignItems: 'center', gap: 10,
                                    padding: '8px 12px',
                                    background: '#1a1a1a', border: '1px solid #2a2a2a',
                                    borderRadius: 4,
                                }}>
                                    <div style={{ flex: 1 }}>
                                        <div style={{ color: '#ddd', fontSize: 12 }}>{item.name}</div>
                                        <div style={{ color: '#666', fontSize: 10 }}>{item.description}</div>
                                    </div>
                                    <span style={{ color: '#666', fontSize: 10 }}>x{slot.quantity}</span>
                                    <button onClick={() => handleUseItem(slot.itemId)} style={{
                                        padding: '4px 10px',
                                        background: '#2a4a2a', border: '1px solid #4a8a4a',
                                        borderRadius: 3, color: '#88cc88',
                                        fontSize: 11, cursor: 'pointer',
                                    }}>
                                        Pakai
                                    </button>
                                </div>
                            )
                        })}
                    </div>
                )}

                {/* Spell tab */}
                {tab === 'spells' && (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                        {availableSpells.filter(s => s.heal).length === 0 && (
                            <span style={{ color: '#555', fontSize: 12 }}>Belum ada sihir penyembuh.</span>
                        )}
                        {availableSpells.filter(s => s.heal).map(spell => (
                            <div key={spell.id} style={{
                                display: 'flex', alignItems: 'center', gap: 10,
                                padding: '8px 12px',
                                background: '#1a1a1a', border: '1px solid #2a2a2a',
                                borderRadius: 4,
                            }}>
                                <div style={{ flex: 1 }}>
                                    <div style={{ color: '#aabbff', fontSize: 12 }}>{spell.name}</div>
                                    <div style={{ color: '#666', fontSize: 10 }}>{spell.description}</div>
                                </div>
                                <span style={{ color: '#4488dd', fontSize: 10 }}>{spell.mpCost} MP</span>
                                <button
                                    onClick={() => handleUseSpell(spell)}
                                    disabled={player.mp < spell.mpCost}
                                    style={{
                                        padding: '4px 10px',
                                        background: player.mp < spell.mpCost ? '#1a1a1a' : '#1a1a3a',
                                        border: `1px solid ${player.mp < spell.mpCost ? '#333' : '#4455cc'}`,
                                        borderRadius: 3,
                                        color: player.mp < spell.mpCost ? '#444' : '#aabbff',
                                        fontSize: 11,
                                        cursor: player.mp < spell.mpCost ? 'not-allowed' : 'pointer',
                                    }}
                                >
                                    Pakai
                                </button>
                            </div>
                        ))}
                    </div>
                )}

            </div>
        </div>
    )
}

function TabButton({ active, onClick, icon, label }) {
    return (
        <button onClick={onClick} style={{
            flex: 1, padding: '7px 0',
            background: active ? '#2a2a3a' : '#1a1a1a',
            border: `1px solid ${active ? '#4a4a6a' : '#2a2a2a'}`,
            borderRadius: 4, color: active ? '#aabbff' : '#555',
            fontSize: 12, cursor: 'pointer',
            display: 'flex', alignItems: 'center',
            justifyContent: 'center', gap: 6,
        }}>
            {icon} {label}
        </button>
    )
}