// Simulate the store logic manually to verify the fix.
// Mirrors src/lib/game/store.ts createInitialPlayers, setNumPlayers, startGame.

const AVATAR_IDS = ['tiger','dragon','phoenix','turtle','crane','deer','bear','rabbit'];
const PLAYER_STARTS = ['tiger','dragon','phoenix','turtle'];

function createInitialPlayers(num) {
  return Array.from({length:num}, (_,i) => ({
    id:i, name:`Player ${i+1}`, avatarId: PLAYER_STARTS[i] ?? AVATAR_IDS[i],
    isAI:false,
    pieces: Array.from({length:4}, (_,j)=>({id:`p${i}-${j}`,playerId:i,position:-1,carrying:[]}))
  }));
}

let state = { numPlayers: 2, players: createInitialPlayers(2) };

function setNumPlayers(n){
  const existing = state.players;
  const fresh = createInitialPlayers(n);
  const players = Array.from({length:n}, (_,i) => {
    const prev = existing[i];
    if (prev) {
      return { ...prev, pieces: Array.from({length:4},(_,j)=>({id:`p${i}-${j}`,playerId:i,position:-1,carrying:[]})) };
    }
    return fresh[i];
  });
  state.numPlayers = n;
  state.players = players;
}

function setPlayer(index, data){
  state.players = state.players.map((p,i)=> i===index ? {...p,...data} : p);
}

function startGame(){
  const num = state.numPlayers;
  const existingPlayers = state.players;
  const players = existingPlayers.slice(0,num).map((p,i)=>({
    ...p, id:i,
    pieces: Array.from({length:4},(_,j)=>({id:`p${i}-${j}`,playerId:i,position:-1,carrying:[]}))
  }));
  state.players = players;
}

console.log("Initial:", state.players.map(p=>`${p.name}:${p.avatarId}`).join(", "));

setNumPlayers(3);
console.log("After setNumPlayers(3):", state.players.map(p=>`${p.name}:${p.avatarId}`).join(", "));

setPlayer(0, { name: 'Alice', avatarId: 'crane' });
setPlayer(1, { name: 'Bob',   avatarId: 'bear'   });
setPlayer(2, { name: 'Cara',  avatarId: 'deer'   });
console.log("After custom picks:", state.players.map(p=>`${p.name}:${p.avatarId}`).join(", "));

startGame();
console.log("After startGame():", state.players.map(p=>`${p.name}:${p.avatarId}`).join(", "));

const ok = state.players.every((p,i)=> {
  const expected = ['Alice:crane','Bob:bear','Cara:deer'][i];
  return `${p.name}:${p.avatarId}` === expected;
});
console.log(ok ? "\nPASS: avatars preserved through startGame" : "\nFAIL: avatars lost");
process.exit(ok?0:1);
