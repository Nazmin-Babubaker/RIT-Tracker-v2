import { useEffect, useRef, useState } from 'react'
import { Viewer } from '@photo-sphere-viewer/core'
import { EquirectangularTilesAdapter } from '@photo-sphere-viewer/equirectangular-tiles-adapter'
import { VirtualTourPlugin } from '@photo-sphere-viewer/virtual-tour-plugin'
import { MarkersPlugin } from '@photo-sphere-viewer/markers-plugin'

import '@photo-sphere-viewer/core/index.css'
import '@photo-sphere-viewer/virtual-tour-plugin/index.css'
import '@photo-sphere-viewer/markers-plugin/index.css'

import tourData from '../data/tour.json'

export default function TourViewer() {
  const containerRef = useRef(null)
  const viewerRef = useRef(null)

  // NEW: whichever marker's data is currently shown in the sidebar (null = closed)
  const [selectedInfo, setSelectedInfo] = useState(null)

  useEffect(() => {
    if (!containerRef.current || viewerRef.current) return

    const nodes = tourData.nodes.map(node => ({
      id: node.id,
      caption: node.name,
      panorama: {
        baseUrl: node.panorama.baseUrl,
        tileUrl: (col, row) =>
          node.panorama.tileUrl
            .replace('{col}', col)
            .replace('{row}', row),
        width: node.panorama.width,
        cols: node.panorama.cols,
        rows: node.panorama.rows,
      },
      sphereCorrection: {
        pan: `${node.northOffset || 0}deg`,
      },
      links: node.links,
      map: node.position,
      markers: node.markers || [],
    }))

    viewerRef.current = new Viewer({
      container: containerRef.current,
      adapter: EquirectangularTilesAdapter,
      plugins: [
        MarkersPlugin,
        [
          VirtualTourPlugin,
          {
            renderMode: '3d',
            preload: true,
            nodes: nodes,
            startNodeId: tourData.nodes[0].id,
          },
        ],
      ],
    })

    const markersPlugin = viewerRef.current.getPlugin(MarkersPlugin)

    // NEW: clicking a marker opens the sidebar with that marker's `data`
    markersPlugin.addEventListener('select-marker', ({ marker }) => {
      setSelectedInfo(marker.data || null)
    })

    viewerRef.current.addEventListener('click', ({ data }) => {
      const pos = viewerRef.current.getPosition()
      console.log(`yaw: ${(pos.yaw * 180 / Math.PI).toFixed(1)}deg, pitch: ${(pos.pitch * 180 / Math.PI).toFixed(1)}deg`)
    })

    return () => {
      viewerRef.current?.destroy()
      viewerRef.current = null
    }
  }, [])

  return (
    <div style={{ width: '100vw', height: '100dvh', position: 'relative' }}>
      <div ref={containerRef} style={{ width: '100%', height: '100%' }} />

      {/* NEW: sidebar, only rendered when a marker is selected */}
      {selectedInfo && (
        <InfoSidebar info={selectedInfo} onClose={() => setSelectedInfo(null)} />
      )}
    </div>
  )
}

function InfoSidebar({ info, onClose }) {
  return (
    <div
      style={{
        position: 'absolute',
        top: 0,
        right: 0,
        height: '100%',
        width: 320,
        maxWidth: '85vw',
        background: 'rgba(20, 20, 24, 0.92)',
        color: '#fff',
        padding: 20,
        boxSizing: 'border-box',
        fontFamily: 'system-ui, sans-serif',
        overflowY: 'auto',
        zIndex: 20,
      }}
    >
      <button
        onClick={onClose}
        style={{
          position: 'absolute',
          top: 12,
          right: 12,
          background: 'transparent',
          border: 'none',
          color: '#fff',
          fontSize: 20,
          cursor: 'pointer',
          lineHeight: 1,
        }}
        aria-label="Close"
      >
        ×
      </button>

      <h2 style={{ margin: '0 24px 8px 0', fontSize: 18 }}>{info.title}</h2>

      {info.description && (
        <p style={{ fontSize: 14, opacity: 0.85, marginBottom: 16 }}>{info.description}</p>
      )}

      {/* Room-type-specific content: staffroom / classroom carry a teachers list */}
      {Array.isArray(info.teachers) && info.teachers.length > 0 && (
        <div>
          <div style={{ fontWeight: 600, fontSize: 13, marginBottom: 8, opacity: 0.7 }}>
            TEACHERS
          </div>
          <ul style={{ listStyle: 'none', margin: 0, padding: 0 }}>
            {info.teachers.map((t, i) => (
              <li
                key={i}
                style={{
                  padding: '8px 0',
                  borderBottom: '1px solid rgba(255,255,255,0.1)',
                  fontSize: 14,
                }}
              >
                <div style={{ fontWeight: 500 }}>{t.name}</div>
                <div style={{ opacity: 0.7, fontSize: 13 }}>{t.subject}</div>
              </li>
            ))}
          </ul>
        </div>
      )}

      {info.contact && (
        <div style={{ marginTop: 16, fontSize: 13, opacity: 0.7 }}>
          Contact: {info.contact}
        </div>
      )}
    </div>
  )
}