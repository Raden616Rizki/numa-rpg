import { FaSave, FaFolderOpen, FaTrash } from 'react-icons/fa'
import { deleteSave } from '../game/systems/SaveSystem'

export default function SaveLoadScreen({ savedAt, onSave, onLoad, onDelete, onClose, hasSave }) {
    return (
        <div style={{
            position: 'absolute', inset: 0,
            background: 'rgba(0,0,0,0.82)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            zIndex: 200,
        }}>
            <div style={{
                background: '#111', border: '2px solid #444',
                borderRadius: 8, padding: 24,
                width: '90%', maxWidth: 340,
                display: 'flex', flexDirection: 'column', gap: 14,
            }}>

                <span style={{ color: '#e8b84b', fontSize: 15, fontWeight: 'bold' }}>
                    Save / Load
                </span>

                <div style={{
                    background: '#1a1a1a', border: '1px solid #2a2a2a',
                    borderRadius: 4, padding: '12px 14px',
                    display: 'flex', flexDirection: 'column', gap: 6,
                }}>
                    <span style={{ color: '#aaa', fontSize: 12 }}>
                        {hasSave ? 'Save file ditemukan' : 'Belum ada save file'}
                    </span>
                    {savedAt && (
                        <span style={{ color: '#555', fontSize: 10 }}>
                            Terakhir disimpan: {new Date(savedAt).toLocaleString('id-ID')}
                        </span>
                    )}
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                    <MenuButton
                        icon={<FaSave size={13} />}
                        label="Simpan Game"
                        onClick={onSave}
                        color="#2a4a2a"
                        borderColor="#4a8a4a"
                        textColor="#88cc88"
                    />
                    <MenuButton
                        icon={<FaFolderOpen size={13} />}
                        label="Load Game"
                        onClick={onLoad}
                        disabled={!hasSave}
                        color="#2a2a4a"
                        borderColor="#4a4a8a"
                        textColor="#8888cc"
                    />
                    {hasSave && (
                        <MenuButton
                            icon={<FaTrash size={13} />}
                            label="Hapus Save"
                            onClick={() => { onClose(); setConfirmDelete(true) }}
                            color="#3a1a1a"
                            borderColor="#6a2a2a"
                            textColor="#cc6666"
                        />
                    )}
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

function MenuButton({ icon, label, onClick, disabled, color, borderColor, textColor }) {
    return (
        <button onClick={onClick} disabled={disabled} style={{
            padding: '10px 14px',
            background: disabled ? '#1a1a1a' : color,
            border: `1px solid ${disabled ? '#333' : borderColor}`,
            borderRadius: 4,
            color: disabled ? '#444' : textColor,
            fontSize: 12, cursor: disabled ? 'not-allowed' : 'pointer',
            display: 'flex', alignItems: 'center', gap: 8,
        }}>
            {icon} {label}
        </button>
    )
}