import React, { useState, useEffect } from 'react';
import { RefreshCw, Info, X, ShoppingBag, Crown, Trophy, Layers, Monitor, Undo2 } from 'lucide-react';

import { GRID_SIZE, GEM_TYPES, BONUS_COLORS, SPIRAL_ORDER, ABILITIES, ROYAL_CARDS } from './constants';
import { generateGemPool, generateDeck, isAdjacent, getDirection, calculateCost } from './utils';
import { Card } from './components/Card';
import { PlayerZone } from './components/PlayerZone';


// 分辨率配置中心
const RESOLUTION_SETTINGS = {
    '1k': { 
        label: '1080p (FHD)', 
        zoneHeight: 'h-[160px]',
        zoneScale: 'scale-[0.7]',
        boardScale: 'scale-[0.75]',
        deckScale: 'scale-[0.85]'
    },
    '2k': { 
        label: '1440p (2K)', 
        zoneHeight: 'h-[240px]', 
        zoneScale: 'scale-90',   
        boardScale: 'scale-100', 
        deckScale: 'scale-100'
    },
    '4k': { 
        label: '2160p (4K)', 
        zoneHeight: 'h-[320px]', 
        zoneScale: 'scale-125',  
        boardScale: 'scale-[1.4]', 
        deckScale: 'scale-110'
    }
};


export default function GemDuelBoard() {
  const [board, setBoard] = useState([]);
  const [bag, setBag] = useState([]);
  const [turn, setTurn] = useState('p1');
  const [selectedGems, setSelectedGems] = useState([]);
  const [errorMsg, setErrorMsg] = useState(null);
  const [winner, setWinner] = useState(null);
  const [showDebug, setShowDebug] = useState(false);

  // Resolution State (Default to 2k)
  const [resolution, setResolution] = useState('2k');
  
  // Modes
  const [gameMode, setGameMode] = useState('IDLE');
  
  // Temporary States
  const [pendingReserve, setPendingReserve] = useState(null);
  const [bonusGemTarget, setBonusGemTarget] = useState(null);
  const [pendingBuy, setPendingBuy] = useState(null); 
  const [nextPlayerAfterRoyal, setNextPlayerAfterRoyal] = useState(null);

  const [decks, setDecks] = useState({ 1: [], 2: [], 3: [] });
  const [market, setMarket] = useState({ 1: [], 2: [], 3: [] });
  const [inventories, setInventories] = useState({
    p1: { blue: 0, white: 0, green: 0, black: 0, red: 0, gold: 0, pearl: 0 },
    p2: { blue: 0, white: 0, green: 0, black: 0, red: 0, gold: 0, pearl: 0 },
  });
  const [privileges, setPrivileges] = useState({ p1: 0, p2: 1 });
  const [playerTableau, setPlayerTableau] = useState({ p1: [], p2: [] });
  const [playerReserved, setPlayerReserved] = useState({ p1: [], p2: [] });

  const [royalDeck, setRoyalDeck] = useState(ROYAL_CARDS);
  const [playerRoyals, setPlayerRoyals] = useState({ p1: [], p2: [] });
  const [royalMilestones, setRoyalMilestones] = useState({
      p1: { 3: false, 6: false },
      p2: { 3: false, 6: false }
  });

  // --- Undo System ---
  const [historyStack, setHistoryStack] = useState([]);

  // Create a deep copy snapshot of the current game state
  const createSnapshot = () => {
    return JSON.parse(JSON.stringify({
      board,
      bag,
      turn,
      gameMode, 
      selectedGems,
      pendingReserve,
      pendingBuy,
      bonusGemTarget,
      nextPlayerAfterRoyal,
      decks,
      market,
      inventories,
      privileges,
      playerTableau,
      playerReserved,
      royalDeck,
      playerRoyals,
      royalMilestones,
    }));
  };

  // Call this BEFORE any state-mutating action
  const saveState = () => {
    const snapshot = createSnapshot();
    setHistoryStack(prev => [...prev, snapshot]);
  };

  const handleUndo = () => {
    if (historyStack.length === 0) return;

    const prevState = historyStack[historyStack.length - 1];
    setHistoryStack(prev => prev.slice(0, -1));

    // Restore all states
    setBoard(prevState.board);
    setBag(prevState.bag);
    setTurn(prevState.turn);
    setGameMode(prevState.gameMode);
    setSelectedGems(prevState.selectedGems);
    setPendingReserve(prevState.pendingReserve);
    setPendingBuy(prevState.pendingBuy);
    setBonusGemTarget(prevState.bonusGemTarget);
    setNextPlayerAfterRoyal(prevState.nextPlayerAfterRoyal);
    setDecks(prevState.decks);
    setMarket(prevState.market);
    setInventories(prevState.inventories);
    setPrivileges(prevState.privileges);
    setPlayerTableau(prevState.playerTableau);
    setPlayerReserved(prevState.playerReserved);
    setRoyalDeck(prevState.royalDeck);
    setPlayerRoyals(prevState.playerRoyals);
    setRoyalMilestones(prevState.royalMilestones);
    
    setWinner(null);
    setErrorMsg("Undid last action.");
    setTimeout(() => setErrorMsg(null), 1000);
  };
  

  // --- Init ---
  useEffect(() => {
    const fullPool = generateGemPool();
    const initialBoardFlat = fullPool.slice(0, 25);
    const initialBag = fullPool.slice(25); 

    const newBoard = [];
    for (let r = 0; r < GRID_SIZE; r++) {
      const row = [];
      for (let c = 0; c < GRID_SIZE; c++) {
        row.push(initialBoardFlat[r * GRID_SIZE + c]);
      }
      newBoard.push(row);
    }
    setBoard(newBoard);
    setBag(initialBag);

    const d1 = generateDeck(1);
    const d2 = generateDeck(2);
    const d3 = generateDeck(3);
    setMarket({ 3: d3.splice(0, 3), 2: d2.splice(0, 4), 1: d1.splice(0, 5) });
    setDecks({ 1: d1, 2: d2, 3: d3 });
  }, []);

  // --- Helpers ---
  const getGemAt = (r, c) => (r >= 0 && r < GRID_SIZE && c >= 0 && c < GRID_SIZE) ? board[r][c] : null;
  const isSelected = (r, c) => selectedGems.some(s => s.r === r && s.c === c);
  
  const getPlayerScore = (pid) => {
      const cardPoints = playerTableau[pid].reduce((acc, c) => acc + c.points, 0);
      const royalPoints = playerRoyals[pid].reduce((acc, c) => acc + c.points, 0);
      return cardPoints + royalPoints;
  };

  const getPointsByColor = (pid, color) => {
      return playerTableau[pid]
          .filter(c => c.bonusColor === color)
          .reduce((acc, c) => acc + c.points, 0);
  };

  const getCrownCount = (pid) => {
      const allCards = [...playerTableau[pid], ...playerRoyals[pid]];
      return allCards.reduce((acc, c) => acc + (c.crowns || 0), 0);
  };

  // --- Selection Validation Logic (Optimized for flexible order) ---
  const validateGemSelection = (gems) => {
    if (gems.length <= 1) return { valid: true, hasGap: false };

    // 1. Sort by row then column to normalize order (handles 1-3-2 clicks)
    const sorted = [...gems].sort((a, b) => a.r - b.r || a.c - b.c);
    const first = sorted[0];
    const last = sorted[sorted.length - 1];

    // 2. Calculate spans
    const dr = last.r - first.r;
    const dc = last.c - first.c;
    const isRow = dr === 0;
    const isCol = dc === 0;
    const isDiag = Math.abs(dr) === Math.abs(dc);

    // 3. Linearity check
    if (!isRow && !isCol && !isDiag) return { valid: false, error: "Must be in a straight line." };

    // 4. Distance check
    const span = Math.max(Math.abs(dr), Math.abs(dc));
    if (span > 2) return { valid: false, error: "Too far apart (Max 3 gems)." };

    // 5. Middle gem check for 3 items
    if (sorted.length === 3) {
        const mid = sorted[1];
        if (mid.r * 2 !== first.r + last.r || mid.c * 2 !== first.c + last.c) {
            return { valid: false, error: "Gems must be contiguous." };
        }
    }

    // 6. Gap detection (valid for selection, invalid for taking)
    const hasGap = (sorted.length === 2 && span === 2);

    return { valid: true, hasGap, error: null };
  };


  const performTakePrivilege = (targetPlayer) => {
    const opponent = targetPlayer === 'p1' ? 'p2' : 'p1';
    const totalInPlay = privileges.p1 + privileges.p2;
    let newPrivs = { ...privileges };
    let msg = "";

    if (totalInPlay < 3) {
        newPrivs[targetPlayer]++;
        msg = "Took a Privilege Scroll.";
    } else {
        if (newPrivs[opponent] > 0) {
            newPrivs[opponent]--;
            newPrivs[targetPlayer]++;
            msg = "Stole a Privilege from opponent!";
        } else {
            msg = "No Privileges available.";
        }
    }
    setPrivileges(newPrivs);
    return msg;
  };

  const giveOpponentPrivilege = () => {
      const opponent = turn === 'p1' ? 'p2' : 'p1';
      return performTakePrivilege(opponent);
  };

  const finalizeTurn = (nextPlayer, instantInv = null) => {
      const currentScore = getPlayerScore(turn);
      const currentCrowns = getCrownCount(turn);
      
      if (currentScore >= 20) { setWinner(turn); return; }
      if (currentCrowns >= 10) { setWinner(turn); return; }
      for (const color of BONUS_COLORS) {
          if (getPointsByColor(turn, color) >= 10) { setWinner(turn); return; }
      }

      const invToCheck = instantInv || inventories[turn];
      const totalGems = Object.values(invToCheck).reduce((a, b) => a + b, 0);
      
      if (totalGems > 10) {
          setGameMode('DISCARD_EXCESS_GEMS');
          setErrorMsg(`Limit 10 gems! Discard ${totalGems - 10} more.`);
          if (!nextPlayerAfterRoyal) setNextPlayerAfterRoyal(nextPlayer); 
          return;
      }

      setTurn(nextPlayer);
      setGameMode('IDLE');
      setNextPlayerAfterRoyal(null);
  };

  // --- Handlers ---
  const handleSelfGemClick = (gemId) => {
      if (gameMode !== 'DISCARD_EXCESS_GEMS') return;
      
      const inv = { ...inventories[turn] };
      if (inv[gemId] > 0) {
          inv[gemId]--;
          const gemsToReturn = [{ type: GEM_TYPES[gemId.toUpperCase()], uid: `discard-${Date.now()}` }];
          
          setInventories({ ...inventories, [turn]: inv });
          setBag(prev => [...prev, ...gemsToReturn]);

          const totalGems = Object.values(inv).reduce((a, b) => a + b, 0);
          if (totalGems <= 10) {
              setErrorMsg(null);
              const nextP = nextPlayerAfterRoyal || (turn === 'p1' ? 'p2' : 'p1');
              setTurn(nextP);
              setGameMode('IDLE');
              setNextPlayerAfterRoyal(null);
          } else {
              setErrorMsg(`Limit 10 gems! Discard ${totalGems - 10} more.`);
          }
      }
  };

  const handleGemClick = (r, c) => {
    const gem = getGemAt(r, c);
    if (!gem || !gem.type || gem.type.id === 'empty') return;

    // --- Special Modes ---
    if (gameMode === 'BONUS_ACTION') {
        if (gem.type.id !== bonusGemTarget) { setErrorMsg(`Must select a ${bonusGemTarget} gem!`); setTimeout(() => setErrorMsg(null), 2000); return; }
        
        saveState(); // SAVE

        const newBoard = [...board]; newBoard[r][c] = { type: GEM_TYPES.EMPTY, uid: `empty-${r}-${c}-${Date.now()}` };
        const newInv = { ...inventories[turn] }; newInv[gem.type.id]++;
        setBoard(newBoard); 
        setInventories({ ...inventories, [turn]: newInv });
        const nextP = nextPlayerAfterRoyal || (turn === 'p1' ? 'p2' : 'p1');
        finalizeTurn(nextP, newInv); 
        return;
    }

    if (gameMode === 'PRIVILEGE_ACTION') {
        if (gem.type.id === 'gold') { setErrorMsg("Cannot use Privilege on Gold."); setTimeout(() => setErrorMsg(null), 2000); return; }
        
        saveState(); // SAVE

        const newBoard = [...board]; newBoard[r][c] = { type: GEM_TYPES.EMPTY, uid: `empty-${r}-${c}-${Date.now()}` };
        const newInv = { ...inventories[turn] }; newInv[gem.type.id]++;
        const newPrivs = { ...privileges }; newPrivs[turn]--; 
        setBoard(newBoard); setInventories({ ...inventories, [turn]: newInv }); setPrivileges(newPrivs);
        setGameMode('IDLE');
        return;
    }

    if (gameMode === 'RESERVE_WAITING_GEM') {
      if (gem.type.id !== 'gold') { setErrorMsg("Must select a Gold gem!"); setTimeout(() => setErrorMsg(null), 2000); return; }
      // State already saved in handleReserve
      if (pendingReserve.type === 'market') {
          executeReserve(pendingReserve.card, pendingReserve.level, pendingReserve.idx, true, { r, c });
      } else if (pendingReserve.type === 'deck') {
          executeReserveFromDeck(pendingReserve.level, true, { r, c });
      }
      return;
    }

    if (gameMode !== 'IDLE') return;

    // --- Standard Selection Logic (Optimized) ---
    // 1. Toggle deselection
    if (isSelected(r, c)) {
      const newSelection = selectedGems.filter(g => g.r !== r || g.c !== c);
      setSelectedGems(newSelection);
      return;
    }

    // 2. Validate new addition
    if (gem.type.id === 'gold') { setErrorMsg("Cannot take Gold directly!"); setTimeout(() => setErrorMsg(null), 2000); return; }
    
    const newSelection = [...selectedGems, { r, c }];
    if (newSelection.length > 3) { setErrorMsg("Max 3 gems."); setTimeout(() => setErrorMsg(null), 1500); return; }

    // 3. Check geometric validity
    const check = validateGemSelection(newSelection);
    if (!check.valid) {
        setErrorMsg(check.error);
        setTimeout(() => setErrorMsg(null), 1500);
        return;
    }

    // 4. Update selection (allows gaps temporarily)
    setSelectedGems(newSelection);
  };

  const handleOpponentGemClick = (gemId) => {
      if (gameMode !== 'STEAL_ACTION') return;
      const opponent = turn === 'p1' ? 'p2' : 'p1';
      const newOpponentInv = { ...inventories[opponent] };
      const newPlayerInv = { ...inventories[turn] };
      if (newOpponentInv[gemId] > 0) {
          
          saveState(); // SAVE

          newOpponentInv[gemId]--; newPlayerInv[gemId]++;
          setInventories({ p1: turn === 'p1' ? newPlayerInv : newOpponentInv, p2: turn === 'p2' ? newPlayerInv : newOpponentInv });
          setErrorMsg(`Stole a ${gemId} gem!`); setTimeout(() => setErrorMsg(null), 2000);
          
          const nextP = nextPlayerAfterRoyal || (turn === 'p1' ? 'p2' : 'p1');
          finalizeTurn(nextP, newPlayerInv);
      }
  };

  const handleConfirmTake = () => {
    if (selectedGems.length === 0) return;
    
    // Final validation before taking
    const check = validateGemSelection(selectedGems);
    if (check.hasGap) {
        setErrorMsg("Cannot take with gaps! Fill the middle.");
        setTimeout(() => setErrorMsg(null), 2000);
        return;
    }

    saveState(); // SAVE

    const newBoard = board.map(row => [...row]);
    const newInv = { ...inventories[turn] };
    let pearlCount = 0; let colorCounts = {}; let triggerPrivilege = false;
    selectedGems.forEach(({ r, c }) => {
      const gem = newBoard[r][c];
      const type = gem.type.id;
      newInv[type] = (newInv[type] || 0) + 1;
      newBoard[r][c] = { type: GEM_TYPES.EMPTY, uid: `empty-${r}-${c}-${Date.now()}` }; 
      if (type === 'pearl') pearlCount++;
      colorCounts[type] = (colorCounts[type] || 0) + 1;
    });
    if (pearlCount >= 2) triggerPrivilege = true;
    if (Object.values(colorCounts).some(count => count >= 3)) triggerPrivilege = true;
    if (triggerPrivilege) { const msg = giveOpponentPrivilege(); setErrorMsg(msg); setTimeout(() => setErrorMsg(null), 3000); }
    
    setBoard(newBoard); 
    setInventories({ ...inventories, [turn]: newInv }); 
    setSelectedGems([]); 
    
    finalizeTurn(turn === 'p1' ? 'p2' : 'p1', newInv);
  };

  const handleReplenish = () => {
    if (bag.length === 0) { setErrorMsg("Bag empty!"); setTimeout(() => setErrorMsg(null), 2000); return; }
    
    saveState(); // SAVE

    const isBoardEmpty = board.every(row => row.every(g => g.type.id === 'empty'));
    let msg = "";
    if (!isBoardEmpty) {
        msg = giveOpponentPrivilege();
    }

    const newBoard = board.map(row => [...row]); const newBag = [...bag]; let filled = 0;
    for (let i = 0; i < SPIRAL_ORDER.length; i++) {
        const [r, c] = SPIRAL_ORDER[i];
        if (newBoard[r][c].type.id === 'empty' && newBag.length > 0) { newBoard[r][c] = newBag.pop(); filled++; }
    }
    setBoard(newBoard); setBag(newBag); if(filled > 0) { setErrorMsg(`Refilled ${filled}. ${msg}`); setTimeout(() => setErrorMsg(null), 3000); }
  };

  const handleReserveCard = (card, level, idx) => {
      if (playerReserved[turn].length >= 3) { setErrorMsg("Reserve full (max 3)."); setTimeout(() => setErrorMsg(null), 2000); return; }
      
      saveState(); // SAVE

      const goldExists = board.some(row => row.some(g => g.type.id === 'gold'));
      if (goldExists) { 
          setPendingReserve({ type: 'market', card, level, idx }); 
          setGameMode('RESERVE_WAITING_GEM'); 
          setErrorMsg("Reserving... Pick a Gold gem to confirm."); 
      }
      else { executeReserve(card, level, idx, false); }
  };
  
  const executeReserve = (card, level, idx, takeGold, goldCoords = null) => {
      setPlayerReserved(prev => ({ ...prev, [turn]: [...prev[turn], card] }));
      const newDecks = { ...decks, [level]: [...decks[level]] };
      const newMarket = { ...market };
      if (newDecks[level].length > 0) newMarket[level][idx] = newDecks[level].pop(); else newMarket[level][idx] = null;
      setMarket(newMarket); setDecks(newDecks);
      
      let newInv = { ...inventories[turn] };
      if (takeGold && goldCoords) {
          const { r, c } = goldCoords; const newBoard = [...board]; newBoard[r][c] = { type: GEM_TYPES.EMPTY, uid: `empty-${r}-${c}-${Date.now()}` }; setBoard(newBoard);
          newInv.gold += 1; 
          setInventories(prev => ({ ...prev, [turn]: newInv }));
      }
      setPendingReserve(null); setGameMode('IDLE'); 
      if (takeGold) setErrorMsg("Reserved & Took Gold."); else setErrorMsg("Reserved (No Gold Available)."); setTimeout(() => setErrorMsg(null), 2000);
      
      finalizeTurn(turn === 'p1' ? 'p2' : 'p1', newInv);
  };

  const handleReserveDeck = (level) => {
      if (gameMode !== 'IDLE') return;
      if (decks[level].length === 0) { setErrorMsg("Deck empty!"); setTimeout(() => setErrorMsg(null), 1500); return; }
      if (playerReserved[turn].length >= 3) { setErrorMsg("Reserve full (max 3)."); setTimeout(() => setErrorMsg(null), 2000); return; }

      saveState(); // SAVE

      const goldExists = board.some(row => row.some(g => g.type.id === 'gold'));
      if (goldExists) {
          setPendingReserve({ type: 'deck', level });
          setGameMode('RESERVE_WAITING_GEM');
          setErrorMsg("Reserving Top Card... Pick a Gold gem.");
      } else {
          executeReserveFromDeck(level, false);
      }
  };

  const executeReserveFromDeck = (level, takeGold, goldCoords = null) => {
      const newDecks = { ...decks };
      const card = newDecks[level].pop();
      setDecks(newDecks);
      
      setPlayerReserved(prev => ({ ...prev, [turn]: [...prev[turn], card] }));

      let newInv = { ...inventories[turn] };
      if (takeGold && goldCoords) {
          const { r, c } = goldCoords; 
          const newBoard = [...board]; 
          newBoard[r][c] = { type: GEM_TYPES.EMPTY, uid: `empty-${r}-${c}-${Date.now()}` }; 
          setBoard(newBoard);
          newInv.gold += 1; 
          setInventories(prev => ({ ...prev, [turn]: newInv }));
      }

      setPendingReserve(null); 
      setGameMode('IDLE');
      
      if (takeGold) setErrorMsg("Reserved Top Deck & Took Gold."); 
      else setErrorMsg("Reserved Top Deck (No Gold)."); 
      setTimeout(() => setErrorMsg(null), 2000);

      finalizeTurn(turn === 'p1' ? 'p2' : 'p1', newInv);
  };

  const initiateBuy = (card, source = 'market', marketInfo = {}) => {
      const canAfford = calculateCost(card, turn, inventories, playerTableau);
      if (!canAfford) { setErrorMsg("Cannot afford this card."); setTimeout(() => setErrorMsg(null), 2000); return; }
      
      saveState(); // SAVE

      if (card.bonusColor === 'gold') { setPendingBuy({ card, source, marketInfo }); setGameMode('SELECT_CARD_COLOR'); setErrorMsg("Select a color for this Joker."); return; }
      executeBuy(card, source, marketInfo);
  };

  const handleSelectBonusColor = (color) => {
      if (!pendingBuy) return;
      const modifiedCard = { ...pendingBuy.card, bonusColor: color };
      executeBuy(modifiedCard, pendingBuy.source, pendingBuy.marketInfo);
      setPendingBuy(null); setGameMode('IDLE');
  };

  const handleSelectRoyal = (royalCard) => {
      if (!royalCard) return;

      setRoyalDeck(prev => prev.filter(c => c.id !== royalCard.id));
      setPlayerRoyals(prev => ({ ...prev, [turn]: [...prev[turn], royalCard] }));

      let nextTurnPlayer = nextPlayerAfterRoyal; 

      if (royalCard.ability === ABILITIES.AGAIN.id) {
          setErrorMsg("ROYAL: Play Again!");
          nextTurnPlayer = turn; 
      } 
      else if (royalCard.ability === ABILITIES.STEAL.id) {
           const opponent = turn === 'p1' ? 'p2' : 'p1';
           const hasGems = Object.keys(inventories[opponent]).some(k => k !== 'gold' && inventories[opponent][k] > 0);
           if (hasGems) {
               setGameMode('STEAL_ACTION');
               setErrorMsg("ROYAL: Steal! Click an opponent's gem.");
               setNextPlayerAfterRoyal(nextTurnPlayer); 
               return; 
           }
      }
      else if (royalCard.ability === ABILITIES.SCROLL.id) {
          performTakePrivilege(turn);
          setErrorMsg("ROYAL: Took Privilege.");
      }

      setGameMode('IDLE');
      finalizeTurn(nextTurnPlayer);
  };


  const executeBuy = (card, source = 'market', marketInfo = {}) => {
      const inv = inventories[turn];
      const newInv = { ...inv };
      const bonuses = BONUS_COLORS.reduce((acc, color) => { 
          acc[color] = playerTableau[turn]
            .filter(c => c.bonusColor === color)
            .reduce((sum, c) => sum + (c.bonusCount || 1), 0);
          return acc; 
      }, {});
      
      let goldCost = 0; const gemsToReturn = [];
      Object.entries(card.cost).forEach(([color, cost]) => {
          const discount = color === 'pearl' ? 0 : (bonuses[color] || 0);
          const needed = Math.max(0, cost - discount);
          const available = newInv[color];
          let paidAmt = 0; if (available >= needed) { newInv[color] -= needed; paidAmt = needed; } else { newInv[color] = 0; paidAmt = available; goldCost += (needed - available); }
          for(let k=0; k < paidAmt; k++) { gemsToReturn.push({ type: GEM_TYPES[color.toUpperCase()], uid: `returned-${color}-${Date.now()}-${k}` }); }
      });
      newInv.gold -= goldCost;
      for(let k=0; k < goldCost; k++) { gemsToReturn.push({ type: GEM_TYPES.GOLD, uid: `returned-gold-${Date.now()}-${k}` }); }

      setInventories({ ...inventories, [turn]: newInv });
      const newTableau = [...playerTableau[turn], card];
      setPlayerTableau({ ...playerTableau, [turn]: newTableau });
      setBag(prev => [...prev, ...gemsToReturn]);

      if (source === 'market') {
          const newMarket = {...market}; const { level, idx } = marketInfo;
          if (decks[level].length > 0) newMarket[level][idx] = decks[level].pop(); else newMarket[level][idx] = null;
          setMarket(newMarket);
      } else if (source === 'reserved') {
          setPlayerReserved({ ...playerReserved, [turn]: playerReserved[turn].filter(c => c.id !== card.id) });
      }

      let nextTurn = turn === 'p1' ? 'p2' : 'p1'; 
      let abilityMode = null;

      if (card.ability && card.ability !== ABILITIES.NONE.id) {
          const abils = Array.isArray(card.ability) ? card.ability : [card.ability];
          for(const abil of abils) {
              if (abil === ABILITIES.AGAIN.id) nextTurn = turn; 
              if (abil === ABILITIES.SCROLL.id) performTakePrivilege(turn);
              if (abil === ABILITIES.STEAL.id) abilityMode = 'STEAL_ACTION';
              if (abil === ABILITIES.BONUS_GEM.id) {
                   const targetColor = card.bonusColor;
                   if (board.some(row => row.some(g => g.type.id === targetColor))) {
                       abilityMode = 'BONUS_ACTION';
                       setBonusGemTarget(targetColor);
                   }
              }
          }
      }

      const currentCrowns = [...newTableau, ...playerRoyals[turn]].reduce((acc, c) => acc + (c.crowns || 0), 0);
      const myMilestones = royalMilestones[turn];
      let triggerRoyal = false;

      if (currentCrowns >= 3 && !myMilestones[3]) {
          triggerRoyal = true;
          setRoyalMilestones(prev => ({ ...prev, [turn]: { ...prev[turn], 3: true } }));
      }
      else if (currentCrowns >= 6 && !myMilestones[6]) {
          triggerRoyal = true;
          setRoyalMilestones(prev => ({ ...prev, [turn]: { ...prev[turn], 6: true } }));
      }

      if (triggerRoyal && royalDeck.length > 0) {
          setNextPlayerAfterRoyal(nextTurn); 
          setGameMode('SELECT_ROYAL');
          setErrorMsg("Crown Milestone Reached! Choose a Royal Card.");
          return; 
      }

      if (abilityMode) {
          setGameMode(abilityMode);
          if (abilityMode === 'STEAL_ACTION') setErrorMsg("ABILITY: Steal! Click opponent's gem.");
          if (abilityMode === 'BONUS_ACTION') setErrorMsg(`ABILITY: Take 1 ${card.bonusColor} gem.`);
          setNextPlayerAfterRoyal(nextTurn);
      } else {
          finalizeTurn(nextTurn, newInv);
      }
  };

  const handleCancelReserve = () => { setPendingReserve(null); setGameMode('IDLE'); setErrorMsg("Reserve cancelled."); setTimeout(() => setErrorMsg(null), 1500); };
  const activatePrivilegeMode = () => { if (privileges[turn] > 0) { setGameMode('PRIVILEGE_ACTION'); setSelectedGems([]); } };
  const cancelPrivilegeMode = () => { setGameMode('IDLE'); };
  const checkAndInitiateBuyReserved = (card, execute = false) => { const canAfford = calculateCost(card, turn, inventories, playerTableau); if (execute && canAfford) initiateBuy(card, 'reserved'); return canAfford; };

  // --- Render ---
  const settings = RESOLUTION_SETTINGS[resolution];

return (
    <div className="min-h-screen bg-slate-950 text-slate-100 font-sans flex flex-col items-center overflow-hidden">
      
      {/* 1. 调试开关 */}
      <button 
        onClick={() => setShowDebug(!showDebug)}
        className="fixed top-2 left-2 z-[100] bg-slate-800/80 hover:bg-red-900/60 text-slate-400 p-2 rounded border border-slate-700 text-[10px] transition-colors"
      >
        {showDebug ? 'CLOSE DEBUG' : 'OPEN DEBUG'}
      </button>

      {/* 2. 调试面板 */}
      {showDebug && (
        <div className="fixed left-4 top-16 z-[90] flex flex-col gap-4 animate-in slide-in-from-left duration-300">
          <DebugPanel 
            player="p1" 
            setPlayerTableau={setPlayerTableau} 
            setPlayerRoyals={setPlayerRoyals}
            onForceRoyal={() => { setGameMode('SELECT_ROYAL'); setNextPlayerAfterRoyal(turn === 'p1' ? 'p2' : 'p1'); }}
          />
          <DebugPanel 
            player="p2" 
            setPlayerTableau={setPlayerTableau} 
            setPlayerRoyals={setPlayerRoyals}
            onForceRoyal={() => { setGameMode('SELECT_ROYAL'); setNextPlayerAfterRoyal(turn === 'p1' ? 'p2' : 'p1'); }}
          />
        </div>
      )}

      {/* 3. 分辨率切换器 */}
      <div className="absolute top-2 right-2 z-50 group">
          <button className="bg-slate-800/80 hover:bg-slate-700 text-white p-2 rounded-lg backdrop-blur-md border border-slate-600 shadow-xl flex items-center gap-2 transition-all">
              <Monitor size={16} />
              <span className="text-xs font-bold hidden md:inline">{settings.label}</span>
          </button>
          
          <div className="absolute right-0 top-full pt-2 hidden group-hover:block w-32 animate-in fade-in slide-in-from-top-2">
              <div className="bg-slate-800 rounded-lg shadow-xl border border-slate-700 overflow-hidden">
                  {Object.entries(RESOLUTION_SETTINGS).map(([key, config]) => (
                      <button 
                        key={key}
                        onClick={() => setResolution(key)}
                        className={`w-full text-left px-4 py-2 text-xs font-bold hover:bg-slate-700 transition-colors ${resolution === key ? 'text-emerald-400 bg-slate-900' : 'text-slate-400'}`}
                      >
                          {config.label}
                      </button>
                  ))}
              </div>
          </div>
      </div>

      {/* 4. 胜利弹窗 */}
      {winner && (
        <div className="fixed inset-0 z-[100] bg-black/90 flex flex-col items-center justify-center animate-in zoom-in duration-300">
           <Trophy size={80} className="text-yellow-400 mb-4 drop-shadow-[0_0_20px_rgba(250,204,21,0.5)] animate-bounce" />
           <h1 className="text-5xl font-black text-white mb-2">{winner === 'p1' ? 'Player 1' : 'Player 2'} Wins!</h1>
           <p className="text-slate-400 text-lg mb-8">Congratulations!</p>
           <button onClick={() => window.location.reload()} className="bg-emerald-600 hover:bg-emerald-500 text-white px-8 py-3 rounded-full font-bold text-xl shadow-xl transition-transform hover:scale-105">Play Again</button>
        </div>
      )}

      {/* 5. 主容器 */}
      <div className="w-full h-screen flex flex-col p-0">

        {/* 顶部：对手区域 */}
        <div className={`w-full ${settings.zoneHeight} shrink-0 z-30 flex justify-center items-start pt-4 overflow-visible bg-slate-950/50 backdrop-blur-sm relative border-b border-slate-800/30 transition-all duration-500`}>
          <div className={`w-[98%] max-w-[1800px] transform ${settings.zoneScale} origin-top transition-transform duration-500`}>
            <PlayerZone 
                player={turn === 'p1' ? 'p2' : 'p1'} 
                inventory={turn === 'p1' ? inventories.p2 : inventories.p1} 
                cards={turn === 'p1' ? playerTableau.p2 : playerTableau.p1} 
                reserved={turn === 'p1' ? playerReserved.p2 : playerReserved.p1} 
                royals={turn === 'p1' ? playerRoyals.p2 : playerRoyals.p1}
                privileges={turn === 'p1' ? privileges.p2 : privileges.p1}
                score={getPlayerScore(turn === 'p1' ? 'p2' : 'p1')} 
                isActive={false} 
                onBuyReserved={() => false}
                onUsePrivilege={() => {}}
                isPrivilegeMode={false}
                isStealMode={gameMode === 'STEAL_ACTION'}
                isDiscardMode={false} 
                onGemClick={handleOpponentGemClick}
            />
          </div>
        </div>

        {/* 中间：主游戏区 */}
        <div className="flex-1 flex items-center justify-center min-h-0 relative z-10 px-6">
             <div className={`flex flex-row gap-8 xl:gap-12 items-center justify-center transform ${settings.boardScale} origin-center transition-all duration-500`}>
                
                {/* 左侧市场 (Market) */}
                <div className="flex flex-col gap-4 items-center shrink-0 w-fit"> 
                    <h2 className="text-[10px] font-bold text-slate-500 uppercase tracking-widest border-b border-slate-800 pb-1 mb-1 w-full text-center">Market</h2>
                    {[3, 2, 1].map(lvl => (
                    <div key={lvl} className="flex gap-3 justify-center items-center">
                        <div 
                            onClick={() => handleReserveDeck(lvl)}
                            className={`w-20 h-28 shrink-0 rounded-lg border-2 flex flex-col items-center justify-center transition-all duration-200 shadow-md relative overflow-hidden group
                                ${gameMode === 'IDLE' && decks[lvl].length > 0 ? 'border-slate-600 cursor-pointer hover:border-emerald-400 hover:scale-105' : 'border-slate-800 cursor-default opacity-40'}
                            `}
                        >
                            <div className="absolute inset-0 bg-slate-900" />
                            <div className="relative z-10 flex flex-col items-center">
                                <Layers size={18} className="text-slate-500 mb-1" />
                                <div className="text-slate-400 font-bold text-[10px]">Lvl {lvl}</div>
                                <div className="text-slate-600 text-[9px] font-mono">{decks[lvl].length}</div>
                            </div>
                        </div>

                        {market[lvl].map((card, i) => (
                        <Card key={i} card={card} 
                            canBuy={gameMode === 'IDLE' && card && calculateCost(card, turn, inventories, playerTableau)} 
                            onClick={() => card && initiateBuy(card, 'market', { level: lvl, idx: i })}
                            onReserve={() => card && handleReserveCard(card, lvl, i)}
                        />
                        ))}
                    </div>
                    ))}
                </div>

                {/* 中央宝石盘 (Board) */}
                <div className="relative flex flex-col items-center shrink-0">
                    {/* 状态提示 */}
                    <div className={`absolute -top-12 bg-red-500/90 text-white px-4 py-1.5 rounded-full shadow-xl text-sm font-semibold transition-all duration-300 z-50 flex items-center gap-2 whitespace-nowrap ${errorMsg ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4 pointer-events-none'}`}>
                        <Info size={14} /> {errorMsg}
                    </div>

                    {/* 宝石盘背景及网格 */}
                    <div className={`bg-slate-800/80 p-3 rounded-2xl shadow-2xl border transition-colors duration-300 backdrop-blur-sm ${gameMode === 'DISCARD_EXCESS_GEMS' ? 'border-red-500/50' : 'border-slate-700/50'}`}>
                        <div className="text-right text-[10px] text-slate-500 mb-1 font-mono">Bag: {bag.length}</div>
                        <div className="grid grid-cols-5 grid-rows-5 gap-2 w-[300px] h-[300px]">
                             {board.map((row, r) => row.map((gem, c) => {
                                const isSelectedGem = isSelected(r, c);
                                const isGold = gem && gem.type.id === 'gold';
                                let isTarget = false;
                                if (gameMode === 'RESERVE_WAITING_GEM') isTarget = isGold;
                                else if (gameMode === 'PRIVILEGE_ACTION') isTarget = !isGold;
                                else if (gameMode === 'BONUS_ACTION') isTarget = gem && gem.type.id === bonusGemTarget;
                                const isEmpty = gem && gem.type.id === 'empty';
                                return (
                                <button key={`${r}-${c}-${gem ? gem.uid : 'null'}`} onClick={() => handleGemClick(r, c)} disabled={isEmpty} className={`relative group w-full h-full rounded-full flex items-center justify-center transition-all duration-150 ${isEmpty ? 'cursor-default' : 'cursor-pointer hover:scale-105 active:scale-95'}`}>
                                    {isEmpty ? <div className="w-2 h-2 rounded-full bg-slate-700/30"></div> : (
                                    <div className={`w-full h-full rounded-full shadow-inner bg-gradient-to-br ${gem.type.color} border ${gem.type.border} 
                                        ${isSelectedGem ? 'ring-2 ring-white scale-105 shadow-[0_0_10px_white]' : 'opacity-90'} 
                                        ${isTarget ? 'ring-4 ring-white animate-pulse z-20' : ''} 
                                        ${!isEmpty && gameMode !== 'IDLE' && !isTarget ? 'opacity-20 grayscale' : ''}
                                    `}>
                                        {isGold && <div className="absolute inset-0 flex items-center justify-center text-yellow-900 font-bold text-xs opacity-50">G</div>}
                                        {isSelectedGem && <div className="absolute inset-0 flex items-center justify-center font-bold text-white drop-shadow-md text-lg">{selectedGems.findIndex(s => s.r === r && s.c === c) + 1}</div>}
                                    </div>
                                    )}
                                </button>
                                );
                            }))}
                        </div>
                    </div>

                    {/* 操作按钮组 */}
                    <div className="flex gap-2 mt-4 w-full justify-center">
                        <button 
                            onClick={handleUndo} 
                            disabled={historyStack.length === 0}
                            className={`p-3 rounded-xl border transition-colors shadow-lg flex items-center justify-center
                                ${historyStack.length > 0 
                                    ? 'bg-slate-800 border-slate-600 text-slate-200 hover:border-yellow-500 hover:text-yellow-500' 
                                    : 'bg-slate-900/50 border-slate-800 text-slate-700 cursor-not-allowed'}
                            `}
                        >
                            <Undo2 size={20} />
                        </button>

                        <button onClick={handleReplenish} className="p-3 rounded-xl bg-slate-700 hover:bg-slate-600 transition-colors shadow-lg"><RefreshCw size={20} className={bag.length === 0 ? "text-slate-500" : "text-white"} /></button>
                        {gameMode === 'IDLE' && <button onClick={handleConfirmTake} disabled={selectedGems.length === 0} className={`flex-1 flex items-center justify-center gap-2 px-6 py-3 rounded-xl font-bold shadow-xl transition-all ${selectedGems.length > 0 ? 'bg-gradient-to-r from-emerald-500 to-teal-500 text-white hover:brightness-110' : 'bg-slate-800 text-slate-600'}`}><ShoppingBag size={18} /> Take</button>}
                        {(['PRIVILEGE_ACTION', 'STEAL_ACTION', 'BONUS_ACTION', 'SELECT_ROYAL'].includes(gameMode)) && <button onClick={() => { setGameMode('IDLE'); setTurn(turn === 'p1' ? 'p2' : 'p1'); }} className="flex-1 bg-slate-600 text-white px-6 py-3 rounded-xl font-bold shadow-xl hover:bg-slate-500 flex items-center justify-center gap-2"><X size={18} /> Skip Action</button>}
                        {gameMode === 'RESERVE_WAITING_GEM' && <button onClick={handleCancelReserve} className="flex-1 bg-rose-600 text-white px-6 py-3 rounded-xl font-bold shadow-xl hover:bg-rose-500 flex items-center justify-center gap-2"><X size={18} /> Cancel</button>}
                    </div>
                </div>

                {/* 右侧皇室卡区域 (Royal Court) */}
                <div className="flex flex-col gap-4 items-center bg-slate-900/40 p-4 rounded-3xl border border-slate-800/50 backdrop-blur-sm shrink-0 w-fit">
                    <h2 className="text-[10px] font-bold text-yellow-500/70 uppercase tracking-widest flex items-center gap-2 mb-2">
                        <Crown size={14} /> Royal Court
                    </h2>
                    <div className="grid grid-cols-2 gap-3">
                        {royalDeck.length > 0 ? (
                            royalDeck.map(card => (
                                <div 
                                    key={card.id} 
                                    className={`relative transition-all duration-300 ${gameMode === 'SELECT_ROYAL' ? 'cursor-pointer hover:scale-110 hover:rotate-1 z-50 ring-4 ring-yellow-400/50 rounded-lg shadow-xl' : 'opacity-80 grayscale-[0.2]'}`}
                                    onClick={() => gameMode === 'SELECT_ROYAL' && handleSelectRoyal(card)}
                                >
                                    <Card card={card} isRoyal={true} />
                                    {gameMode === 'SELECT_ROYAL' && (
                                        <div className="absolute -top-2 -right-2 bg-yellow-500 text-black text-[9px] font-black px-1.5 py-0.5 rounded-full animate-bounce shadow-lg">PICK!</div>
                                    )}
                                </div>
                            ))
                        ) : (
                            <div className="col-span-2 h-64 flex items-center justify-center text-slate-700 italic text-xs">Court is Empty</div>
                        )}
                    </div>
                </div>
             </div>
        </div>

        {/* 底部：当前玩家区域 */}
        <div className={`w-full ${settings.zoneHeight} shrink-0 z-30 flex justify-center items-end pb-4 overflow-visible bg-slate-950/50 backdrop-blur-sm relative border-t border-slate-800/30 transition-all duration-500`}>
             <div className={`w-[98%] max-w-[1800px] transform ${settings.zoneScale} origin-bottom transition-transform duration-500`}>
                <PlayerZone 
                    player={turn} 
                    inventory={inventories[turn]} 
                    cards={playerTableau[turn]} 
                    reserved={playerReserved[turn]} 
                    royals={playerRoyals[turn]}
                    privileges={privileges[turn]}
                    score={getPlayerScore(turn)} 
                    isActive={true} 
                    onBuyReserved={checkAndInitiateBuyReserved}
                    onUsePrivilege={activatePrivilegeMode}
                    isPrivilegeMode={gameMode === 'PRIVILEGE_ACTION'}
                    isStealMode={gameMode === 'STEAL_ACTION'}
                    isDiscardMode={gameMode === 'DISCARD_EXCESS_GEMS'}
                    onGemClick={gameMode === 'DISCARD_EXCESS_GEMS' ? handleSelfGemClick : handleOpponentGemClick}
                />
             </div>
        </div>
      </div>
    </div>
  );
  

function DebugPanel({ player, setPlayerTableau, setPlayerRoyals, onForceRoyal }) {
  const addDebugCrowns = () => {
    setPlayerTableau(prev => ({
      ...prev,
      [player]: [...prev[player], { id: `debug-${Date.now()}`, crowns: 3, points: 0, cost: {}, bonusColor: 'white' }]
    }));
  };

  const addDebugPoints = () => {
    setPlayerRoyals(prev => ({
      ...prev,
      [player]: [...prev[player], { id: `debug-pt-${Date.now()}`, points: 10, crowns: 0, ability: 'none' }]
    }));
  };

  return (
    <div className="bg-slate-900/90 border-2 border-red-900/50 p-3 rounded-lg backdrop-blur-md shadow-2xl w-48">
      <div className="text-red-500 font-bold text-[10px] mb-2 uppercase tracking-tighter border-b border-red-900/30 pb-1">
        Bug Modifier: {player}
      </div>
      <div className="flex flex-col gap-2">
        <button onClick={addDebugCrowns} className="bg-slate-800 hover:bg-slate-700 text-white text-[9px] py-1 rounded border border-slate-600 transition-colors text-left px-2">
          +3 Crowns (Add Card)
        </button>
        <button onClick={addDebugPoints} className="bg-slate-800 hover:bg-slate-700 text-white text-[9px] py-1 rounded border border-slate-600 transition-colors text-left px-2">
          +10 Points (Add Card)
        </button>
        <button onClick={onForceRoyal} className="bg-red-900/40 hover:bg-red-800/60 text-red-200 text-[9px] py-1 rounded border border-red-700 transition-colors font-bold">
          FORCE ROYAL SELECTION
        </button>
      </div>
    </div>
  );
}
}