export type Language = 'en' | 'ko' | 'ja' | 'zh';

export const LANGUAGES: { code: Language; label: string; flag: string }[] = [
  { code: 'en', label: 'English', flag: '🇺🇸' },
  { code: 'ko', label: '한국어', flag: '🇰🇷' },
  { code: 'ja', label: '日本語', flag: '🇯🇵' },
  { code: 'zh', label: '中文', flag: '🇨🇳' },
];

export type TranslationKey =
  | 'appTitle'
  | 'appSubtitle'
  | 'startGame'
  | 'howToPlay'
  | 'settings'
  | 'language'
  | 'back'
  | 'next'
  | 'previous'
  | 'confirm'
  | 'cancel'
  | 'play'
  | 'exit'
  | 'resume'
  | 'restart'
  | 'newGame'
  | 'mainMenu'
  // Setup
  | 'setupTitle'
  | 'selectPlayers'
  | 'players'
  | 'player'
  | 'selectAvatar'
  | 'enterName'
  | 'namePlaceholder'
  | 'beginnerMode'
  | 'beginnerModeDesc'
  | 'startMatch'
  // Avatars
  | 'avatarTiger'
  | 'avatarDragon'
  | 'avatarPhoenix'
  | 'avatarTurtle'
  | 'avatarCrane'
  | 'avatarDeer'
  | 'avatarBear'
  | 'avatarRabbit'
  // Game
  | 'currentTurn'
  | 'throwYut'
  | 'throwing'
  | 'selectPiece'
  | 'movePiece'
  | 'extraTurn'
  | 'capture'
  | 'carry'
  | 'finish'
  | 'winner'
  | 'gameOver'
  | 'playAgain'
  | 'elapsedTime'
  | 'turnTime'
  | 'gameTime'
  | 'lastThrow'
  | 'pieces'
  | 'home'
  | 'onBoard'
  | 'finished'
  // Yut results
  | 'yutDo'
  | 'yutGae'
  | 'yutGeol'
  | 'yutYut'
  | 'yutMo'
  | 'yutBackDo'
  | 'yutDoDesc'
  | 'yutGaeDesc'
  | 'yutGeolDesc'
  | 'yutYutDesc'
  | 'yutMoDesc'
  | 'yutBackDoDesc'
  // Tutorial
  | 'tutorialTitle'
  | 'tutorialIntro'
  | 'tutorialBoard'
  | 'tutorialBoardDesc'
  | 'tutorialYut'
  | 'tutorialYutDesc'
  | 'tutorialMovement'
  | 'tutorialMovementDesc'
  | 'tutorialCapture'
  | 'tutorialCaptureDesc'
  | 'tutorialCarry'
  | 'tutorialCarryDesc'
  | 'tutorialShortcut'
  | 'tutorialShortcutDesc'
  | 'tutorialWin'
  | 'tutorialWinDesc'
  | 'gotIt'
  | 'skip'
  | 'tutorialStep'
  // Hints
  | 'hintThrow'
  | 'hintSelectPiece'
  | 'hintChoosePath'
  | 'hintExtraTurn'
  | 'hintCaptured'
  | 'hintCarried'
  | 'hintFinished'
  | 'hintWinner'
  | 'hintBackDo'
  // Misc
  | 'soundOn'
  | 'soundOff'
  | 'musicOn'
  | 'musicOff'
  | 'volume'
  | 'tapToThrow'
  | 'clickToThrow'
  | 'dragToThrow'
  | 'swingToThrow'
  | 'beginnerHint'
  | 'shortcutAvailable'
  | 'mustTakeShortcut'
  | 'avoidCapture'
  | 'captureChance';

type TranslationDict = Record<TranslationKey, string>;

export const translations: Record<Language, TranslationDict> = {
  en: {
    appTitle: 'Yut Nori',
    appSubtitle: 'Korean Traditional Board Game',
    startGame: 'Start Game',
    howToPlay: 'How to Play',
    settings: 'Settings',
    language: 'Language',
    back: 'Back',
    next: 'Next',
    previous: 'Previous',
    confirm: 'Confirm',
    cancel: 'Cancel',
    play: 'Play',
    exit: 'Exit',
    resume: 'Resume',
    restart: 'Restart',
    newGame: 'New Game',
    mainMenu: 'Main Menu',
    setupTitle: 'Game Setup',
    selectPlayers: 'Number of Players',
    players: 'Players',
    player: 'Player',
    selectAvatar: 'Select Your Avatar',
    enterName: 'Enter Name',
    namePlaceholder: 'Your name',
    beginnerMode: 'Beginner Mode',
    beginnerModeDesc: 'Show hints and tutorials to learn the game',
    startMatch: 'Start Match',
    avatarTiger: 'Tiger',
    avatarDragon: 'Dragon',
    avatarPhoenix: 'Phoenix',
    avatarTurtle: 'Turtle',
    avatarCrane: 'Crane',
    avatarDeer: 'Deer',
    avatarBear: 'Bear',
    avatarRabbit: 'Rabbit',
    currentTurn: "Current Turn",
    throwYut: 'Throw Yut',
    throwing: 'Throwing...',
    selectPiece: 'Select a Piece',
    movePiece: 'Move Piece',
    extraTurn: 'Extra Turn!',
    capture: 'Capture!',
    carry: 'Carry',
    finish: 'Finish',
    winner: 'Winner',
    gameOver: 'Game Over',
    playAgain: 'Play Again',
    elapsedTime: 'Time',
    turnTime: 'Turn',
    gameTime: 'Game Time',
    lastThrow: 'Last Throw',
    pieces: 'Pieces',
    home: 'Home',
    onBoard: 'Board',
    finished: 'Done',
    yutDo: 'Do',
    yutGae: 'Gae',
    yutGeol: 'Geol',
    yutYut: 'Yut',
    yutMo: 'Mo',
    yutBackDo: 'Back-Do',
    yutDoDesc: 'Move 1 step',
    yutGaeDesc: 'Move 2 steps',
    yutGeolDesc: 'Move 3 steps',
    yutYutDesc: 'Move 4 steps + extra turn',
    yutMoDesc: 'Move 5 steps + extra turn',
    yutBackDoDesc: 'Move 1 step back',
    tutorialTitle: 'How to Play Yut Nori',
    tutorialIntro: 'Welcome to Yut Nori, a traditional Korean board game played for over 2,000 years!',
    tutorialBoard: 'The Board',
    tutorialBoardDesc: 'The board has 4 corners and a center. Pieces move counterclockwise around the outer path. At corners, you can choose to take a diagonal shortcut through the center.',
    tutorialYut: 'Throwing Yut',
    tutorialYutDesc: 'Throw 4 yut sticks. The combination of face-up sticks determines your move: Do (1), Gae (2), Geol (3), Yut (4, extra turn), Mo (5, extra turn), Back-Do (move back 1).',
    tutorialMovement: 'Moving Pieces',
    tutorialMovementDesc: 'Click a piece to select it, then click a highlighted position to move. You can move any of your pieces on the board, or bring a new piece from home.',
    tutorialCapture: 'Capturing',
    tutorialCaptureDesc: 'If you land on a position occupied by an opponent piece, you capture it! The captured piece goes back home, and you get an extra turn.',
    tutorialCarry: 'Carrying (Grouping)',
    tutorialCarryDesc: 'If you land on a position with your own piece, they stack and move together as one. This is powerful but risky - if captured, all stacked pieces go home!',
    tutorialShortcut: 'Diagonal Shortcuts',
    tutorialShortcutDesc: 'At each corner, you can choose to take the diagonal path through the center. This is shorter but can be risky. The center position is the meeting point of all diagonals.',
    tutorialWin: 'Winning',
    tutorialWinDesc: 'Be the first player to bring all 4 of your pieces around the board and back home. The first piece to complete the loop is on its way to victory!',
    gotIt: 'Got it!',
    skip: 'Skip',
    tutorialStep: 'Step',
    hintThrow: 'Tap the throw button to roll the yut sticks!',
    hintSelectPiece: 'Select one of your pieces to move it.',
    hintChoosePath: 'Tap a highlighted spot to move there.',
    hintExtraTurn: 'You earned an extra turn! Throw again.',
    hintCaptured: 'You captured an opponent piece! Extra turn!',
    hintCarried: 'Your pieces are grouped together now!',
    hintFinished: 'A piece has completed its journey!',
    hintWinner: 'Congratulations! You won the game!',
    hintBackDo: 'Back-Do! Move one step backward.',
    soundOn: 'Sound On',
    soundOff: 'Sound Off',
    musicOn: 'Music On',
    musicOff: 'Music Off',
    volume: 'Volume',
    tapToThrow: 'Tap to Throw',
    clickToThrow: 'Click to Throw',
    dragToThrow: 'Drag & Release',
    swingToThrow: 'Swing to Throw',
    beginnerHint: 'Beginner Tip',
    shortcutAvailable: 'Shortcut available at corner!',
    mustTakeShortcut: 'You can take a shortcut here!',
    avoidCapture: 'Careful! Opponent can capture you.',
    captureChance: 'You can capture an opponent!',
  },
  ko: {
    appTitle: '윷놀이',
    appSubtitle: '한국 전통 보드게임',
    startGame: '게임 시작',
    howToPlay: '게임 방법',
    settings: '설정',
    language: '언어',
    back: '뒤로',
    next: '다음',
    previous: '이전',
    confirm: '확인',
    cancel: '취소',
    play: '플레이',
    exit: '나가기',
    resume: '계속하기',
    restart: '다시 시작',
    newGame: '새 게임',
    mainMenu: '메인 메뉴',
    setupTitle: '게임 설정',
    selectPlayers: '플레이어 수',
    players: '명',
    player: '플레이어',
    selectAvatar: '아바타 선택',
    enterName: '이름 입력',
    namePlaceholder: '이름',
    beginnerMode: '초보자 모드',
    beginnerModeDesc: '힌트와 튜토리얼을 보여줍니다',
    startMatch: '게임 시작',
    avatarTiger: '호랑이',
    avatarDragon: '용',
    avatarPhoenix: '봉황',
    avatarTurtle: '거북이',
    avatarCrane: '학',
    avatarDeer: '사슴',
    avatarBear: '곰',
    avatarRabbit: '토끼',
    currentTurn: '차례',
    throwYut: '윷 던지기',
    throwing: '던지는 중...',
    selectPiece: '말을 선택하세요',
    movePiece: '말 이동',
    extraTurn: '한 번 더!',
    capture: '잡았다!',
    carry: '업기',
    finish: '골인',
    winner: '우승자',
    gameOver: '게임 종료',
    playAgain: '다시 하기',
    elapsedTime: '시간',
    turnTime: '차례',
    gameTime: '게임 시간',
    lastThrow: '마지막 윷',
    pieces: '말',
    home: '대기',
    onBoard: '판 위',
    finished: '도착',
    yutDo: '도',
    yutGae: '개',
    yutGeol: '걸',
    yutYut: '윷',
    yutMo: '모',
    yutBackDo: '빽도',
    yutDoDesc: '1칸 이동',
    yutGaeDesc: '2칸 이동',
    yutGeolDesc: '3칸 이동',
    yutYutDesc: '4칸 이동 + 한 번 더',
    yutMoDesc: '5칸 이동 + 한 번 더',
    yutBackDoDesc: '1칸 뒤로',
    tutorialTitle: '윷놀이 하는 법',
    tutorialIntro: '윷놀이에 오신 것을 환영합니다! 2천 년 역사의 한국 전통 놀이입니다.',
    tutorialBoard: '윷판',
    tutorialBoardDesc: '윷판은 4개의 모서리와 중심이 있습니다. 말은 바깥쪽으로 반시계 방향으로 이동합니다. 모서리에서는 대각선 지름길을 탈 수 있습니다.',
    tutorialYut: '윷 던지기',
    tutorialYutDesc: '4개의 윷가락을 던집니다. 앞면이 보이는 가락 수에 따라: 도(1), 개(2), 걸(3), 윷(4, 한 번 더), 모(5, 한 번 더), 빽도(뒤로 1).',
    tutorialMovement: '말 이동',
    tutorialMovementDesc: '말을 클릭하여 선택하고, 빛나는 칸을 클릭하여 이동하세요. 판 위의 말을 이동하거나 대기 중인 새 말을 꺼낼 수 있습니다.',
    tutorialCapture: '말 잡기',
    tutorialCaptureDesc: '상대방 말이 있는 칸에 도착하면 잡습니다! 잡힌 말은 대기실로 돌아가고, 한 번 더 던질 수 있습니다.',
    tutorialCarry: '업기',
    tutorialCarryDesc: '내 말이 있는 칸에 도착하면 겹쳐서 함께 이동합니다. 강력하지만 위험합니다 - 잡히면 모두 대기실로!',
    tutorialShortcut: '지름길',
    tutorialShortcutDesc: '모서리에서 중심을 통과하는 대각선 길을 선택할 수 있습니다. 짧지만 위험할 수 있습니다. 중심은 모든 대각선이 만나는 곳입니다.',
    tutorialWin: '승리 조건',
    tutorialWinDesc: '4개의 말을 모두 한 바퀴 돌아 대기실로 가져오는 사람이 승리합니다!',
    gotIt: '알겠어요!',
    skip: '건너뛰기',
    tutorialStep: '단계',
    hintThrow: '윷 던지기 버튼을 누르세요!',
    hintSelectPiece: '이동할 말을 선택하세요.',
    hintChoosePath: '빛나는 칸을 눌러 이동하세요.',
    hintExtraTurn: '한 번 더 던질 수 있어요!',
    hintCaptured: '상대방 말을 잡았습니다! 한 번 더!',
    hintCarried: '말이 업혔습니다!',
    hintFinished: '말이 한 바퀴를 돌았습니다!',
    hintWinner: '축하합니다! 승리했습니다!',
    hintBackDo: '빽도! 한 칸 뒤로 이동합니다.',
    soundOn: '소리 켜기',
    soundOff: '소리 끄기',
    musicOn: '음악 켜기',
    musicOff: '음악 끄기',
    volume: '볼륨',
    tapToThrow: '터치해서 던지기',
    clickToThrow: '클릭해서 던지기',
    dragToThrow: '끌어서 던지기',
    swingToThrow: '흔들어 던지기',
    beginnerHint: '초보자 팁',
    shortcutAvailable: '모서리에서 지름길 가능!',
    mustTakeShortcut: '여기서 지름길을 갈 수 있어요!',
    avoidCapture: '조심! 상대가 잡을 수 있어요.',
    captureChance: '상대 말을 잡을 수 있어요!',
  },
  ja: {
    appTitle: 'ユンノリ',
    appSubtitle: '韓国の伝統ボードゲーム',
    startGame: 'ゲーム開始',
    howToPlay: '遊び方',
    settings: '設定',
    language: '言語',
    back: '戻る',
    next: '次へ',
    previous: '前へ',
    confirm: '確認',
    cancel: 'キャンセル',
    play: 'プレイ',
    exit: '終了',
    resume: '再開',
    restart: 'やり直し',
    newGame: '新しいゲーム',
    mainMenu: 'メインメニュー',
    setupTitle: 'ゲーム設定',
    selectPlayers: 'プレイヤー数',
    players: '人',
    player: 'プレイヤー',
    selectAvatar: 'アバター選択',
    enterName: '名前入力',
    namePlaceholder: '名前',
    beginnerMode: '初心者モード',
    beginnerModeDesc: 'ヒントとチュートリアルを表示',
    startMatch: 'マッチ開始',
    avatarTiger: '虎',
    avatarDragon: '龍',
    avatarPhoenix: '鳳凰',
    avatarTurtle: '亀',
    avatarCrane: '鶴',
    avatarDeer: '鹿',
    avatarBear: '熊',
    avatarRabbit: '兎',
    currentTurn: 'ターン',
    throwYut: 'ユット投げ',
    throwing: '投げています...',
    selectPiece: 'コマを選択',
    movePiece: 'コマ移動',
    extraTurn: 'もう一回！',
    capture: 'キャプチャ！',
    carry: '背負う',
    finish: 'ゴール',
    winner: '勝者',
    gameOver: 'ゲーム終了',
    playAgain: 'もう一度',
    elapsedTime: '時間',
    turnTime: 'ターン',
    gameTime: 'ゲーム時間',
    lastThrow: '最後の投擲',
    pieces: 'コマ',
    home: '待機',
    onBoard: '盤上',
    finished: '到着',
    yutDo: 'ド',
    yutGae: 'ガエ',
    yutGeol: 'ゴル',
    yutYut: 'ユット',
    yutMo: 'モ',
    yutBackDo: 'ペクド',
    yutDoDesc: '1マス移動',
    yutGaeDesc: '2マス移動',
    yutGeolDesc: '3マス移動',
    yutYutDesc: '4マス移動 + もう一回',
    yutMoDesc: '5マス移動 + もう一回',
    yutBackDoDesc: '1マス後退',
    tutorialTitle: 'ユンノリの遊び方',
    tutorialIntro: 'ユンノリへようこそ！2000年以上の歴史を持つ韓国の伝統ゲームです。',
    tutorialBoard: 'ボード',
    tutorialBoardDesc: 'ボードには4つの角と中心があります。コマは外周を反時計回りに進みます。角では中心を通る近道を選べます。',
    tutorialYut: 'ユット投げ',
    tutorialYutDesc: '4本の棒を投げます。表の数で移動が決まります：ド(1)、ガエ(2)、ゴル(3)、ユット(4、もう一回)、モ(5、もう一回)、ペクド(後退1)。',
    tutorialMovement: 'コマ移動',
    tutorialMovementDesc: 'コマをクリックして選択し、ハイライトされた場所をクリックして移動します。',
    tutorialCapture: 'キャプチャ',
    tutorialCaptureDesc: '相手のコマがある場所に着くとキャプチャ！相手コマは戻り、もう一回投げられます。',
    tutorialCarry: '背負い',
    tutorialCarryDesc: '自分のコマがある場所に着くと重なって一緒に動きます。強力ですが危険です。',
    tutorialShortcut: '近道',
    tutorialShortcutDesc: '角で中心を通る近道を選べます。短いですが危険な場合もあります。',
    tutorialWin: '勝利条件',
    tutorialWinDesc: '4つのコマをすべて一周させて最初に帰らせた人の勝ち！',
    gotIt: '了解！',
    skip: 'スキップ',
    tutorialStep: 'ステップ',
    hintThrow: '投げるボタンをタップ！',
    hintSelectPiece: '移動するコマを選んでください。',
    hintChoosePath: 'ハイライトをタップして移動。',
    hintExtraTurn: 'もう一回投げられます！',
    hintCaptured: '相手コマをキャプチャ！もう一回！',
    hintCarried: 'コマが重なりました！',
    hintFinished: 'コマが一周しました！',
    hintWinner: 'おめでとう！勝利しました！',
    hintBackDo: 'ペクド！1マス後退。',
    soundOn: 'サウンド オン',
    soundOff: 'サウンド オフ',
    musicOn: '音楽オン',
    musicOff: '音楽オフ',
    volume: '音量',
    tapToThrow: 'タップして投げる',
    clickToThrow: 'クリックして投げる',
    dragToThrow: 'ドラッグして投げる',
    swingToThrow: '振って投げる',
    beginnerHint: '初心者ヒント',
    shortcutAvailable: '角で近道可能！',
    mustTakeShortcut: 'ここで近道ができます！',
    avoidCapture: '注意！相手がキャプチャできるかも。',
    captureChance: '相手コマをキャプチャできる！',
  },
  zh: {
    appTitle: '柶戏',
    appSubtitle: '韩国传统棋盘游戏',
    startGame: '开始游戏',
    howToPlay: '游戏规则',
    settings: '设置',
    language: '语言',
    back: '返回',
    next: '下一步',
    previous: '上一步',
    confirm: '确认',
    cancel: '取消',
    play: '开始',
    exit: '退出',
    resume: '继续',
    restart: '重新开始',
    newGame: '新游戏',
    mainMenu: '主菜单',
    setupTitle: '游戏设置',
    selectPlayers: '玩家数量',
    players: '人',
    player: '玩家',
    selectAvatar: '选择头像',
    enterName: '输入名字',
    namePlaceholder: '名字',
    beginnerMode: '初学者模式',
    beginnerModeDesc: '显示提示和教程',
    startMatch: '开始对战',
    avatarTiger: '虎',
    avatarDragon: '龙',
    avatarPhoenix: '凤',
    avatarTurtle: '龟',
    avatarCrane: '鹤',
    avatarDeer: '鹿',
    avatarBear: '熊',
    avatarRabbit: '兔',
    currentTurn: '当前回合',
    throwYut: '掷柶',
    throwing: '投掷中...',
    selectPiece: '选择棋子',
    movePiece: '移动棋子',
    extraTurn: '再投一次！',
    capture: '吃子！',
    carry: '背子',
    finish: '到达终点',
    winner: '获胜者',
    gameOver: '游戏结束',
    playAgain: '再玩一次',
    elapsedTime: '时间',
    turnTime: '回合',
    gameTime: '游戏时间',
    lastThrow: '上次掷柶',
    pieces: '棋子',
    home: '待机',
    onBoard: '盘上',
    finished: '完成',
    yutDo: '到',
    yutGae: '狗',
    yutGeol: '步',
    yutYut: '柶',
    yutMo: '毛',
    yutBackDo: '白柶',
    yutDoDesc: '前进1步',
    yutGaeDesc: '前进2步',
    yutGeolDesc: '前进3步',
    yutYutDesc: '前进4步 + 再投一次',
    yutMoDesc: '前进5步 + 再投一次',
    yutBackDoDesc: '后退1步',
    tutorialTitle: '柶戏玩法',
    tutorialIntro: '欢迎来到柶戏！拥有2000多年历史的韩国传统游戏。',
    tutorialBoard: '棋盘',
    tutorialBoardDesc: '棋盘有4个角和1个中心。棋子沿外圈逆时针移动。在角上可以选择穿过中心的对角捷径。',
    tutorialYut: '掷柶',
    tutorialYutDesc: '投掷4根木棒。正面朝上的数量决定移动：到(1)、狗(2)、步(3)、柶(4、再投)、毛(5、再投)、白柶(后退1)。',
    tutorialMovement: '移动棋子',
    tutorialMovementDesc: '点击棋子选择，再点击高亮位置移动。可以移动盘上的棋子或从待机区放出新棋子。',
    tutorialCapture: '吃子',
    tutorialCaptureDesc: '到达对方棋子所在位置就吃掉它！被吃的棋子回待机区，你再投一次。',
    tutorialCarry: '背子',
    tutorialCarryDesc: '到达自己棋子所在位置会叠加一起移动。强大但有风险 - 被吃则全部回去！',
    tutorialShortcut: '对角捷径',
    tutorialShortcutDesc: '在角上可选择穿过中心的捷径。短但有风险。中心是所有对角线的交汇点。',
    tutorialWin: '获胜条件',
    tutorialWinDesc: '第一个将所有4个棋子绕一圈带回待机区的玩家获胜！',
    gotIt: '明白了！',
    skip: '跳过',
    tutorialStep: '步骤',
    hintThrow: '点击投掷按钮！',
    hintSelectPiece: '选择要移动的棋子。',
    hintChoosePath: '点击高亮位置移动。',
    hintExtraTurn: '可以再投一次！',
    hintCaptured: '吃掉对方棋子！再投一次！',
    hintCarried: '棋子已叠加！',
    hintFinished: '棋子完成一圈！',
    hintWinner: '恭喜！你赢了！',
    hintBackDo: '白柶！后退一步。',
    soundOn: '音效开',
    soundOff: '音效关',
    musicOn: '音乐开',
    musicOff: '音乐关',
    volume: '音量',
    tapToThrow: '点击投掷',
    clickToThrow: '点击投掷',
    dragToThrow: '拖拽投掷',
    swingToThrow: '甩动投掷',
    beginnerHint: '初学者提示',
    shortcutAvailable: '角上可走捷径！',
    mustTakeShortcut: '这里可以走捷径！',
    avoidCapture: '小心！对方可以吃你。',
    captureChance: '可以吃对方棋子！',
  },
};

export function t(lang: Language, key: TranslationKey): string {
  return translations[lang][key] ?? key;
}
