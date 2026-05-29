import { useEffect } from 'react'
import { FaCheck, FaExclamationTriangle } from 'react-icons/fa'

export default function Toast({ message, type = 'success', onClose }) {
    useEffect(() => {
        const timer = setTimeout(onClose, 2500)
        return () => clearTimeout(timer)
    }, [message])

    const colors = {
        success: { bg: '#1a3a1a', border: '#4a8a4a', text: '#88cc88', icon: <FaCheck size={12} /> },
        error: { bg: '#3a1a1a', border: '#8a4a4a', text: '#cc8888', icon: <FaExclamationTriangle size={12} /> },
        info: { bg: '#1a2a3a', border: '#4a6a8a', text: '#88aacc', icon: null },
    }

    const c = colors[type] ?? colors.info

    return (
        <div style={{
            position: 'absolute', bottom: 30, left: '50%',
            transform: 'translateX(-50%)',
            background: c.bg, border: `1px solid ${c.border}`,
            borderRadius: 6, padding: '10px 16px',
            color: c.text, fontSize: 12,
            fontFamily: 'Courier New',
            display: 'flex', alignItems: 'center', gap: 8,
            zIndex: 300, whiteSpace: 'nowrap',
            boxShadow: '0 4px 12px rgba(0,0,0,0.5)',
        }}>
            {c.icon}
            {message}
        </div>
    )
}