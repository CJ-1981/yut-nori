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
