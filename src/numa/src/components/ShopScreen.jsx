import { useState } from 'react'
import { FaCoins } from 'react-icons/fa'
import { GiShop } from 'react-icons/gi'
import { ITEMS, SHOP_INVENTORY } from '../game/data/items'

export default function ShopScreen({ playerGold, inventory, onBuy, onClose }) {
    const [message, setMessage] = useState('')

    function handleBuy(itemId) {
        const item = ITEMS[itemId]
        if (playerGold < item.price) {
            setMessage('Gold tidak cukup!')
            return
        }
        onBuy(itemId, item.price)
        setMessage(`Membeli ${item.name}!`)
    }

    function getQuantityOwned(itemId) {
        const slot = inventory.find(s => s.itemId === itemId)
        return slot ? slot.quantity : 0
    }

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
            }}>

                {/* Header */}
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        <GiShop color="#44aa66" size={18} />
                        <span style={{ color: '#44aa66', fontSize: 15, fontWeight: 'bold' }}>
                            Toko
                        </span>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
                        <FaCoins color="#e8b84b" size={12} />
                        <span style={{ color: '#e8b84b', fontSize: 13 }}>
                            {playerGold}G
                        </span>
                    </div>
                </div>

                {/* Message */}
                {message && (
                    <div style={{
                        background: '#1a2a1a', border: '1px solid #2a4a2a',
                        borderRadius: 4, padding: '6px 10px',
                        color: '#88cc88', fontSize: 11,
                        fontFamily: 'Courier New',
                    }}>
                        {message}
                    </div>
                )}

                {/* Item list */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                    {SHOP_INVENTORY.map(({ itemId }) => {
                        const item = ITEMS[itemId]
                        const owned = getQuantityOwned(itemId)
                        const canAfford = playerGold >= item.price

                        return (
                            <div key={itemId} style={{
                                display: 'flex', alignItems: 'center',
                                gap: 10, padding: '10px 12px',
                                background: '#1a1a1a', border: '1px solid #2a2a2a',
                                borderRadius: 4,
                            }}>
                                <div style={{ flex: 1 }}>
                                    <div style={{ color: '#ddd', fontSize: 12, fontWeight: 'bold' }}>
                                        {item.name}
                                    </div>
                                    <div style={{ color: '#666', fontSize: 10, marginTop: 2 }}>
                                        {item.description}
                                    </div>
                                    <div style={{ color: '#555', fontSize: 10, marginTop: 2 }}>
                                        Dimiliki: {owned}
                                    </div>
                                </div>

                                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 6 }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                                        <FaCoins color="#e8b84b" size={10} />
                                        <span style={{ color: canAfford ? '#e8b84b' : '#664422', fontSize: 12 }}>
                                            {item.price}G
                                        </span>
                                    </div>
                                    <button onClick={() => handleBuy(itemId)} disabled={!canAfford} style={{
                                        padding: '4px 12px',
                                        background: canAfford ? '#2a4a2a' : '#1a1a1a',
                                        border: `1px solid ${canAfford ? '#4a8a4a' : '#333'}`,
                                        borderRadius: 3,
                                        color: canAfford ? '#88cc88' : '#444',
                                        fontSize: 11, cursor: canAfford ? 'pointer' : 'not-allowed',
                                    }}>
                                        Beli
                                    </button>
                                </div>
                            </div>
                        )
                    })}
                </div>

                <button onClick={onClose} style={{
                    padding: '9px 0',
                    background: '#1a1a1a', border: '1px solid #333',
                    borderRadius: 4, color: '#888',
                    fontSize: 12, cursor: 'pointer',
                }}>
                    Tutup
                </button>

            </div>
        </div>
    )
}