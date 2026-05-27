import { GiSwordman } from 'react-icons/gi'
import { FaHeart, FaStar, FaCoins } from 'react-icons/fa'
import { GiWaterDrop } from 'react-icons/gi'

export default function HUD({ player }) {
  return (
    <div style={{
      position: 'absolute',
      top: 0,
      left: 0,
      right: 0,
      padding: '10px 14px',
      display: 'flex',
      gap: 16,
      alignItems: 'center',
      background: 'rgba(0,0,0,0.55)',
      pointerEvents: 'none',
    }}>

      <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
        <GiSwordman color="#e8b84b" size={18} />
        <span style={{ color: '#e8b84b', fontSize: 13 }}>{player.name}</span>
      </div>

      <StatBar label="HP" value={player.hp} max={player.maxHp} color="#e05555" icon={<FaHeart color="#e05555" size={11} />} />
      <StatBar label="MP" value={player.mp} max={player.maxMp} color="#4488dd" icon={<GiWaterDrop color="#4488dd" size={11} />} />

      <div style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: 12 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
          <FaStar color="#e8b84b" size={12} />
          <span style={{ color: '#aaa', fontSize: 12 }}>Lv.{player.level}</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
          <FaCoins color="#e8b84b" size={12} />
          <span style={{ color: '#e8b84b', fontSize: 12 }}>{player.gold}G</span>
        </div>
      </div>

    </div>
  )
}

function StatBar({ label, value, max, color, icon }) {
  const pct = Math.max(0, value / max * 100)
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
      {icon}
      <span style={{ color, fontSize: 11, width: 24 }}>{label}</span>
      <div style={{
        width: 80,
        height: 8,
        background: '#222',
        borderRadius: 4,
        overflow: 'hidden',
        border: '1px solid #333',
      }}>
        <div style={{
          width: `${pct}%`,
          height: '100%',
          background: color,
          borderRadius: 4,
          transition: 'width 0.3s ease',
        }} />
      </div>
      <span style={{ color: '#888', fontSize: 10 }}>{value}/{max}</span>
    </div>
  )
}