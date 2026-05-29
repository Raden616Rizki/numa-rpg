export default function ConfirmModal({ message, onConfirm, onCancel }) {
    return (
        <div style={{
            position: 'absolute', inset: 0,
            background: 'rgba(0,0,0,0.75)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            zIndex: 400,
        }}>
            <div style={{
                background: '#111', border: '2px solid #555',
                borderRadius: 8, padding: 24,
                width: '90%', maxWidth: 300,
                display: 'flex', flexDirection: 'column', gap: 16,
                textAlign: 'center',
            }}>
                <p style={{ color: '#ccc', fontSize: 13, margin: 0, lineHeight: 1.6 }}>
                    {message}
                </p>
                <div style={{ display: 'flex', gap: 8 }}>
                    <button onClick={onConfirm} style={{
                        flex: 1, padding: '9px 0',
                        background: '#3a1a1a', border: '1px solid #8a4a4a',
                        borderRadius: 4, color: '#cc6666',
                        fontSize: 12, cursor: 'pointer',
                    }}>
                        Ya, Hapus
                    </button>
                    <button onClick={onCancel} style={{
                        flex: 1, padding: '9px 0',
                        background: '#1a1a1a', border: '1px solid #333',
                        borderRadius: 4, color: '#888',
                        fontSize: 12, cursor: 'pointer',
                    }}>
                        Batal
                    </button>
                </div>
            </div>
        </div>
    )
}