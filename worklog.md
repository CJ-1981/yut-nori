# Yut Nori Game Development Worklog

---
Task ID: 1
Agent: Main (Super Z)
Task: Build a Yut Nori (Korean traditional board game) with Korean traditional graphics, sound effects, turn-based multiplayer, beginner mode, mobile/PC responsive UI, avatar selection, game timer, 3D yut throwing animation, and multi-language support (default English).

Work Log:
- Initialized fullstack development environment (Next.js 16 + TypeScript + Tailwind CSS 4 + shadcn/ui)
- Installed Three.js + @react-three/fiber + @react-three/drei for 3D animations
- Created multi-language i18n system (English, Korean, Japanese, Chinese) with React Context
- Implemented Yut Nori game logic:
  * 21-position board (5x5 grid with 4 diagonal midpoints + center)
  * Yut stick throwing with proper probabilities (Do/Gae/Geol/Yut/Mo/Back-do)
  * Movement rules including diagonal shortcuts at corners
  * Capture and carry (grouping) mechanics
  * Win condition (all 4 pieces return home)
- Built Zustand game store with full state management for turn-based multiplayer (2-4 players)
- Created Web Audio API-based sound system generating Korean traditional-style sounds:
  * Yut throw whoosh, stick hits, landing
  * Result sounds for each Yut outcome (Do/Gae/Geol/Yut/Mo/Back-do)
  * Capture, carry, finish, victory fanfares
  * Drum and gong sounds for traditional feel
  * Optional ambient background music
- Built 3D yut throwing animation with React Three Fiber:
  * 4 individual yut sticks with physics-like animation
  * Throw arc + landing animation
  * Sticks settle to show the actual throw result
  * Lighting and shadows for visual depth
- Designed Korean traditional-style UI:
  * Hanji paper-textured board with traditional color palette (amber/orange/red)
  * Hanja characters at corners (出/樂/福/寿) and center (中)
  * Traditional pattern decorations
- Implemented responsive layout (mobile-first with desktop enhancements):
  * Mobile: vertical layout with horizontal scrolling player panels
  * Desktop: 3-column layout (players | board | throw panel)
- Built avatar selection system (8 animal avatars: Tiger, Dragon, Phoenix, Turtle, Crane, Deer, Bear, Rabbit)
- Implemented game timer (game time + turn time)
- Created beginner mode with:
  * In-game hints
  * 8-step tutorial screen with illustrations
  * Shortcut indicators on board
- Added skip-turn handling for when no moves are possible (e.g., Back-Do with all pieces at home)
- Per-piece pathType tracking for correct diagonal movement continuation
- Used Agent Browser to verify end-to-end functionality:
  * Menu navigation works
  * Setup screen (player count, avatars) works
  * Tutorial screen displays correctly
  * Game starts and renders board properly
  * 3D yut throwing animation plays
  * Throw results are displayed
  * Piece selection and movement works
  * Turn transitions work
  * Language switching works (verified Korean)
  * Mobile viewport layout works
  * 4-player multiplayer works

Stage Summary:
- All requested features implemented and verified:
  ✅ Korean traditional graphics (Hanji texture, Hanja characters, traditional color palette)
  ✅ Sound effects (Web Audio API generated, traditional drum/gong sounds)
  ✅ Turn-based multiplayer (2-4 players, pass-and-play)
  ✅ Beginner mode (tutorial + in-game hints)
  ✅ Mobile and PC responsive UI
  ✅ Avatar selection (8 unique animal avatars per player)
  ✅ Game timer (total game time + per-turn time)
  ✅ 3D yut throwing animation (React Three Fiber with physics-like motion)
  ✅ Multi-language support (English default + Korean/Japanese/Chinese)
- Lint passes cleanly
- Dev server runs without errors
- Browser-verified interactivity (menu navigation, game play, language switching, mobile layout)

Files created:
- src/lib/i18n/translations.ts (4 languages)
- src/lib/i18n/I18nContext.tsx
- src/lib/game/types.ts
- src/lib/game/board.ts (board logic, movement rules, yut throwing)
- src/lib/game/store.ts (Zustand store)
- src/lib/sound/sounds.ts (Web Audio sound manager)
- src/components/yut/YutThrow3D.tsx (Three.js 3D animation)
- src/components/yut/YutBoard.tsx (SVG board with Korean design)
- src/components/yut/YutThrowPanel.tsx (throw button + drag interaction)
- src/components/yut/PlayerPanel.tsx (player info + timer)
- src/components/screens/MainMenu.tsx
- src/components/screens/SetupScreen.tsx (player count + avatar selection)
- src/components/screens/TutorialScreen.tsx (8-step tutorial)
- src/components/screens/GameScreen.tsx (main game + game over)
- src/app/page.tsx (router)
- src/app/layout.tsx (metadata + viewport)

---
Task ID: 2
Agent: Main (Super Z)
Task: Apply 5 improvements to Yut Nori game: (1) white background for 3D yut throwing animation, (2) piece movement animation, (3) auto-select piece when no pieces on board, (4) verify/improve capture mechanic, (5) fix mobile language selector being hidden behind title.

Work Log:
- Changed 3D yut throw animation background from dark to white:
  * Updated Ground plane color from #3D2817 to #FFFFFF
  * Changed Canvas background to solid white (alpha: false)
  * Added explicit `<color attach="background">` for Three.js scene
  * Increased ambient light intensity (0.4 → 0.7) and directional light (1.0 → 1.2) for better stick visibility
  * Changed overlay container from bg-black/70 to bg-white
  * Updated continue button to dark (bg-stone-800) for contrast on white
- Added piece movement animation:
  * Refactored YutBoard piece rendering from position-grouped to individual piece-based
  * Each piece now uses CSS `transform: translate()` with `transition: transform 0.6s cubic-bezier(0.34, 1.56, 0.64, 1)` for smooth spring-like movement
  * Pieces animate independently to their target positions
  * Removed unused piecesByPosition useMemo
- Added auto-select piece feature:
  * When entering selecting phase with no pieces on board, auto-selects first home piece
  * When only one piece is on board, auto-selects it (only one valid choice)
  * Uses 300ms delay for smooth UX
- Improved capture mechanic:
  * Capture now also captures pieces being carried by the captured piece (chain capture)
  * Carry (grouping) now includes sub-carried pieces
  * Added capture sound effect playback via useEffect on lastMoveMessage
  * Enhanced capture toast with red ring and "×count" indicator
  * Added finish toast with green ring styling
- Fixed mobile language selector position:
  * Replaced absolute-positioned small buttons with a full-width top bar
  * Top bar has bg-white/80 backdrop-blur with border-bottom for clear separation
  * Language buttons now in a pill-shaped container with amber background
  * Added min-width (32px) for touch-friendly targets
  * Added title/aria-label for accessibility
  * Added mt-12 sm:mt-8 to content to prevent overlap with top bar
- Verified all changes via Agent Browser:
  * 3D animation shows white background with clearly visible brown sticks
  * Pieces smoothly animate when moving to new positions
  * Auto-select works (hint changes from "Select a Piece" to "Tap a highlighted spot")
  * Throw results (Do, Gae, Yut) all work correctly
  * Extra turn from Yut/Mo works
  * Mobile language buttons are clearly visible and clickable
  * Language switching works on both mobile and desktop
  * No console errors

Stage Summary:
All 5 improvements successfully implemented and browser-verified:
✅ 3D yut throw animation has white background for clear stick visibility
✅ Pieces animate smoothly with spring-like transition between positions
✅ Auto-select piece when board is empty or only one piece available
✅ Capture mechanic improved (chain capture for carried pieces, enhanced UI feedback)
✅ Mobile language selector moved to dedicated top bar (no longer hidden by title)
- Lint passes cleanly
- Dev server runs without errors

---
Task ID: 3
Agent: Main (Super Z)
Task: Fix 3D yut stick front/back distinction and animation background overlap/glitch issues.

Work Log:
- Completely redesigned 3D yut stick model for clear front/back distinction:
  * Front (round side): LIGHT bamboo color (#E8C887) with end caps (#D4A856)
  * Back (flat side): DARK brown (#2D1810) thin box
  * Added RED marker line (#DC2626) on the flat/back side for extra visibility when back faces up
  * Clear visual contrast: light beige vs dark brown
- Fixed sticks appearing to "stand upright" issue:
  * Root cause: cylinder default axis is Y (vertical), so rotation 0 = standing
  * Solution: Added base Z rotation of PI/2 to lay sticks horizontally
  * Front/back now distinguished by X-axis flip (0 = round up, PI = flat up)
  * Sticks properly rest on ground at Y=0.13 (radius height)
- Fixed animation background overlap/glitch:
  * Reduced throw arc height (4 → 2.2) to keep sticks within camera view
  * Reduced horizontal spread during throw to prevent going off-screen
  * Reduced spin speed (8-14 → 6-10) for smoother motion
  * Added fog effect for depth perception
  * Increased shadow map resolution (1024 → 2048) and added shadow-bias for cleaner shadows
  * Changed background from pure white (#FFFFFF) to soft off-white (#FAFAF7) to reduce harsh contrast
  * Result overlay moved from bottom to top to avoid overlapping settled sticks
  * Overlay container now uses max-w-3xl for better proportion
- Enhanced lighting for stick visibility:
  * Ambient light: 0.7 → 0.85
  * Directional light: 1.2 → 1.3 with second fill light
  * Added point light for highlights
- Verified via VLM (Vision Language Model) analysis:
  * Sticks clearly visible with distinct light/dark contrast
  * Red markers visible on back sides
  * Sticks properly lying flat on ground after landing
  * No clipping, floating, or rendering glitches
  * Background clean and minimal

Stage Summary:
Both issues resolved and visually verified:
✅ 3D yut sticks have clear front/back distinction (light bamboo front, dark brown back, red marker)
✅ Sticks lie flat on ground (not standing) with proper rotation
✅ Animation stays within camera view without background overlap
✅ No rendering glitches (clipping, floating, Z-fighting)
✅ Clean white/off-white background for clear stick visibility

---
Task ID: 4
Agent: Main (Super Z)
Task: Fix 6 gameplay issues: (1) enlarge touch area for highlighted positions, (2) fix piece starting logic (start at position 0, Do moves to position 1), (3) fix movement direction to counterclockwise, (4) raise 3D camera angle, (5) remove red line marker, (6) fix position selection when opponent piece is present.

Work Log:
- Fixed board movement direction from clockwise to counterclockwise:
  * Reordered BOARD_POSITIONS array: outer ring now goes bottom-right → UP along right → LEFT along top → DOWN along left → RIGHT along bottom
  * Updated corner positions: 0=bottom-right, 4=top-right, 8=top-left, 12=bottom-left
  * Updated diagonal paths to match new corner positions:
    - d0: corner 0 (bottom-right) → 16 → 20 → 17 → 8 (top-left)
    - d4: corner 4 (top-right) → 19 → 20 → 18 → 12 (bottom-left)
    - d8: corner 8 (top-left) → 17 → 20 → 16 → 0 (bottom-right)
    - d12: corner 12 (bottom-left) → 18 → 20 → 19 → 4 (top-right)
  * PREV_MAP updated for Back-Do
- Fixed piece starting logic:
  * When piece comes out of home, it appears at start (position 0) and moves FULL throw value forward
  * Do(1) = position 1, Gae(2) = position 2, Geol(3) = position 3, Yut(4) = position 4, Mo(5) = position 5
  * Removed special case for steps===1 that incorrectly placed piece at position 0
- Enlarged touch area for highlighted positions:
  * Added large invisible touch target circle (r=28) for highlighted positions
  * Increased highlight ring radius from 18→20 and glow from 24→26
  * Added onTouchStart handler for mobile responsiveness
  * Position dots now have pointerEvents: 'none' (clicks handled by touch target)
  * Minimum 44px touch target requirement met
- Raised 3D camera angle:
  * Changed camera position from [0, 3.0, 4.5] to [0, 4.5, 3.5] (higher, more top-down view)
  * Changed FOV from 45 to 50 for wider view
  * Increased lighting: ambient 0.85→0.9, directional 1.3→1.4, raised light positions
  * Updated fog distance for better depth perception
- Removed red line marker from yut sticks:
  * Removed the red boxGeometry marker that was on the flat/dark side
  * Front/back distinction now relies purely on color contrast (light bamboo vs dark brown)
- Fixed position selection when opponent piece is present:
  * When a position is a possible move target, pieces at that position have pointerEvents: 'none'
  * This allows clicks to pass through to the position's touch target
  * Pieces only capture clicks when their position is NOT a move target
  * All piece child elements (shadow, body, text) have pointerEvents: 'none'

Stage Summary:
All 6 issues resolved and browser-verified:
✅ Touch area enlarged (r=28 invisible target, 44px+ minimum)
✅ Piece starting logic fixed (Do=position 1, not position 0)
✅ Movement direction corrected to counterclockwise (up along right side first)
✅ 3D camera angle raised (top-down view, sticks clearly visible)
✅ Red line marker removed (clean color contrast only)
✅ Position selection works even with opponent pieces present (pointer events pass-through)
- Lint passes cleanly
- VLM verified: camera angle high, no red markers, large touch targets

---
Task ID: 5
Agent: Main (Super Z)
Task: Raise 3D camera angle further - sticks still looked flat from previous angle.

Work Log:
- Raised camera position significantly:
  * From [0, 4.5, 3.5] to [0, 8, 1.5] (much higher, nearly top-down view)
  * FOV reduced from 50 to 45 for less distortion at height
- Increased stick thickness for better visibility from top:
  * Radius: 0.13 → 0.18 (40% thicker)
  * Length: 2.0 → 1.8 (slightly shorter for better proportion)
  * Flat back box: 0.06 → 0.08 depth (thicker)
- Updated resting Y position from 0.13 to 0.18 to match new radius
- Enhanced lighting for top-down view:
  * Ambient: 0.9 → 0.95
  * Main directional: position [3,8,4] → [2,12,3], intensity 1.4 → 1.5
  * Fill light: position [-3,6,-2] → [-3,8,-2], intensity 0.5 → 0.6
  * Point light: position [0,5,2] → [0,6,2], intensity 0.4 → 0.5
  * Shadow camera bounds expanded to ±6

Stage Summary:
- VLM verified: camera angle now 70-80 degrees (near top-down "God's eye" view)
- Sticks visible as 3D objects with clear thickness (not flat)
- Top surfaces clearly visible
- Color distinction between top (light) and edge (dark) is clear

---
Task ID: 6
Agent: Main (Super Z)
Task: (1) Rotate camera 90 degrees after yut landing to show all sticks, (2) Enlarge piece and board dot sizes.

Work Log:
- Added CameraController component for dynamic camera animation:
  * Phase 1 (0-1.7s): Top-down view during throw and landing
  * Phase 2 (1.7-2.0s): Brief pause at top-down after landing
  * Phase 3 (2.0-3.2s): Smooth camera rotation from top-down [0,8,1.5] to side view [0,2.5,5.5]
  * Phase 4 (3.2s+): Hold side view showing all sticks with 3D depth
  * Uses ease-out cubic interpolation for smooth motion
  * Camera lookAt target adjusts from [0,0,0] to [0,0.15,0] for side view
- Updated animation timing in YutThrowPanel:
  * Result display delayed from 2200ms to 3300ms (after camera rotation completes)
  * Auto-continue delay increased from 2500ms to 3500ms
- Enlarged board position dots:
  * Regular dots: r=7 → r=11
  * Corner dots: r=12 → r=18
  * Center dot: r=14 → r=20
  * Highlight ring: r=20 → r=28
  * Touch target: r=28 → r=38
  * Glow circle: r=26 → r=34
  * Stroke widths increased (1.5→2, 3.5→4)
  * Font sizes increased (9→12, 14→18)
- Enlarged game pieces:
  * Piece body: r=11 → r=19
  * Selected highlight: r=16 → r=26
  * Shadow: rx=10 → rx=18
  * Emoji font: 13 → 22
  * Stack spacing: 14 → 22
  * Stack indicator font: 10 → 14
  * Stroke widths increased (1.5→2.5, 3→4)

Stage Summary:
Both features verified via VLM:
✅ Camera rotates 90 degrees from top-down to side view after landing
✅ All 4 sticks visible from side perspective showing 3D shape/thickness
✅ Board dots are large and clearly visible
✅ Corner dots larger than regular dots, center dot prominent
✅ Pieces significantly larger than board dots (1.5-2x), easy to see and interact with

---
Task ID: 7
Agent: Main (Super Z)
Task: (1) Add animation when piece moves from home to start position, (2) Change camera angle to top-down after yut landing, (3) Allow user to control camera angle in real-time with fingers.

Work Log:
- Added piece spawn animation from home to board:
  * Home pieces now rendered on board at corner positions (smaller scale 0.65)
  * When piece moves from home, store first moves it to position 0 (start), then after 500ms delay moves to final position
  * CSS transition creates smooth slide animation: home → start → final position
  * Added HOME_POSITIONS array for each player's home area (4 corners outside board)
  * Home pieces are smaller and non-interactive
- Changed camera angle after landing from side view to high angle top-down:
  * Start camera: [0, 8, 0.5] (nearly straight down)
  * End camera: [0, 5.5, 4] (high angle looking down at sticks)
  * Shows all sticks clearly from above at an angle
- Added real-time camera control with OrbitControls (drei):
  * InteractiveControls component enabled after camera animation completes
  * User can drag to rotate camera (enableRotate)
  * User can pinch/scroll to zoom (enableZoom)
  * Pan disabled to keep focus on sticks (enablePan=false)
  * Polar angle limits: 0.1 (nearly top-down) to PI/2-0.1 (not below ground)
  * Zoom limits: 3 to 10 distance
  * touchAction: 'none' on canvas for proper touch handling
  * Added "👆 Drag to rotate camera · Pinch to zoom" hint
- Used key prop on SceneContent to reset state on new throw (avoids setState in effect lint error)

Stage Summary:
All 3 features verified via VLM:
✅ Home pieces visible at board corners (smaller, non-interactive)
✅ Pieces animate from home → start → final position when brought out
✅ Camera rotates to high angle top-down view after landing
✅ All 4 sticks clearly visible from above
✅ OrbitControls enabled for user camera manipulation (rotate + zoom)

---
Task ID: 8
Agent: Main (Super Z)
Task: Change board from 5x5 to 6x6 grid so Mo (5 steps) exactly reaches the next corner.

Work Log:
- Redesigned board.ts for 6x6 grid (coordinates 0-5):
  * Outer ring: 20 positions (0-19), 5 steps between corners
  * Corners at positions 0 (bottom-right/start), 5 (top-right), 10 (top-left), 15 (bottom-left)
  * Diagonal A: corner 0 → positions 20-23 → corner 10 (5 intervals)
  * Diagonal B: corner 5 → positions 24-27 → corner 15 (5 intervals)
  * Total: 28 positions (20 outer + 8 diagonal intermediates)
  * No shared center point (6x6 grid has no center intersection)
- Updated NEXT_MAP for counterclockwise outer ring (0→1→...→19→0)
- Updated diagonal paths:
  * d0: 0→20→21→22→23→10 (bottom-right to top-left)
  * d5: 5→24→25→26→27→15 (top-right to bottom-left)
  * d10: 10→23→22→21→20→0 (reverse of d0, ends at start = finish)
  * d15: 15→27→26→25→24→5 (reverse of d5)
- Updated PREV_MAP for Back-Do
- Updated DIAGONAL_ENTRY for new corners (0→d0, 5→d5, 10→d10, 15→d15)
- Updated step() function for new corner/diagonal transitions
- Updated YutBoard SVG rendering:
  * GRID_SIZE = (BOARD_SIZE - PADDING*2) / 5 (was /4)
  * Outer ring renders 20 positions instead of 16
  * Diagonal lines connect corner to corner through 4 intermediate points
  * Corner labels updated: 出(0), 福(5), 寿(10), 樂(15)
  * Removed center "中" text and centerGlow (no center in 6x6)
  * Removed isCenter import and usage

Stage Summary:
- Board is now 6x6 with 6 dots per side and 5 intervals between corners
- Mo (5 steps) exactly reaches the next corner from start
- Do(1)=1 step, Gae(2)=2 steps, Geol(3)=3 steps, Yut(4)=4 steps, Mo(5)=5 steps (next corner)
- Diagonal shortcuts available at all 4 corners
- VLM verified: 6 dots per side, 5 intervals, correct corner labels, diagonals present
- Piece movement verified: Do moves piece exactly 1 position from start

---
Task ID: 9
Agent: Main (Super Z)
Task: (1) Replace 4 center intermediate points with one large center circle, (2) Make 4 yut sticks scatter (not in a line) when landing.

Work Log:
- Redesigned board with shared center point:
  * Added CENTER_POSITION = 20 at coordinates (2.5, 2.5)
  * Reduced total positions from 28 to 25 (20 outer + 1 center + 4 diagonal intermediates)
  * Diagonal A: corner 0 → 21(4.17,0.83) → center(20) → 22(0.83,4.17) → corner 10
  * Diagonal B: corner 5 → 23(4.17,4.17) → center(20) → 24(0.83,0.83) → corner 15
  * Both diagonals pass through center (5 intervals each)
  * Updated NEXT_MAP, PREV_MAP for new diagonal paths through center
- Updated YutBoard rendering:
  * Diagonal lines now connect: 0→21→20→22→10 and 5→23→20→24→15
  * Center rendered as large distinctive circle (r=20, red #C9184A with "中" character)
  * Center has glow halo (r=26, light amber)
  * Diagonal intermediate points (21-24) not rendered as dots (only on lines)
  * Restored isCenter() function and import
- Made yut sticks scatter on landing:
  * Changed from linear arrangement to 2x2 grid pattern
  * Grid positions: index 0=(-1,-1), 1=(1,-1), 2=(-1,1), 3=(1,1)
  * Added small random offset (seed.offsetX * 0.15) for natural scatter
  * Added rotation variation per stick for natural look
  * Sticks now land in 2 pairs (upper and lower), clearly separated

Stage Summary:
Both features verified via VLM:
✅ Large red center circle with "中" character at board center
✅ Diagonal lines pass through center circle
✅ Only one big circle (not 4 small dots) at center
✅ 6 dots per side confirmed on outer square
✅ 4 yut sticks scattered (not in line) after landing
✅ All 4 sticks clearly visible in scattered arrangement
