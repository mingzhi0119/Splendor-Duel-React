import { useState, useEffect, useCallback } from 'react';
import { 
    GRID_SIZE, GEM_TYPES, BONUS_COLORS, SPIRAL_ORDER, ABILITIES, ROYAL_CARDS 
} from '../constants';
import { generateGemPool, generateDeck, calculateCost } from '../utils';
import { useActionHistory } from './useActionHistory';

// --- Reducer / Game Logic Engine ---
const INITIAL_STATE_SKELETON = {
    board: Array.from({ length: GRID_SIZE }, () => Array.from({ length: GRID_SIZE }, () => ({ type: { id: 'empty' }, uid: 'skeleton' }))), 
    bag: [], turn: 'p1', gameMode: 'IDLE',
    pendingReserve: null, bonusGemTarget: null, pendingBuy: null, nextPlayerAfterRoyal: null,
    decks: { 1: [], 2: [], 3: [] }, market: { 1: [], 2: [], 3: [] },
    inventories: { p1: { blue: 0, white: 0, green: 0, black: 0, red: 0, gold: 0, pearl: 0 }, p2: { blue: 0, white: 0, green: 0, black: 0, red: 0, gold: 0, pearl: 0 } },
    privileges: { p1: 0, p2: 1 },
    playerTableau: { p1: [], p2: [] }, playerReserved: { p1: [], p2: [] },
    royalDeck: ROYAL_CARDS || [], playerRoyals: { p1: [], p2: [] },
    royalMilestones: { p1: { 3: false, 6: false }, p2: { 3: false, 6: false } },
    extraPoints: { p1: 0, p2: 0 },
    extraCrowns: { p1: 0, p2: 0 },
    lastFeedback: null,
    toastMessage: null,
    winner: null
};

const applyAction = (state, action) => {
    // Deep clone state to ensure immutability during replay
    // Handle null state for safety (though usually handled by INIT)
    const newState = state ? JSON.parse(JSON.stringify(state)) : null;
    if (newState) {
        newState.lastFeedback = null; // Clear previous feedback to prevent residuals
        newState.toastMessage = null;
    }

    // Helper to aggregate feedback
    const addFeedback = (player, type, diff) => {
        if (!newState.lastFeedback) newState.lastFeedback = { uid: Date.now() + '-' + Math.random(), items: [] };
        const existing = newState.lastFeedback.items.find(i => i.player === player && i.type === type);
        if (existing) existing.diff += diff;
        else newState.lastFeedback.items.push({ player, type, diff });
    };

    const { type, payload } = action;

    // Helper to finalize turn (check win conditions, etc.)
    const finalizeTurn = (nextPlayer, instantInv = null) => {
        const getPoints = (pid) => newState.playerTableau[pid].reduce((a, c) => a + c.points, 0) + newState.playerRoyals[pid].reduce((a, c) => a + c.points, 0) + (newState.extraPoints ? newState.extraPoints[pid] : 0);
        const getCrowns = (pid) => [...newState.playerTableau[pid], ...newState.playerRoyals[pid]].reduce((a, c) => a + (c.crowns || 0), 0) + (newState.extraCrowns ? newState.extraCrowns[pid] : 0);
        const getColorPoints = (pid, color) => newState.playerTableau[pid].filter(c => c.bonusColor === color).reduce((a, c) => a + c.points, 0);

        if (getPoints(newState.turn) >= 20 || getCrowns(newState.turn) >= 10) { newState.winner = newState.turn; return; }
        for (const color of BONUS_COLORS) { if (getColorPoints(newState.turn, color) >= 10) { newState.winner = newState.turn; return; } }

        const invToCheck = instantInv || newState.inventories[newState.turn];
        const totalGems = Object.values(invToCheck).reduce((a, b) => a + b, 0);
        if (totalGems > 10) {
            newState.gameMode = 'DISCARD_EXCESS_GEMS';
            if (!newState.nextPlayerAfterRoyal) newState.nextPlayerAfterRoyal = nextPlayer;
            return;
        }
        newState.turn = nextPlayer;
        newState.gameMode = 'IDLE';
        newState.nextPlayerAfterRoyal = null;
    };

    switch (type) {
        case 'INIT':
            return { ...INITIAL_STATE_SKELETON, ...payload };

        case 'TAKE_GEMS': {
            const { coords } = payload;
            const newInv = { ...newState.inventories[newState.turn] };
            let pearlCount = 0; let colorCounts = {};
            coords.forEach(({ r, c }) => {
                const gem = newState.board[r][c];
                const gemType = gem.type.id;
                newInv[gemType] = (newInv[gemType] || 0) + 1;
                newState.board[r][c] = { type: GEM_TYPES.EMPTY, uid: `empty-${r}-${c}-${Date.now()}` }; // Date.now() in replay is fine as it's just a UID
                if (gemType === 'pearl') pearlCount++;
                colorCounts[gemType] = (colorCounts[gemType] || 0) + 1;
            });
            
            // Feedback for Pearl/Gold
            const specialGems = coords.map(({r,c}) => state.board[r][c].type.id).filter(t => t === 'pearl' || t === 'gold');
            specialGems.forEach(t => addFeedback(newState.turn, t, 1));

            // Privilege Logic
            if (pearlCount >= 2 || Object.values(colorCounts).some(c => c >= 3)) {
                const opponent = newState.turn === 'p1' ? 'p2' : 'p1';
                if ((newState.privileges.p1 + newState.privileges.p2) < 3) {
                    newState.privileges[opponent]++;
                    addFeedback(opponent, 'privilege', 1);
                }
                else if (newState.privileges[newState.turn] > 0) { 
                    newState.privileges[newState.turn]--; 
                    addFeedback(newState.turn, 'privilege', -1);
                    newState.privileges[opponent]++; 
                    addFeedback(opponent, 'privilege', 1);
                }
            }
            newState.inventories[newState.turn] = newInv;
            finalizeTurn(newState.turn === 'p1' ? 'p2' : 'p1', newInv);
            break;
        }

        case 'REPLENISH': {
            const opponent = newState.turn === 'p1' ? 'p2' : 'p1';
            if (!newState.board.every(row => row.every(g => g.type.id === 'empty'))) {
                // Give privilege to opponent if board wasn't empty
                if ((newState.privileges.p1 + newState.privileges.p2) < 3) {
                    newState.privileges[opponent]++;
                    addFeedback(opponent, 'privilege', 1);
                }
                else if (newState.privileges[newState.turn] > 0) { 
                    newState.privileges[newState.turn]--; 
                    addFeedback(newState.turn, 'privilege', -1);
                    newState.privileges[opponent]++; 
                    addFeedback(opponent, 'privilege', 1);
                }
            }
            for (let i = 0; i < SPIRAL_ORDER.length; i++) {
                const [r, c] = SPIRAL_ORDER[i];
                if (newState.board[r][c].type.id === 'empty' && newState.bag.length > 0) {
                    newState.board[r][c] = newState.bag.pop();
                }
            }
            break;
        }

        case 'TAKE_BONUS_GEM': {
            const { r, c } = payload;
            const gem = newState.board[r][c];
            const gemType = gem.type.id;
            
            newState.board[r][c] = { type: GEM_TYPES.EMPTY, uid: `empty-${r}-${c}-${Date.now()}` };
            newState.inventories[newState.turn][gemType] = (newState.inventories[newState.turn][gemType] || 0) + 1;
            
            newState.bonusGemTarget = null;
            
            const totalGems = Object.values(newState.inventories[newState.turn]).reduce((a, b) => a + b, 0);
            if (totalGems > 10) {
                newState.gameMode = 'DISCARD_EXCESS_GEMS';
                return newState;
            }
            finalizeTurn(newState.nextPlayerAfterRoyal || (newState.turn === 'p1' ? 'p2' : 'p1'));
            break;
        }

        case 'DISCARD_GEM': {
            const gemId = payload;
            const currentInv = newState.inventories[newState.turn];
            if (currentInv[gemId] > 0) {
                currentInv[gemId]--;
                // Return to bag
                newState.bag.push({ type: GEM_TYPES[gemId.toUpperCase()], uid: `discard-${Date.now()}` });
                
                const totalGems = Object.values(currentInv).reduce((a, b) => a + b, 0);
                if (totalGems <= 10) {
                    // Discard complete
                    const nextP = newState.nextPlayerAfterRoyal || (newState.turn === 'p1' ? 'p2' : 'p1');
                    finalizeTurn(nextP, currentInv);
                }
                // If still > 10, stay in DISCARD_EXCESS_GEMS mode (implied)
            }
            break;
        }

        case 'DEBUG_ADD_CROWNS': {
            const pid = payload;
            // Add crowns directly without adding a card
            if (!newState.extraCrowns) newState.extraCrowns = { p1: 0, p2: 0 };
            newState.extraCrowns[pid] = (newState.extraCrowns[pid] || 0) + 1;
            addFeedback(pid, 'crown', 1);
            finalizeTurn(newState.turn); // Check win condition
            break;
        }

        case 'DEBUG_ADD_POINTS': {
            const pid = payload;
            // Add points directly without adding a card
            if (!newState.extraPoints) newState.extraPoints = { p1: 0, p2: 0 };
            newState.extraPoints[pid] = (newState.extraPoints[pid] || 0) + 1;
            finalizeTurn(newState.turn); // Check win condition
            break;
        }

        case 'INITIATE_BUY_JOKER': {
            newState.pendingBuy = payload;
            newState.gameMode = 'SELECT_CARD_COLOR';
            return newState;
        }

        case 'BUY_CARD': {
            const { card, source, marketInfo } = payload;
            const player = newState.turn;
            const inv = newState.inventories[player];
            const tableau = newState.playerTableau[player];
            
            // 1. Calculate Payment & Deduct Gems
            newState.pendingBuy = null; // Clear pending state

            const bonuses = BONUS_COLORS.reduce((acc, color) => {
                acc[color] = tableau.filter(c => c.bonusColor === color).reduce((sum, c) => sum + (c.bonusCount || 1), 0);
                return acc;
            }, {});

            let goldCost = 0;
            Object.entries(card.cost).forEach(([color, cost]) => {
                const discount = bonuses[color] || 0;
                const needed = Math.max(0, cost - discount);
                const available = inv[color] || 0;
                const paid = Math.min(needed, available);
                
                inv[color] -= paid;
                // Return paid gems to bag
                for(let k=0; k<paid; k++) {
                    newState.bag.push({ type: GEM_TYPES[color.toUpperCase()], uid: `returned-${color}-${Date.now()}-${k}` });
                }
                goldCost += (needed - paid);
            });
            
            // Pay Gold
            inv.gold -= goldCost;
            for(let k=0; k<goldCost; k++) {
                newState.bag.push({ type: GEM_TYPES.GOLD, uid: `returned-gold-${Date.now()}-${k}` });
            }

            // 2. Add Card to Tableau
            newState.playerTableau[player].push(card);
            if (card.crowns > 0) addFeedback(player, 'crown', card.crowns);

            // 3. Remove from Source & Refill
            if (source === 'market') {
                const { level, idx } = marketInfo;
                const deck = newState.decks[level];
                if (deck.length > 0) {
                    newState.market[level][idx] = deck.pop();
                } else {
                    newState.market[level][idx] = null;
                }
            } else if (source === 'reserved') {
                newState.playerReserved[player] = newState.playerReserved[player].filter(c => c.id !== card.id);
            }

            // 4. Handle Abilities
            let nextTurn = player === 'p1' ? 'p2' : 'p1';
            const abilities = Array.isArray(card.ability) ? card.ability : (card.ability ? [card.ability] : []);
            
            if (abilities.includes(ABILITIES.AGAIN.id)) nextTurn = player;
            
            if (abilities.includes(ABILITIES.BONUS_GEM.id)) {
                const hasGem = newState.board.some(row => row.some(g => g.type.id === card.bonusColor));
                if (hasGem) {
                    newState.gameMode = 'BONUS_ACTION';
                    newState.bonusGemTarget = card.bonusColor;
                    return newState; // Wait for bonus action
                } else {
                    newState.toastMessage = "No matching gem available - Skill skipped";
                }
            }
            
            if (abilities.includes(ABILITIES.SCROLL.id)) {
                const opponent = player === 'p1' ? 'p2' : 'p1';
                if ((newState.privileges.p1 + newState.privileges.p2) < 3) {
                    newState.privileges[player]++;
                    addFeedback(player, 'privilege', 1);
                }
                else if (newState.privileges[opponent] > 0) { 
                    newState.privileges[opponent]--; 
                    addFeedback(opponent, 'privilege', -1);
                    newState.privileges[player]++; 
                    addFeedback(player, 'privilege', 1);
                }
            }

            finalizeTurn(nextTurn);
            break;
        }

        case 'INITIATE_RESERVE': {
            newState.pendingReserve = payload;
            newState.gameMode = 'RESERVE_WAITING_GEM';
            return newState;
        }

        case 'INITIATE_RESERVE_DECK': {
            newState.pendingReserve = { ...payload, isDeck: true };
            newState.gameMode = 'RESERVE_WAITING_GEM';
            return newState;
        }

        case 'CANCEL_RESERVE': {
            newState.pendingReserve = null;
            newState.gameMode = 'IDLE';
            return newState;
        }

        case 'RESERVE_CARD': {
            const { card, level, idx, goldCoords } = payload;
            const player = newState.turn;
            newState.playerReserved[player].push(card);
            
            const deck = newState.decks[level];
            newState.market[level][idx] = deck.length > 0 ? deck.pop() : null;

            // Take Gold if coords provided
            if (goldCoords) {
                const { r, c } = goldCoords;
                if (newState.board[r][c].type.id === 'gold') {
                    newState.board[r][c] = { type: GEM_TYPES.EMPTY, uid: `empty-${r}-${c}-${Date.now()}` };
                    newState.inventories[player].gold++;
                    addFeedback(player, 'gold', 1);
                }
            }
            
            newState.pendingReserve = null;
            newState.gameMode = 'IDLE';
            finalizeTurn(player === 'p1' ? 'p2' : 'p1');
            break;
        }

        case 'RESERVE_DECK': {
            const { level, goldCoords } = payload;
            const player = newState.turn;
            
            // Take top card from deck
            if (newState.decks[level].length > 0) {
                const card = newState.decks[level].pop();
                newState.playerReserved[player].push(card);
            }

            // Take Gold if coords provided
            if (goldCoords) {
                const { r, c } = goldCoords;
                if (newState.board[r][c].type.id === 'gold') {
                    newState.board[r][c] = { type: GEM_TYPES.EMPTY, uid: `empty-${r}-${c}-${Date.now()}` };
                    newState.inventories[player].gold++;
                    addFeedback(player, 'gold', 1);
                }
            }
            
            newState.pendingReserve = null;
            newState.gameMode = 'IDLE';
            finalizeTurn(player === 'p1' ? 'p2' : 'p1');
            break;
        }

        case 'STEAL_GEM': {
            const { gemId } = payload;
            const player = newState.turn;
            const opponent = player === 'p1' ? 'p2' : 'p1';
            
            if (newState.inventories[opponent][gemId] > 0) {
                newState.inventories[opponent][gemId]--;
                newState.inventories[player][gemId] = (newState.inventories[player][gemId] || 0) + 1;
            }

            addFeedback(player, gemId, 1);
            addFeedback(opponent, gemId, -1);
            
            const totalGems = Object.values(newState.inventories[player]).reduce((a, b) => a + b, 0);
            if (totalGems > 10) {
                 newState.gameMode = 'DISCARD_EXCESS_GEMS';
                 return newState;
            }

            finalizeTurn(newState.nextPlayerAfterRoyal || opponent);
            break;
        }

        case 'FORCE_ROYAL_SELECTION': {
            newState.gameMode = 'SELECT_ROYAL';
            newState.nextPlayerAfterRoyal = newState.turn === 'p1' ? 'p2' : 'p1';
            // Clear any pending states to prevent conflicts
            newState.pendingReserve = null;
            newState.pendingBuy = null;
            newState.bonusGemTarget = null;
            return newState;
        }

        case 'SELECT_ROYAL_CARD': {
            const { card } = payload;
            const player = newState.turn;
            
            // 1. Move card from Royal Deck to Player
            newState.royalDeck = newState.royalDeck.filter(c => c.id !== card.id);
            newState.playerRoyals[player].push(card);
            if (card.crowns > 0) addFeedback(player, 'crown', card.crowns);

            // 2. Handle Abilities
            const abilities = Array.isArray(card.ability) ? card.ability : (card.ability ? [card.ability] : []);
            
            // Determine next turn (default to the pending player, or swap if not set)
            let nextTurn = newState.nextPlayerAfterRoyal || (player === 'p1' ? 'p2' : 'p1');
            
            if (abilities.includes(ABILITIES.AGAIN.id)) {
                nextTurn = player;
            }

            if (abilities.includes(ABILITIES.BONUS_GEM.id)) {
                const hasGem = newState.board.some(row => row.some(g => g.type.id === card.bonusColor));
                if (hasGem) {
                    newState.gameMode = 'BONUS_ACTION';
                    newState.bonusGemTarget = card.bonusColor;
                    if (!newState.nextPlayerAfterRoyal) newState.nextPlayerAfterRoyal = nextTurn;
                    return newState;
                } else {
                    newState.toastMessage = "No matching gem available - Skill skipped";
                }
            }

            if (abilities.includes(ABILITIES.STEAL.id)) {
                 const opponent = player === 'p1' ? 'p2' : 'p1';
                 const hasStealable = Object.entries(newState.inventories[opponent]).some(([key, count]) => key !== 'gold' && count > 0);
                 if (hasStealable) {
                     newState.gameMode = 'STEAL_ACTION';
                     if (!newState.nextPlayerAfterRoyal) newState.nextPlayerAfterRoyal = nextTurn;
                     return newState;
                 } else {
                     newState.toastMessage = "No stealable gem from opponent - Skill skipped";
                 }
            }

            if (abilities.includes(ABILITIES.SCROLL.id)) {
                const opponent = player === 'p1' ? 'p2' : 'p1';
                if ((newState.privileges.p1 + newState.privileges.p2) < 3) {
                    newState.privileges[player]++;
                    addFeedback(player, 'privilege', 1);
                }
                else if (newState.privileges[opponent] > 0) { 
                    newState.privileges[opponent]--; 
                    addFeedback(opponent, 'privilege', -1);
                    newState.privileges[player]++; 
                    addFeedback(player, 'privilege', 1);
                }
            }

            finalizeTurn(nextTurn);
            break;
        }

        case 'ACTIVATE_PRIVILEGE': {
            newState.gameMode = 'PRIVILEGE_ACTION';
            return newState;
        }

        case 'USE_PRIVILEGE': {
            const { r, c } = payload;
            const gem = newState.board[r][c];
            const gemType = gem.type.id;
            
            if (gemType === 'gold' || gemType === 'empty') return newState;

            newState.board[r][c] = { type: GEM_TYPES.EMPTY, uid: `empty-${r}-${c}-${Date.now()}` };
            newState.inventories[newState.turn][gemType] = (newState.inventories[newState.turn][gemType] || 0) + 1;
            
            if (newState.privileges[newState.turn] > 0) {
                newState.privileges[newState.turn]--;
                addFeedback(newState.turn, 'privilege', -1);
            }

            newState.gameMode = 'IDLE';
            return newState;
        }

        // ... Additional cases for BUY, RESERVE, etc. would go here. 
        // For brevity in this refactor plan, I am mapping the critical ones.
        // In a full implementation, every state mutation must be a case here.
        
        default:
            console.warn("Unknown action type:", type);
    }
    return newState;
};

export const useGameLogic = () => {
  // 1. Core State & History
  const { history, currentIndex, recordAction, undo, redo, canUndo, canRedo } = useActionHistory();
  const [gameState, setGameState] = useState(null);
  
  // 2. UI/Transient State (Not in history)
  const [selectedGems, setSelectedGems] = useState([]);
  const [errorMsg, setErrorMsg] = useState(null);

  // 3. Initialization (Generate Random Seed)
  useEffect(() => {
    if (history.length === 0) {
      const fullPool = generateGemPool();
      const initialBoardFlat = fullPool.slice(0, 25);
      const initialBag = fullPool.slice(25);
      const newBoard = [];
      for (let r = 0; r < GRID_SIZE; r++) {
        const row = [];
        for (let c = 0; c < GRID_SIZE; c++) { row.push(initialBoardFlat[r * GRID_SIZE + c]); }
        newBoard.push(row);
      }
      const d1 = generateDeck(1); const d2 = generateDeck(2); const d3 = generateDeck(3);
      const market = { 3: d3.splice(0, 3), 2: d2.splice(0, 4), 1: d1.splice(0, 5) };
      const decks = { 1: d1, 2: d2, 3: d3 };
      
      recordAction({ type: 'INIT', payload: { board: newBoard, bag: initialBag, market, decks } });
    }
  }, []);

  // 4. Rehydration Engine
  useEffect(() => {
    if (history.length === 0) return;
    let state = null;
    // Safety clamp to prevent accessing undefined history if states desync
    const limit = Math.min(currentIndex, history.length - 1);
    
    for (let i = 0; i <= limit; i++) {
        if (history[i]) state = applyAction(state, history[i]);
    }
    setGameState(state);
  }, [currentIndex, history]);

  // --- Helpers & Getters ---
  const getGemAt = (r, c) => (gameState && gameState.board && gameState.board[r] && gameState.board[r][c]) ? gameState.board[r][c] : null;
  const isSelected = (r, c) => selectedGems.some(s => s.r === r && s.c === c);
  
  const getPlayerScore = (pid) => {
      if (!gameState) return 0;
      const cardPoints = gameState.playerTableau[pid].reduce((acc, c) => acc + c.points, 0);
      const royalPoints = gameState.playerRoyals[pid].reduce((acc, c) => acc + c.points, 0);
      const extra = (gameState.extraPoints && gameState.extraPoints[pid]) || 0;
      return cardPoints + royalPoints + extra;
  };

  const getCrownCount = (pid) => {
      if (!gameState) return 0;
      const allCards = [...gameState.playerTableau[pid], ...gameState.playerRoyals[pid]];
      const extra = (gameState.extraCrowns && gameState.extraCrowns[pid]) || 0;
      return allCards.reduce((acc, c) => acc + (c.crowns || 0), 0) + extra;
  };

  const validateGemSelection = (gems) => {
    if (gems.length <= 1) return { valid: true, hasGap: false };
    const sorted = [...gems].sort((a, b) => a.r - b.r || a.c - b.c);
    const first = sorted[0];
    const last = sorted[sorted.length - 1];
    const dr = last.r - first.r;
    const dc = last.c - first.c;
    const isRow = dr === 0;
    const isCol = dc === 0;
    const isDiag = Math.abs(dr) === Math.abs(dc);
    if (!isRow && !isCol && !isDiag) return { valid: false, error: "Must be in a straight line." };
    const span = Math.max(Math.abs(dr), Math.abs(dc));
    if (span > 2) return { valid: false, error: "Too far apart (Max 3 gems)." };
    if (sorted.length === 3) {
        const mid = sorted[1];
        if (mid.r * 2 !== first.r + last.r || mid.c * 2 !== first.c + last.c) {
            return { valid: false, error: "Gems must be contiguous." };
        }
    }
    const hasGap = (sorted.length === 2 && span === 2);
    return { valid: true, hasGap, error: null };
  };

  // --- Handlers (Now dispatch actions) ---
  const handleSelfGemClick = (gemId) => {
      if (!gameState || gameState.gameMode !== 'DISCARD_EXCESS_GEMS') return;
      if (gameState.winner) return;
      
      const inv = { ...gameState.inventories[gameState.turn] };
      if (inv[gemId] > 0) {
          recordAction({ type: 'DISCARD_GEM', payload: gemId });
      }
  };

  const handleGemClick = (r, c) => {
    if (!gameState) return;
    const gem = getGemAt(r, c);
    if (gameState.winner) return;
    if (!gem || !gem.type || gem.type.id === 'empty') return;

    if (gameState.gameMode === 'BONUS_ACTION') {
        if (gem.type.id !== gameState.bonusGemTarget) { setErrorMsg(`Must select a ${gameState.bonusGemTarget} gem!`); return; }
        recordAction({ type: 'TAKE_BONUS_GEM', payload: { r, c } });
        return;
    }

    if (gameState.gameMode === 'RESERVE_WAITING_GEM') {
        if (gem.type.id !== 'gold') { setErrorMsg("Must select a Gold gem!"); return; }
        
        if (gameState.pendingReserve.isDeck) {
             recordAction({ type: 'RESERVE_DECK', payload: { ...gameState.pendingReserve, goldCoords: { r, c } } });
        } else {
             recordAction({ type: 'RESERVE_CARD', payload: { ...gameState.pendingReserve, goldCoords: { r, c } } });
        }
        return;
    }

    if (gameState.gameMode === 'PRIVILEGE_ACTION') {
        if (gem.type.id === 'gold') { setErrorMsg("Cannot use Privilege on Gold."); return; }
        recordAction({ type: 'USE_PRIVILEGE', payload: { r, c } });
        return;
    }

    if (gameState.gameMode !== 'IDLE') return;

    if (isSelected(r, c)) {
      setSelectedGems(selectedGems.filter(g => g.r !== r || g.c !== c));
      return;
    }

    if (gem.type.id === 'gold') { setErrorMsg("Cannot take Gold directly!"); return; }
    
    const newSelection = [...selectedGems, { r, c }];
    if (newSelection.length > 3) { setErrorMsg("Max 3 gems."); return; }

    const check = validateGemSelection(newSelection);
    if (!check.valid) {
        setErrorMsg(check.error);
        return;
    }
    setSelectedGems(newSelection);
  };

  const handleOpponentGemClick = (gemId) => {
      if (!gameState || gameState.winner) return;
      if (gameState.gameMode !== 'STEAL_ACTION') return;
      
      if (gemId === 'gold') {
          setErrorMsg("Cannot steal Gold!");
          return;
      }
      
      const opponent = gameState.turn === 'p1' ? 'p2' : 'p1';
      if (gameState.inventories[opponent][gemId] > 0) {
          recordAction({ type: 'STEAL_GEM', payload: { gemId } });
      }
  };

  const handleConfirmTake = () => {
    if (selectedGems.length === 0) return;
    if (gameState.winner) return;
    const check = validateGemSelection(selectedGems);
    if (check.hasGap) { setErrorMsg("Cannot take with gaps! Fill the middle."); return; }
    
    recordAction({ type: 'TAKE_GEMS', payload: { coords: selectedGems } });
    setSelectedGems([]); 
  };

  const handleReplenish = () => {
    if (gameState.winner) return;
    if (gameState.bag.length === 0) { setErrorMsg("Bag empty!"); return; }
    recordAction({ type: 'REPLENISH' });
  };

  const handleReserveCard = (card, level, idx) => {
      if (gameState.winner) return;
      if (gameState.playerReserved[gameState.turn].length >= 3) {
          setErrorMsg("Reserve full (max 3).");
          return;
      }
      
      // Check for gold on board
      let hasGold = false;
      for(let r=0; r<GRID_SIZE; r++) {
          for(let c=0; c<GRID_SIZE; c++) {
              if (gameState.board[r][c].type.id === 'gold') {
                  hasGold = true;
                  break;
              }
          }
          if(hasGold) break;
      }

      if (hasGold) {
          recordAction({ type: 'INITIATE_RESERVE', payload: { card, level, idx } });
          setErrorMsg("Select a Gold gem to take.");
      } else {
          recordAction({ type: 'RESERVE_CARD', payload: { card, level, idx } });
      }
  };
  
  const handleReserveDeck = (level) => {
      if (gameState.winner) return;
      if (gameState.playerReserved[gameState.turn].length >= 3) {
          setErrorMsg("Reserve full (max 3).");
          return;
      }
      if (gameState.decks[level].length === 0) {
          setErrorMsg("Deck empty!");
          return;
      }

      let hasGold = false;
      for(let r=0; r<GRID_SIZE; r++) {
          for(let c=0; c<GRID_SIZE; c++) {
              if (gameState.board[r][c].type.id === 'gold') {
                  hasGold = true;
                  break;
              }
          }
          if(hasGold) break;
      }

      const actionType = hasGold ? 'INITIATE_RESERVE_DECK' : 'RESERVE_DECK';
      recordAction({ type: actionType, payload: { level } });
  };

  const initiateBuy = (card, source = 'market', marketInfo = {}) => {
      if (gameState.winner) return;
      
      // Check for Joker (Gold bonus color)
      if (card.bonusColor === 'gold') {
          if (calculateCost(card, gameState.turn, gameState.inventories, gameState.playerTableau)) {
              recordAction({ type: 'INITIATE_BUY_JOKER', payload: { card, source, marketInfo } });
          } else {
              setErrorMsg("Cannot afford this card!");
          }
          return;
      }

      if (calculateCost(card, gameState.turn, gameState.inventories, gameState.playerTableau)) {
          recordAction({ type: 'BUY_CARD', payload: { card, source, marketInfo } });
      } else {
          setErrorMsg("Cannot afford this card!");
      }
  };

  const handleSelectBonusColor = (color) => {
      if (!gameState || gameState.gameMode !== 'SELECT_CARD_COLOR' || !gameState.pendingBuy) return;
      const { card, source, marketInfo } = gameState.pendingBuy;
      const modifiedCard = { ...card, bonusColor: color };
      recordAction({ type: 'BUY_CARD', payload: { card: modifiedCard, source, marketInfo } });
  };

  const handleSelectRoyal = (royalCard) => {
      if (gameState.winner) return;
      recordAction({ type: 'SELECT_ROYAL_CARD', payload: { card: royalCard } });
  };

  const handleCancelReserve = () => { 
      if (gameState.winner) return;
      recordAction({ type: 'CANCEL_RESERVE' });
  };
  const activatePrivilegeMode = () => {
      if (!gameState || gameState.winner) return;
      if (gameState.gameMode !== 'IDLE') return;
      
      if (gameState.privileges[gameState.turn] > 0) {
          const hasNonGold = gameState.board.some(row => row.some(g => g.type.id !== 'empty' && g.type.id !== 'gold'));
          if (!hasNonGold) { setErrorMsg("No gems available."); return; }
          
          recordAction({ type: 'ACTIVATE_PRIVILEGE' });
          setSelectedGems([]);
      }
  };
  const checkAndInitiateBuyReserved = (card, execute = false) => { 
      if (!gameState) return false;
      if (gameState.winner) return false;
      if (execute && calculateCost(card, gameState.turn, gameState.inventories, gameState.playerTableau)) initiateBuy(card, 'reserved'); 
      return calculateCost(card, gameState.turn, gameState.inventories, gameState.playerTableau); 
  };

  const handleDebugAddCrowns = (pid) => {
      if (gameState.winner) return;
      recordAction({ type: 'DEBUG_ADD_CROWNS', payload: pid });
  };

  const handleDebugAddPoints = (pid) => {
      if (gameState.winner) return;
      recordAction({ type: 'DEBUG_ADD_POINTS', payload: pid });
  };

  const handleForceRoyal = () => {
      if (gameState.winner) return;
      recordAction({ type: 'FORCE_ROYAL_SELECTION' });
  };

  useEffect(() => {
    const timeout = setTimeout(() => setErrorMsg(null), 2000);
    return () => clearTimeout(timeout);
  }, [errorMsg]);
  
  // Sync toast message from game state to UI state
  useEffect(() => {
    if (gameState?.toastMessage) {
      setErrorMsg(gameState.toastMessage);
    }
  }, [gameState?.toastMessage]);

  // If state is not yet initialized, return skeleton
  const safeState = gameState || INITIAL_STATE_SKELETON;

  return {
    state: { ...safeState, selectedGems, errorMsg },
    handlers: { handleSelfGemClick, handleGemClick, handleOpponentGemClick, handleConfirmTake, handleReplenish, handleReserveCard, handleReserveDeck, initiateBuy, handleSelectBonusColor, handleSelectRoyal, handleCancelReserve, activatePrivilegeMode, checkAndInitiateBuyReserved, handleDebugAddCrowns, handleDebugAddPoints, handleForceRoyal },
    getters: { getPlayerScore, isSelected, getCrownCount },
    historyControls: { undo, redo, canUndo, canRedo, currentIndex, historyLength: history.length }
  };
};
