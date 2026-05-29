import { FaPlay, FaFolderOpen } from 'react-icons/fa'
import { GiSwordman } from 'react-icons/gi'

export default function MainMenu({ hasSave, onNewGame, onContinue }) {
    return (
        <div style={{
            position: 'absolute', inset: 0,
            background: '#0a0a0f',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            zIndex: 500,
        }}>
            <div style={{
                display: 'flex', flexDirection: 'column',
                alignItems: 'center', gap: 24,
            }}>

                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8 }}>
                    <GiSwordman color="#e8b84b" size={48} />
                    <span style={{
                        color: '#e8b84b', fontSize: 28,
                        fontFamily: 'Courier New', fontWeight: 'bold',
                        letterSpacing: 4,
                    }}>
                        RPG QUEST
                    </span>
                    <span style={{ color: '#555', fontSize: 11, fontFamily: 'Courier New' }}>
                        Forest Adventure
                    </span>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: 10, width: 220 }}>
                    {hasSave && (
                        <MenuButton
                            icon={<FaFolderOpen size={14} />}
                            label="Lanjutkan"
                            onClick={onContinue}
                            color="#2a3a4a"
                            borderColor="#4a6a8a"
                            textColor="#88aacc"
                        />
                    )}
                    <MenuButton
                        icon={<FaPlay size={14} />}
                        label="Mulai Baru"
                        onClick={onNewGame}
                        color="#2a4a2a"
                        borderColor="#4a8a4a"
                        textColor="#88cc88"
                    />
                </div>

            </div>
        </div>
    )
}

function MenuButton({ icon, label, onClick, color, borderColor, textColor }) {
    return (
        <button onClick={onClick} style={{
            padding: '12px 0',
            background: color, border: `1px solid ${borderColor}`,
            borderRadius: 4, color: textColor,
            fontSize: 13, cursor: 'pointer',
            display: 'flex', alignItems: 'center',
            justifyContent: 'center', gap: 8,
            fontFamily: 'Courier New',
        }}>
            {icon} {label}
        </button>
    )
}