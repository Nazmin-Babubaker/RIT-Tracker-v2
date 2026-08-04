# RITTracker v2

An interactive 360° virtual tour viewer — walk through a real space (parking, entrance, corridors, stairs, etc.) by clicking between linked panoramic nodes on a map, powered by [Photo Sphere Viewer](https://photo-sphere-viewer.js.org/).

This is **v2** of RITTracker, rebuilt to fix the slow load times of the original version, and now hosted on **Cloudflare Workers** ([link](https://rittracker.nza.worker.dev/)).

## What's New in v2 (Load Time Fix)

The old version loaded each panorama as a single full-resolution equirectangular image before it could render, which meant a large download (and a long wait) every time you stepped into a new node.

v2 fixes this by switching to **tiled panoramas**:

- Uses `EquirectangularTilesAdapter` instead of the plain equirectangular adapter, so each panorama is split into a grid of small tiles (`cols` × `rows`) plus one small low-res `baseUrl` preview image.
- The **base image renders instantly** while only the tiles actually in view are fetched, instead of downloading the whole 8704px-wide panorama up front.
- `VirtualTourPlugin` is configured with `preload: true`, so neighboring nodes start fetching in the background while you're still looking at the current one — moving to the next node feels instant instead of triggering a fresh load.
- `renderMode: '3d'` is used so transitions between nodes are handled efficiently by the plugin rather than doing a full teardown/rebuild of the viewer on every navigation.

Net effect: initial paint is near-instant (small base image), full detail streams in progressively, and adjacent rooms are already warm by the time you walk into them.

## Tech Stack

- **React** — `TourViewer` component wraps the viewer lifecycle in a `useEffect`/`useRef` pair.
- **[@photo-sphere-viewer/core](https://photo-sphere-viewer.js.org/)** — base 360° viewer engine.
- **@photo-sphere-viewer/equirectangular-tiles-adapter** — tiled panorama rendering (the core of the load-time fix).
- **@photo-sphere-viewer/virtual-tour-plugin** — links panoramas together into a navigable tour with a map.
- **Cloudflare Workers** — hosting/deployment target for the built app.

