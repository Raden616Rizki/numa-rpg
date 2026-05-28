import { FaComment } from 'react-icons/fa'
import { GiScrollUnfurled } from 'react-icons/gi'

export default function NPCDialog({ npc, onAcceptQuest, onDecline, quest }) {
    if (!npc) return null

    return (
        <div style={{
            position: 'absolute', inset: 0,
            background: 'rgba(0,0,0,0.75)',
            display: 'flex', alignItems: 'flex-end',
            justifyContent: 'center',
            paddingBottom: 40,
            zIndex: 100,
        }}>
            <div style={{
                background: '#111', border: '2px solid #444',
                borderRadius: 8, padding: 20,
                width: '90%', maxWidth: 420,
                display: 'flex', flexDirection: 'column', gap: 14,
            }}>

                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <FaComment color="#e8b84b" size={14} />
                    <span style={{ color: '#e8b84b', fontSize: 14, fontWeight: 'bold' }}>
                        {npc.name}
                    </span>
                </div>

                <p style={{ color: '#ccc', fontSize: 13, lineHeight: 1.6, margin: 0 }}>
                    {npc.dialogue}
                </p>

                {npc.hasQuest && !npc.questGiven && quest && (
                    <div style={{
                        background: '#1a1a1a', border: '1px solid #333',
                        borderRadius: 4, padding: '10px 14px',
                        display: 'flex', flexDirection: 'column', gap: 6,
                    }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                            <GiScrollUnfurled color="#e8b84b" size={13} />
                            <span style={{ color: '#e8b84b', fontSize: 12, fontWeight: 'bold' }}>
                                {quest.title}
                            </span>
                        </div>
                        <p style={{ color: '#aaa', fontSize: 11, margin: 0 }}>
                            {quest.description}
                        </p>
                        <div style={{ display: 'flex', gap: 8, color: '#888', fontSize: 10 }}>
                            <span>+{quest.reward.exp} EXP</span>
                            <span>+{quest.reward.gold} Gold</span>
                        </div>
                    </div>
                )}

                <div style={{ display: 'flex', gap: 8 }}>
                    {npc.hasQuest && !npc.questGiven && (
                        <button onClick={onAcceptQuest} style={{
                            flex: 1, padding: '9px 0',
                            background: '#2a4a2a', border: '1px solid #4a8a4a',
                            borderRadius: 4, color: '#88cc88',
                            fontSize: 12, cursor: 'pointer',
                        }}>
                            Terima Quest
                        </button>
                    )}
                    <button onClick={onDecline} style={{
                        flex: 1, padding: '9px 0',
                        background: '#1a1a1a', border: '1px solid #333',
                        borderRadius: 4, color: '#888',
                        fontSize: 12, cursor: 'pointer',
                    }}>
                        {npc.questGiven ? 'Tutup' : 'Tolak'}
                    </button>
                </div>

            </div>
        </div>
    )
}