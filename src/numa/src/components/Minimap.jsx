import { useEffect, useRef } from 'react'
import { TILE_COLORS } from '../game/config'

const MINIMAP_SIZE = 120
const MINIMAP_TILE = 3
const VIEW_RADIUS = 20

export default function Minimap({ playerTileX, playerTileY, getChunkCache }) {
    const canvasRef = useRef(null)

    useEffect(() => {
        const canvas = canvasRef.current
        if (!canvas) return
        const ctx = canvas.getContext('2d')
        const chunkCache = getChunkCache()
        if (!chunkCache) return

        ctx.clearRect(0, 0, MINIMAP_SIZE, MINIMAP_SIZE)

        const tilesVisible = Math.floor(MINIMAP_SIZE / MINIMAP_TILE)
        const half = Math.floor(tilesVisible / 2)

        for (let dy = -half; dy <= half; dy++) {
            for (let dx = -half; dx <= half; dx++) {
                const worldCol = playerTileX + dx
                const worldRow = playerTileY + dy

                const tileType = getTileFromCache(chunkCache, worldCol, worldRow)
                const color = tileType !== null ? TILE_COLORS[tileType] : 0x000000

                ctx.fillStyle = hexToRgb(color)
                ctx.fillRect(
                    (dx + half) * MINIMAP_TILE,
                    (dy + half) * MINIMAP_TILE,
                    MINIMAP_TILE,
                    MINIMAP_TILE
                )
            }
        }

        // Gambar player dot
        const centerX = half * MINIMAP_TILE
        const centerY = half * MINIMAP_TILE
        ctx.fillStyle = '#4488ff'
        ctx.fillRect(centerX, centerY, MINIMAP_TILE, MINIMAP_TILE)

        // Border player dot supaya lebih jelas
        ctx.strokeStyle = '#ffffff'
        ctx.lineWidth = 0.5
        ctx.strokeRect(centerX, centerY, MINIMAP_TILE, MINIMAP_TILE)

    }, [playerTileX, playerTileY])

    return (
        <div style={{
            position: 'absolute',
            top: 90,
            left: 12,
            zIndex: 50,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'flex-start',
            gap: 4,
        }}>
            <span style={{
                color: '#666',
                fontSize: 9,
                fontFamily: 'Courier New',
            }}>
                {playerTileX}, {playerTileY}
            </span>
            <div style={{
                border: '2px solid #333',
                borderRadius: 4,
                overflow: 'hidden',
                boxShadow: '0 2px 8px rgba(0,0,0,0.6)',
                opacity: 0.85,
            }}>
                <canvas
                    ref={canvasRef}
                    width={MINIMAP_SIZE}
                    height={MINIMAP_SIZE}
                />
            </div>
        </div>
    )
}

/**
 * Gets tile type from chunk cache at world position
 * @param {Map} chunkCache
 * @param {number} worldCol
 * @param {number} worldRow
 * @returns {number|null}
 */
function getTileFromCache(chunkCache, worldCol, worldRow) {
    const CHUNK_SIZE = 32
    const chunkX = Math.floor(worldCol / CHUNK_SIZE)
    const chunkY = Math.floor(worldRow / CHUNK_SIZE)
    const key = `${chunkX},${chunkY}`

    const chunk = chunkCache.get(key)
    if (!chunk) return null

    const localCol = ((worldCol % CHUNK_SIZE) + CHUNK_SIZE) % CHUNK_SIZE
    const localRow = ((worldRow % CHUNK_SIZE) + CHUNK_SIZE) % CHUNK_SIZE

    return chunk[localRow]?.[localCol] ?? null
}

/**
 * Converts Phaser hex color to CSS rgb string
 * @param {number} hex
 * @returns {string}
 */
function hexToRgb(hex) {
    const r = (hex >> 16) & 0xff
    const g = (hex >> 8) & 0xff
    const b = hex & 0xff
    return `rgb(${r},${g},${b})`
}