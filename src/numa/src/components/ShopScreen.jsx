import { useState } from 'react'
import { FaCoins, FaTimes } from 'react-icons/fa'
import { GiShop } from 'react-icons/gi'
import { ITEMS, SHOP_INVENTORY } from '../game/data/items'
import { EQUIPMENT, SHOP_EQUIPMENT } from '../game/data/equipment'

export default function ShopScreen({
    playerGold, inventory, equipmentInventory, equipped,
    onBuy, onBuyEquipment, onSellItem, onSellEquipment, onClose
}) {
    const [tab, setTab] = useState('items')
    const [message, setMessage] = useState('')

    function handleBuyItem(itemId) {
        const item = ITEMS[itemId]
        if (playerGold < item.price) { setMessage('Gold tidak cukup!'); return }
        onBuy(itemId, item.price)
        setMessage(`Membeli ${item.name}!`)
    }

    function handleBuyEquipment(itemId) {
        const eq = EQUIPMENT[itemId]
        if (playerGold < eq.price) { setMessage('Gold tidak cukup!'); return }
        if (equipmentInventory.includes(itemId)) { setMessage('Sudah dimiliki!'); return }
        onBuyEquipment(itemId, eq.price)
        setMessage(`Membeli ${eq.name}!`)
    }

    function handleSellItem(itemId) {
        const item = ITEMS[itemId]
        const sellPrice = Math.floor(item.price * 0.5)
        onSellItem(itemId, sellPrice)
        setMessage(`Menjual ${item.name} +${sellPrice}G`)
    }

    function handleSellEquipment(itemId) {
        const eq = EQUIPMENT[itemId]
        if (equipped && Object.values(equipped).includes(itemId)) {
            setMessage('Lepas equipment dulu sebelum dijual!')
            return
        }
        const sellPrice = Math.floor(eq.price * 0.5)
        onSellEquipment(itemId, sellPrice)
        setMessage(`Menjual ${eq.name} +${sellPrice}G`)
    }

    function getQuantityOwned(itemId) {
        return inventory.find(s => s.itemId === itemId)?.quantity ?? 0
    }

    const sellableItems = inventory.filter(s => s.quantity > 0 && ITEMS[s.itemId])
    const sellableEquipment = equipmentInventory.filter(id => EQUIPMENT[id])

    return (
        <div style={{
            position: 'absolute', inset: 0,
            background: 'rgba(0,0,0,0.82)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            zIndex: 100,
        }}>
            <div style={{
                background: '#111', border: '2px solid #444',
                borderRadius: 8, padding: 20,
                width: '90%', maxWidth: 400,
                display: 'flex', flexDirection: 'column', gap: 14,
                maxHeight: '85vh',
            }}>

                {/* Header */}
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        <GiShop color="#44aa66" size={18} />
                        <span style={{ color: '#44aa66', fontSize: 15, fontWeight: 'bold' }}>Toko</span>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
                            <FaCoins color="#e8b84b" size={12} />
                            <span style={{ color: '#e8b84b', fontSize: 13 }}>{playerGold}G</span>
                        </div>
                        <button onClick={onClose} style={{
                            background: 'none', border: 'none', color: '#666', cursor: 'pointer',
                        }}>
                            <FaTimes size={14} />
                        </button>
                    </div>
                </div>

                {/* Tabs */}
                <div style={{ display: 'flex', gap: 6 }}>
                    <TabButton active={tab === 'items'} onClick={() => setTab('items')} label="Beli Item" />
                    <TabButton active={tab === 'equipment'} onClick={() => setTab('equipment')} label="Beli Equip" />
                    <TabButton active={tab === 'sell'} onClick={() => setTab('sell')} label="Jual" />
                </div>

                {/* Message */}
                {message && (
                    <div style={{
                        background: '#1a2a1a', border: '1px solid #2a4a2a',
                        borderRadius: 4, padding: '6px 10px',
                        color: '#88cc88', fontSize: 11, fontFamily: 'Courier New',
                    }}>
                        {message}
                    </div>
                )}

                {/* Content */}
                <div style={{ overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: 6 }}>

                    {/* Tab: Beli Item */}
                    {tab === 'items' && SHOP_INVENTORY.map(({ itemId }) => {
                        const item = ITEMS[itemId]
                        const canAfford = playerGold >= item.price
                        return (
                            <ShopRow
                                key={itemId}
                                name={item.name}
                                description={item.description}
                                price={item.price}
                                badge={`x${getQuantityOwned(itemId)}`}
                                canAfford={canAfford}
                                buttonLabel="Beli"
                                onAction={() => handleBuyItem(itemId)}
                            />
                        )
                    })}

                    {/* Tab: Beli Equipment */}
                    {tab === 'equipment' && SHOP_EQUIPMENT.map(itemId => {
                        const eq = EQUIPMENT[itemId]
                        const owned = equipmentInventory.includes(itemId)
                        const canAfford = playerGold >= eq.price && !owned
                        return (
                            <ShopRow
                                key={itemId}
                                name={eq.name}
                                description={`${eq.description} — ${formatStats(eq.stats)}`}
                                price={eq.price}
                                badge={owned ? 'Dimiliki' : null}
                                canAfford={canAfford}
                                buttonLabel={owned ? 'Dimiliki' : 'Beli'}
                                onAction={() => handleBuyEquipment(itemId)}
                            />
                        )
                    })}

                    {/* Tab: Jual */}
                    {tab === 'sell' && (
                        <>
                            {sellableItems.length === 0 && sellableEquipment.length === 0 && (
                                <span style={{ color: '#555', fontSize: 12, padding: '8px 0' }}>
                                    Tidak ada item untuk dijual.
                                </span>
                            )}

                            {sellableItems.length > 0 && (
                                <div style={{ color: '#666', fontSize: 10, marginBottom: 2 }}>Item</div>
                            )}
                            {sellableItems.map(slot => {
                                const item = ITEMS[slot.itemId]
                                if (!item) return null
                                const sellPrice = Math.floor(item.price * 0.5)
                                return (
                                    <ShopRow
                                        key={slot.itemId}
                                        name={item.name}
                                        description={item.description}
                                        price={sellPrice}
                                        badge={`x${slot.quantity}`}
                                        canAfford={true}
                                        buttonLabel="Jual"
                                        buttonColor="#4a3a1a"
                                        buttonBorder="#8a6a2a"
                                        buttonText="#ccaa44"
                                        onAction={() => handleSellItem(slot.itemId)}
                                    />
                                )
                            })}

                            {sellableEquipment.length > 0 && (
                                <div style={{ color: '#666', fontSize: 10, marginTop: 6, marginBottom: 2 }}>
                                    Equipment
                                </div>
                            )}
                            {sellableEquipment.map(itemId => {
                                const eq = EQUIPMENT[itemId]
                                if (!eq) return null
                                const sellPrice = Math.floor(eq.price * 0.5)
                                const isEquipped = equipped && Object.values(equipped).includes(itemId)
                                return (
                                    <ShopRow
                                        key={itemId}
                                        name={eq.name}
                                        description={isEquipped ? '⚠️ Sedang dipakai' : formatStats(eq.stats)}
                                        price={sellPrice}
                                        badge={null}
                                        canAfford={!isEquipped}
                                        buttonLabel="Jual"
                                        buttonColor="#4a3a1a"
                                        buttonBorder="#8a6a2a"
                                        buttonText="#ccaa44"
                                        onAction={() => handleSellEquipment(itemId)}
                                    />
                                )
                            })}
                        </>
                    )}

                </div>

            </div>
        </div>
    )
}

function ShopRow({
    name, description, price, badge, canAfford,
    buttonLabel, onAction,
    buttonColor = '#2a4a2a',
    buttonBorder = '#4a8a4a',
    buttonText = '#88cc88',
}) {
    return (
        <div style={{
            display: 'flex', alignItems: 'center', gap: 10,
            padding: '10px 12px',
            background: '#1a1a1a', border: '1px solid #2a2a2a', borderRadius: 4,
        }}>
            <div style={{ flex: 1 }}>
                <div style={{ color: '#ddd', fontSize: 12, fontWeight: 'bold' }}>{name}</div>
                <div style={{ color: '#666', fontSize: 10, marginTop: 2 }}>{description}</div>
                {badge && <div style={{ color: '#555', fontSize: 10, marginTop: 2 }}>{badge}</div>}
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 6 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                    <FaCoins color="#e8b84b" size={10} />
                    <span style={{ color: canAfford ? '#e8b84b' : '#664422', fontSize: 12 }}>{price}G</span>
                </div>
                <button onClick={onAction} disabled={!canAfford} style={{
                    padding: '4px 12px',
                    background: canAfford ? buttonColor : '#1a1a1a',
                    border: `1px solid ${canAfford ? buttonBorder : '#333'}`,
                    borderRadius: 3,
                    color: canAfford ? buttonText : '#444',
                    fontSize: 11, cursor: canAfford ? 'pointer' : 'not-allowed',
                }}>
                    {buttonLabel}
                </button>
            </div>
        </div>
    )
}

function TabButton({ active, onClick, label }) {
    return (
        <button onClick={onClick} style={{
            flex: 1, padding: '7px 0',
            background: active ? '#2a2a3a' : '#1a1a1a',
            border: `1px solid ${active ? '#4a4a6a' : '#2a2a2a'}`,
            borderRadius: 4, color: active ? '#aabbff' : '#555',
            fontSize: 11, cursor: 'pointer',
        }}>
            {label}
        </button>
    )
}

function formatStats(stats) {
    return Object.entries(stats).map(([k, v]) => `+${v} ${k.toUpperCase()}`).join(' ')
}