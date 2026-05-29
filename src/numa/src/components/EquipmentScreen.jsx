import { EQUIPMENT, EQUIPMENT_SLOTS, calcEquipmentStats } from '../game/data/equipment'
import { FaTimes } from 'react-icons/fa'
import { GiSwordman, GiShield, GiRing } from 'react-icons/gi'

const SLOT_ICONS = {
    [EQUIPMENT_SLOTS.WEAPON]: <GiSwordman size={14} />,
    [EQUIPMENT_SLOTS.ARMOR]: <GiShield size={14} />,
    [EQUIPMENT_SLOTS.ACCESSORY]: <GiRing size={14} />,
}

const SLOT_LABELS = {
    [EQUIPMENT_SLOTS.WEAPON]: 'Senjata',
    [EQUIPMENT_SLOTS.ARMOR]: 'Armor',
    [EQUIPMENT_SLOTS.ACCESSORY]: 'Aksesori',
}

export default function EquipmentScreen({ equipped, equipmentInventory, basePlayer, onEquip, onUnequip, onClose }) {
    const bonuses = calcEquipmentStats(equipped)

    function getInventoryForSlot(slot) {
        return equipmentInventory.filter(id => EQUIPMENT[id]?.slot === slot)
    }

    return (
        <div style={{
            position: 'absolute', inset: 0,
            background: 'rgba(0,0,0,0.82)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            zIndex: 150,
        }}>
            <div style={{
                background: '#111', border: '2px solid #444',
                borderRadius: 8, padding: 20,
                width: '90%', maxWidth: 420,
                display: 'flex', flexDirection: 'column', gap: 14,
                maxHeight: '85vh', overflowY: 'auto',
            }}>

                {/* Header */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ color: '#e8b84b', fontSize: 15, fontWeight: 'bold' }}>
                        Equipment
                    </span>
                    <button onClick={onClose} style={{
                        background: 'none', border: 'none', color: '#666', cursor: 'pointer',
                    }}>
                        <FaTimes size={14} />
                    </button>
                </div>

                {/* Stat bonuses */}
                <div style={{
                    background: '#1a1a1a', border: '1px solid #2a2a2a',
                    borderRadius: 4, padding: '8px 12px',
                    display: 'flex', gap: 16, flexWrap: 'wrap',
                }}>
                    <StatBonus label="ATK" base={basePlayer.atk} bonus={bonuses.atk} />
                    <StatBonus label="DEF" base={basePlayer.def} bonus={bonuses.def} />
                    <StatBonus label="HP" base={basePlayer.maxHp} bonus={bonuses.hp} />
                    <StatBonus label="MP" base={basePlayer.maxMp} bonus={bonuses.mp} />
                </div>

                {/* Slots */}
                {Object.values(EQUIPMENT_SLOTS).map(slot => (
                    <div key={slot}>
                        <div style={{
                            display: 'flex', alignItems: 'center', gap: 6,
                            color: '#888', fontSize: 11, marginBottom: 6,
                        }}>
                            {SLOT_ICONS[slot]}
                            <span>{SLOT_LABELS[slot]}</span>
                        </div>

                        {/* Currently equipped */}
                        <div style={{
                            padding: '8px 12px', marginBottom: 4,
                            background: equipped[slot] ? '#1a2a1a' : '#1a1a1a',
                            border: `1px solid ${equipped[slot] ? '#2a4a2a' : '#2a2a2a'}`,
                            borderRadius: 4,
                            display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                        }}>
                            {equipped[slot] ? (
                                <>
                                    <div>
                                        <div style={{ color: '#88cc88', fontSize: 12 }}>
                                            {EQUIPMENT[equipped[slot]].name}
                                        </div>
                                        <div style={{ color: '#555', fontSize: 10 }}>
                                            {formatStats(EQUIPMENT[equipped[slot]].stats)}
                                        </div>
                                    </div>
                                    <button onClick={() => onUnequip(slot)} style={{
                                        padding: '3px 8px',
                                        background: '#2a1a1a', border: '1px solid #4a2a2a',
                                        borderRadius: 3, color: '#cc6666',
                                        fontSize: 10, cursor: 'pointer',
                                    }}>
                                        Lepas
                                    </button>
                                </>
                            ) : (
                                <span style={{ color: '#444', fontSize: 11 }}>— Kosong —</span>
                            )}
                        </div>

                        {/* Inventory for this slot */}
                        {getInventoryForSlot(slot).map(itemId => {
                            const eq = EQUIPMENT[itemId]
                            const isEquipped = equipped[slot] === itemId
                            if (isEquipped) return null
                            return (
                                <div key={itemId} style={{
                                    padding: '7px 12px', marginBottom: 4,
                                    background: '#1a1a1a', border: '1px solid #2a2a2a',
                                    borderRadius: 4,
                                    display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                                }}>
                                    <div>
                                        <div style={{ color: '#ccc', fontSize: 12 }}>{eq.name}</div>
                                        <div style={{ color: '#555', fontSize: 10 }}>{formatStats(eq.stats)}</div>
                                    </div>
                                    <button onClick={() => onEquip(slot, itemId)} style={{
                                        padding: '3px 8px',
                                        background: '#2a3a2a', border: '1px solid #4a6a4a',
                                        borderRadius: 3, color: '#88cc88',
                                        fontSize: 10, cursor: 'pointer',
                                    }}>
                                        Equip
                                    </button>
                                </div>
                            )
                        })}

                        {getInventoryForSlot(slot).filter(id => id !== equipped[slot]).length === 0 && !equipped[slot] && (
                            <div style={{ color: '#333', fontSize: 10, paddingLeft: 4 }}>
                                Tidak ada item di inventory
                            </div>
                        )}
                    </div>
                ))}

            </div>
        </div>
    )
}

function StatBonus({ label, base, bonus }) {
    return (
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2 }}>
            <span style={{ color: '#555', fontSize: 9 }}>{label}</span>
            <span style={{ color: '#ddd', fontSize: 12 }}>
                {base}
                {bonus > 0 && <span style={{ color: '#88cc88', fontSize: 10 }}> +{bonus}</span>}
            </span>
        </div>
    )
}

function formatStats(stats) {
    return Object.entries(stats)
        .map(([k, v]) => `+${v} ${k.toUpperCase()}`)
        .join('  ')
}