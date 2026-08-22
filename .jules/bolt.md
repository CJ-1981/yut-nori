# Bolt's Journal - Critical Learnings

## 2025-02-19 - 3D Resource Allocation Pattern in React Three Fiber
**Learning:** In Three.js/R3F components rendered conditionally or in lists (like Yut stick physics objects), allocating `CanvasTexture` and `ExtrudeGeometry` inside `useMemo` within the component causes duplicate memory allocations per item (4x per throw) and GPU texture leaks when unmounted.
**Action:** Lazily instantiate shared Three.js geometries and textures as singletons at module scope so all instances reuse the same GPU resources without allocation churn or memory leaks.

## 2025-02-20 - Pre-pass Map/Set Optimization for Render Loops
**Learning:** In React components rendering lists of pieces or entities with relational queries (such as stack position indexing or carried state check), performing $O(N)$ lookups (`.find`, `.filter`, `.findIndex`) inside per-item loops causes $O(N^2)$ algorithmic complexity and unnecessary heap allocations per render.
**Action:** Pre-compute lookup sets (`Set`) and position grouping maps (`Map`) in a single $O(N)$ pass prior to entity rendering, reducing lookup complexity to $O(1)$ and execution time by ~50%.
