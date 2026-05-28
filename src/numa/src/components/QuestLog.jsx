import { useState } from 'react'
import { GiScrollUnfurled } from 'react-icons/gi'

export default function QuestLog({ quests }) {
    const [open, setOpen] = useState(false)
    const activeQuests = quests.filter(q => !q.completed)

    return (
        <>
            <button onClick={() => setOpen(o => !o)} style={{
                position: 'absolute', top: 50, right: 12,
                background: 'rgba(0,0,0,0.6)', border: '1px solid #444',
                borderRadius: 4, padding: '6px 10px',
                color: '#e8b84b', cursor: 'pointer',
                display: 'flex', alignItems: 'center', gap: 6,
                fontSize: 12, zIndex: 50,
            }}>
                <GiScrollUnfurled size={14} />
                Quest ({activeQuests.length})
            </button>

            {open && (
                <div style={{
                    position: 'absolute', top: 86, right: 12,
                    background: '#111', border: '1px solid #333',
                    borderRadius: 6, padding: 14,
                    width: 240, zIndex: 50,
                    display: 'flex', flexDirection: 'column', gap: 10,
                }}>
                    <span style={{ color: '#e8b84b', fontSize: 12, fontWeight: 'bold' }}>
                        Quest Log
                    </span>

                    {activeQuests.length === 0 && (
                        <span style={{ color: '#555', fontSize: 11 }}>
                            Belum ada quest aktif.
                        </span>
                    )}

                    {activeQuests.map(q => (
                        <QuestItem key={q.id} quest={q} />
                    ))}
                </div>
            )}
        </>
    )
}

function QuestItem({ quest }) {
    const pct = quest.progress / quest.targetCount * 100

    return (
        <div style={{
            display: 'flex', flexDirection: 'column', gap: 5,
            padding: '8px 10px',
            background: '#1a1a1a', border: '1px solid #2a2a2a',
            borderRadius: 4,
        }}>
            <span style={{ color: '#ddd', fontSize: 11, fontWeight: 'bold' }}>
                {quest.title}
            </span>
            <span style={{ color: '#777', fontSize: 10 }}>
                {quest.description}
            </span>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                <div style={{ flex: 1, height: 4, background: '#333', borderRadius: 2, overflow: 'hidden' }}>
                    <div style={{ width: `${pct}%`, height: '100%', background: '#e8b84b' }} />
                </div>
                <span style={{ color: '#888', fontSize: 10 }}>
                    {quest.progress}/{quest.targetCount}
                </span>
            </div>
            <div style={{ display: 'flex', gap: 8, color: '#666', fontSize: 10 }}>
                <span>+{quest.reward.exp} EXP</span>
                <span>+{quest.reward.gold} Gold</span>
            </div>
        </div>
    )
}