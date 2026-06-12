import { useEffect, useRef } from 'react'
import { Viewer } from '@photo-sphere-viewer/core'
import { EquirectangularTilesAdapter } from '@photo-sphere-viewer/equirectangular-tiles-adapter'
import { VirtualTourPlugin } from '@photo-sphere-viewer/virtual-tour-plugin'

import '@photo-sphere-viewer/core/index.css'
import '@photo-sphere-viewer/virtual-tour-plugin/index.css'
import '@photo-sphere-viewer/map-plugin/index.css'

import tourData from '../data/tour.json'

export default function TourViewer() {
  const containerRef = useRef(null)
  const viewerRef = useRef(null)

  useEffect(() => {
    if (!containerRef.current || viewerRef.current) return

    

    // Build nodes for VirtualTourPlugin from tour.json
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
      
    }))

    viewerRef.current = new Viewer({
      container: containerRef.current,
      adapter: EquirectangularTilesAdapter,
      plugins: [
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
    </div>
  )
}