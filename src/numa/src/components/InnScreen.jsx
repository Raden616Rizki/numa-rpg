import { FaBed } from 'react-icons/fa'
import { GiCampfire } from 'react-icons/gi'

const INN_PRICE = 20

export default function InnScreen({ npc, player, onRest, onClose }) {
    const canAfford = player.gold >= INN_PRICE
    const isFullHp = player.hp >= player.maxHp && player.mp >= player.maxMp

    return (
        <div style={{
            position: 'absolute', inset: 0,
            background: 'rgba(0,0,0,0.82)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            zIndex: 150,
        }}>
            <div style={{
                background: '#111', border: '2px solid #cc6666',
                borderRadius: 8, padding: 24,
                width: '90%', maxWidth: 340,
                display: 'flex', flexDirection: 'column', gap: 16,
                textAlign: 'center',
            }}>

                <GiCampfire color="#cc6666" size={32} style={{ margin: '0 auto' }} />

                <div>
                    <div style={{ color: '#cc6666', fontSize: 15, fontWeight: 'bold' }}>
                        {npc?.name ?? 'Penginapan'}
                    </div>
                    <p style={{ color: '#aaa', fontSize: 12, marginTop: 6, lineHeight: 1.6 }}>
                        {npc?.dialogue ?? 'Mau beristirahat malam ini?'}
                    </p>
                </div>

                <div style={{
                    background: '#1a1a1a', border: '1px solid #2a2a2a',
                    borderRadius: 4, padding: '10px 14px',
                    display: 'flex', justifyContent: 'space-between',
                    alignItems: 'center',
                }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                        <FaBed color="#cc6666" size={14} />
                        <span style={{ color: '#aaa', fontSize: 12 }}>Biaya menginap</span>
                    </div>
                    <span style={{ color: '#e8b84b', fontSize: 13, fontWeight: 'bold' }}>
                        {INN_PRICE}G
                    </span>
                </div>

                {isFullHp && (
                    <p style={{ color: '#666', fontSize: 11 }}>HP dan MP sudah penuh.</p>
                )}

                <div style={{ display: 'flex', gap: 8 }}>
                    <button
                        onClick={onRest}
                        disabled={!canAfford || isFullHp}
                        style={{
                            flex: 1, padding: '10px 0',
                            background: canAfford && !isFullHp ? '#3a1a1a' : '#1a1a1a',
                            border: `1px solid ${canAfford && !isFullHp ? '#cc6666' : '#333'}`,
                            borderRadius: 4,
                            color: canAfford && !isFullHp ? '#cc8888' : '#444',
                            fontSize: 12, cursor: canAfford && !isFullHp ? 'pointer' : 'not-allowed',
                        }}
                    >
                        Menginap ({INN_PRICE}G)
                    </button>
                    <button onClick={onClose} style={{
                        flex: 1, padding: '10px 0',
                        background: '#1a1a1a', border: '1px solid #333',
                        borderRadius: 4, color: '#888',
                        fontSize: 12, cursor: 'pointer',
                    }}>
                        Tidak
                    </button>
                </div>

            </div>
        </div>
    )
}