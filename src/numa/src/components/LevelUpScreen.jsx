import { GiLevelThree } from 'react-icons/gi'
import { FaHeart, FaStar } from 'react-icons/fa'

export default function LevelUpScreen({ gains, newLevel, onClose }) {
    return (
        <div style={{
            position: 'absolute', inset: 0,
            background: 'rgba(0,0,0,0.88)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            zIndex: 200,
        }}>
            <div style={{
                background: '#111', border: '2px solid #e8b84b',
                borderRadius: 8, padding: 28,
                width: '90%', maxWidth: 340,
                display: 'flex', flexDirection: 'column',
                alignItems: 'center', gap: 16,
                textAlign: 'center',
            }}>

                <GiLevelThree color="#e8b84b" size={40} />

                <div>
                    <div style={{ color: '#e8b84b', fontSize: 22, fontWeight: 'bold' }}>
                        Level Up!
                    </div>
                    <div style={{ color: '#888', fontSize: 13, marginTop: 4 }}>
                        Level {newLevel} tercapai
                    </div>
                </div>

                <div style={{
                    display: 'grid', gridTemplateColumns: '1fr 1fr',
                    gap: 8, width: '100%',
                }}>
                    <StatGain label="HP" value={gains.hp} color="#e05555" />
                    <StatGain label="MP" value={gains.mp} color="#4488dd" />
                    <StatGain label="ATK" value={gains.atk} color="#e8b84b" />
                    <StatGain label="DEF" value={gains.def} color="#44aa66" />
                </div>

                {gains.newSpell && (
                    <div style={{
                        background: '#1a1a3a', border: '1px solid #4455cc',
                        borderRadius: 4, padding: '8px 14px',
                        color: '#aabbff', fontSize: 12,
                    }}>
                        Sihir baru dipelajari: <strong>{gains.newSpell}</strong>
                    </div>
                )}

                <button onClick={onClose} style={{
                    padding: '9px 32px',
                    background: '#e8b84b', border: 'none',
                    borderRadius: 4, color: '#111',
                    fontSize: 13, fontWeight: 'bold',
                    cursor: 'pointer', marginTop: 4,
                }}>
                    Lanjutkan
                </button>

            </div>
        </div>
    )
}

function StatGain({ label, value, color }) {
    return (
        <div style={{
            background: '#1a1a1a', border: '1px solid #2a2a2a',
            borderRadius: 4, padding: '8px 0',
            display: 'flex', flexDirection: 'column',
            alignItems: 'center', gap: 3,
        }}>
            <span style={{ color: '#666', fontSize: 10 }}>{label}</span>
            <span style={{ color, fontSize: 16, fontWeight: 'bold' }}>+{value}</span>
        </div>
    )
}