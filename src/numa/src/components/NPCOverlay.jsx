import { useEffect, useState } from 'react'
import { on, off } from '../game/EventBus'

export default function NPCOverlay() {
    const [positions, setPositions] = useState([])

    useEffect(() => {
        const handler = (data) => setPositions(data.positions)
        on('npc:positions', handler)
        return () => off('npc:positions', handler)
    }, [])

    return (
        <>
            {positions.map(npc => (
                <div key={npc.id} style={{
                    position: 'absolute',
                    left: npc.sx,
                    top: npc.sy,
                    transform: 'translate(-50%, -100%)',
                    pointerEvents: 'none',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    gap: 2,
                    marginTop: -8,
                }}>
                    <div style={{
                        background: npc.isMerchant ? '#44aa66' : '#e8b84b',
                        color: '#111',
                        fontFamily: 'Courier New',
                        fontSize: 11,
                        fontWeight: 'bold',
                        padding: '0px 5px',
                        borderRadius: 3,
                        lineHeight: 1.4,
                    }}>
                        {npc.isMerchant ? '$' : '!'}
                    </div>
                    <div style={{
                        background: 'rgba(0,0,0,0.75)',
                        color: npc.isMerchant ? '#44aa66' : '#e8b84b',
                        fontFamily: 'Courier New',
                        fontSize: 10,
                        padding: '1px 5px',
                        borderRadius: 3,
                        whiteSpace: 'nowrap',
                    }}>
                        {npc.name}
                    </div>
                </div>
            ))}
        </>
    )
}