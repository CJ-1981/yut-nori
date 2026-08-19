# Bolt's Journal - Critical Learnings

## 2025-02-19 - 3D Resource Allocation Pattern in React Three Fiber
**Learning:** In Three.js/R3F components rendered conditionally or in lists (like Yut stick physics objects), allocating `CanvasTexture` and `ExtrudeGeometry` inside `useMemo` within the component causes duplicate memory allocations per item (4x per throw) and GPU texture leaks when unmounted.
**Action:** Lazily instantiate shared Three.js geometries and textures as singletons at module scope so all instances reuse the same GPU resources without allocation churn or memory leaks.
