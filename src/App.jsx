import React, { useState, useEffect } from 'react';
import { RefreshCw, Info, X, ShoppingBag, Crown, Trophy, Layers, Monitor } from 'lucide-react';

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

    if (gameMode === 'BONUS_ACTION') {
        if (gem.type.id !== bonusGemTarget) { setErrorMsg(`Must select a ${bonusGemTarget} gem!`); setTimeout(() => setErrorMsg(null), 2000); return; }
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
        const newBoard = [...board]; newBoard[r][c] = { type: GEM_TYPES.EMPTY, uid: `empty-${r}-${c}-${Date.now()}` };
        const newInv = { ...inventories[turn] }; newInv[gem.type.id]++;
        const newPrivs = { ...privileges }; newPrivs[turn]--; 
        setBoard(newBoard); setInventories({ ...inventories, [turn]: newInv }); setPrivileges(newPrivs);
        setGameMode('IDLE');
        return;
    }

    if (gameMode === 'RESERVE_WAITING_GEM') {
      if (gem.type.id !== 'gold') { setErrorMsg("Must select a Gold gem!"); setTimeout(() => setErrorMsg(null), 2000); return; }
      
      if (pendingReserve.type === 'market') {
          executeReserve(pendingReserve.card, pendingReserve.level, pendingReserve.idx, true, { r, c });
      } else if (pendingReserve.type === 'deck') {
          executeReserveFromDeck(pendingReserve.level, true, { r, c });
      }
      return;
    }

    if (gameMode !== 'IDLE') return;

    if (isSelected(r, c)) {
      if (selectedGems.length > 0) {
        const last = selectedGems[selectedGems.length - 1];
        if (last.r === r && last.c === c) { setSelectedGems(selectedGems.slice(0, -1)); return; }
      }
      setSelectedGems([]); return;
    }
    if (gem.type.id === 'gold') { setErrorMsg("Cannot take Gold directly!"); setTimeout(() => setErrorMsg(null), 2000); return; }
    if (selectedGems.length >= 3) { setErrorMsg("Max 3 gems."); setTimeout(() => setErrorMsg(null), 1500); return; }
    if (selectedGems.length > 0) {
      const last = selectedGems[selectedGems.length - 1];
      if (!isAdjacent(last.r, last.c, r, c)) { setErrorMsg("Must be adjacent."); setTimeout(() => setErrorMsg(null), 1500); return; }
      if (selectedGems.length === 2) {
        const first = selectedGems[0];
        const second = selectedGems[1];
        const dir1 = getDirection(first.r, first.c, second.r, second.c);
        const dir2 = getDirection(second.r, second.c, r, c);
        if (dir1.dr !== dir2.dr || dir1.dc !== dir2.dc) { setErrorMsg("Must be straight line."); setTimeout(() => setErrorMsg(null), 1500); return; }
      }
    }
    setSelectedGems([...selectedGems, { r, c }]);
  };

  const handleOpponentGemClick = (gemId) => {
      if (gameMode !== 'STEAL_ACTION') return;
      const opponent = turn === 'p1' ? 'p2' : 'p1';
      const newOpponentInv = { ...inventories[opponent] };
      const newPlayerInv = { ...inventories[turn] };
      if (newOpponentInv[gemId] > 0) {
          newOpponentInv[gemId]--; newPlayerInv[gemId]++;
          
          setInventories({ p1: turn === 'p1' ? newPlayerInv : newOpponentInv, p2: turn === 'p2' ? newPlayerInv : newOpponentInv });
          setErrorMsg(`Stole a ${gemId} gem!`); setTimeout(() => setErrorMsg(null), 2000);
          
          const nextP = nextPlayerAfterRoyal || (turn === 'p1' ? 'p2' : 'p1');
          finalizeTurn(nextP, newPlayerInv);
      }
  };

  const handleConfirmTake = () => {
    if (selectedGems.length === 0) return;
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
      
      {/* Resolution Switcher */}
      {/* 🟢 修复：添加 pt-2 到隐藏容器，作为隐形桥梁连接按钮和菜单，防止鼠标悬停丢失 */}
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

      {winner && (
        <div className="fixed inset-0 z-[100] bg-black/90 flex flex-col items-center justify-center animate-in zoom-in duration-300">
           <Trophy size={80} className="text-yellow-400 mb-4 drop-shadow-[0_0_20px_rgba(250,204,21,0.5)] animate-bounce" />
           <h1 className="text-5xl font-black text-white mb-2">{winner === 'p1' ? 'Player 1' : 'Player 2'} Wins!</h1>
           <p className="text-slate-400 text-lg mb-8">Congratulations!</p>
           <button onClick={() => window.location.reload()} className="bg-emerald-600 hover:bg-emerald-500 text-white px-8 py-3 rounded-full font-bold text-xl shadow-xl transition-transform hover:scale-105">Play Again</button>
        </div>
      )}

      {/* Main Container */}
      <div className="w-full h-screen flex flex-col p-0">

        {/* 1. 顶部：对手区域 */}
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

        {/* 2. 中间：主游戏区 */}
        <div className="flex-1 flex items-center justify-center min-h-0 relative z-10">
             <div className={`flex flex-col xl:flex-row gap-12 items-center justify-center transform ${settings.boardScale} origin-center transition-transform duration-500`}>
                
                {/* Market */}
                <div className="flex flex-col gap-4 items-center xl:items-center"> 
                    <h2 className="text-xs font-bold text-slate-500 uppercase tracking-widest border-b border-slate-800 pb-1 mb-1 w-full text-center">Market</h2>
                    {[3, 2, 1].map(lvl => (
                    <div key={lvl} className="flex gap-4 justify-center items-center">
                        {/* Deck */}
                        <div 
                            onClick={() => handleReserveDeck(lvl)}
                            className={`w-24 h-32 rounded-lg border-2 flex flex-col items-center justify-center transition-all duration-200 shadow-md relative overflow-hidden group
                                ${gameMode === 'IDLE' && decks[lvl].length > 0 ? 'border-slate-600 cursor-pointer hover:border-emerald-400 hover:scale-105 hover:shadow-lg hover:shadow-emerald-500/20' : 'border-slate-800 cursor-default opacity-40'}
                            `}
                        >
                            <div className="absolute inset-0 bg-slate-800 opacity-80" />
                            <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-slate-700 via-slate-900 to-slate-950" />
                            <div className="relative z-10 flex flex-col items-center">
                                <Layers size={20} className="text-slate-400 mb-1 group-hover:text-emerald-400 transition-colors" />
                                <div className="text-slate-300 font-bold text-xs">Level {lvl}</div>
                                <div className="text-slate-500 text-[10px] font-mono mt-0.5">{decks[lvl].length}</div>
                            </div>
                            {gameMode === 'IDLE' && decks[lvl].length > 0 && (
                                <div className="absolute bottom-2 text-[9px] text-emerald-400 font-bold uppercase tracking-wider opacity-0 group-hover:opacity-100 transition-opacity z-10">
                                    Reserve
                                </div>
                            )}
                        </div>

                        {/* Market Cards */}
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

                {/* Board */}
                <div className="relative flex flex-col items-center">
                    <div className={`absolute -top-12 bg-red-500/90 text-white px-4 py-1.5 rounded-full shadow-xl text-sm font-semibold transition-all duration-300 z-50 flex items-center gap-2 whitespace-nowrap ${errorMsg ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4 pointer-events-none'}`}>
                        <Info size={14} /> {errorMsg}
                    </div>

                    <div className="absolute -top-8 w-full flex justify-center pointer-events-none">
                        {gameMode === 'RESERVE_WAITING_GEM' && <div className="bg-yellow-500/20 border border-yellow-500 text-yellow-200 px-4 py-0.5 rounded-full text-xs font-bold animate-pulse">Select Gold...</div>}
                        {gameMode === 'PRIVILEGE_ACTION' && <div className="bg-amber-500/20 border border-amber-500 text-amber-200 px-4 py-0.5 rounded-full text-xs font-bold animate-pulse">Select 1 Gem...</div>}
                        {gameMode === 'BONUS_ACTION' && <div className="bg-emerald-500/20 border border-emerald-500 text-emerald-200 px-4 py-0.5 rounded-full text-xs font-bold animate-pulse">Select {bonusGemTarget}...</div>}
                        {gameMode === 'STEAL_ACTION' && <div className="bg-rose-500/20 border border-rose-500 text-rose-200 px-4 py-0.5 rounded-full text-xs font-bold animate-pulse">Steal Gem...</div>}
                        {gameMode === 'SELECT_ROYAL' && <div className="bg-purple-500/20 border border-purple-500 text-purple-200 px-4 py-0.5 rounded-full text-xs font-bold animate-pulse">Choose a Royal...</div>}
                        {gameMode === 'DISCARD_EXCESS_GEMS' && <div className="bg-red-500/20 border border-red-500 text-red-200 px-4 py-0.5 rounded-full text-xs font-bold animate-pulse">Limit 10! Click YOUR gems to discard...</div>}
                    </div>

                    {gameMode === 'SELECT_CARD_COLOR' && (
                        <div className="absolute inset-0 z-50 flex flex-col items-center justify-center bg-black/80 rounded-2xl backdrop-blur-sm animate-in fade-in">
                            <h3 className="text-white font-bold text-lg mb-4 drop-shadow-md">Select Color</h3>
                            <div className="flex gap-3">
                                {BONUS_COLORS.map(color => (
                                    <button key={color} onClick={() => handleSelectBonusColor(color)} className={`w-12 h-12 rounded-full border-2 ${GEM_TYPES[color.toUpperCase()].color} ${GEM_TYPES[color.toUpperCase()].border} hover:scale-110 transition-transform shadow-[0_0_15px_rgba(255,255,255,0.3)]`} title={color.toUpperCase()} />
                                ))}
                            </div>
                            <button onClick={() => { setGameMode('IDLE'); setPendingBuy(null); }} className="mt-6 text-slate-400 hover:text-white text-sm">Cancel</button>
                        </div>
                    )}

                    {gameMode === 'SELECT_ROYAL' && (
                        <div className="absolute inset-0 z-50 flex flex-col items-center justify-center bg-black/90 rounded-2xl backdrop-blur-sm animate-in fade-in p-6">
                            <h3 className="text-yellow-400 font-bold text-2xl mb-2 drop-shadow-md flex items-center gap-2"><Crown /> Royal Court</h3>
                            <p className="text-slate-300 text-sm mb-6">You reached a Crown Milestone! Choose a companion.</p>
                            <div className="flex gap-4 flex-wrap justify-center">
                                {royalDeck.map(card => (
                                    <div key={card.id} className="hover:scale-110 transition-transform cursor-pointer" onClick={() => handleSelectRoyal(card)}>
                                        <Card card={card} isRoyal={true} />
                                        <div className="text-center text-xs mt-2 text-slate-400 font-bold">{card.label}</div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    <div className={`bg-slate-800/80 p-3 rounded-2xl shadow-2xl border transition-colors duration-300 backdrop-blur-sm
                        ${gameMode === 'RESERVE_WAITING_GEM' ? 'border-yellow-500/50' : 
                        gameMode === 'PRIVILEGE_ACTION' ? 'border-amber-500/50' : 
                        gameMode === 'BONUS_ACTION' ? 'border-emerald-500/50' :
                        gameMode === 'SELECT_ROYAL' ? 'border-purple-500/50' :
                        gameMode === 'DISCARD_EXCESS_GEMS' ? 'border-red-500/50 shadow-red-500/20' :
                        'border-slate-700/50'} 
                    `}>
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
                                const isDimmed = !isEmpty && gameMode !== 'IDLE' && !isTarget; 
                                return (
                                <button key={`${r}-${c}-${gem ? gem.uid : 'null'}`} onClick={() => handleGemClick(r, c)} disabled={isEmpty} className={`relative group w-full h-full rounded-full flex items-center justify-center transition-all duration-150 ${isEmpty ? 'cursor-default' : 'cursor-pointer hover:scale-105 active:scale-95'}`}>
                                    {isEmpty ? <div className="w-2 h-2 rounded-full bg-slate-700/30"></div> : (
                                    <div className={`w-full h-full rounded-full shadow-inner bg-gradient-to-br ${gem.type.color} border ${gem.type.border} 
                                        ${isSelectedGem ? 'ring-2 ring-white scale-105 shadow-[0_0_10px_white]' : 'opacity-90'} 
                                        ${isTarget ? 'ring-4 ring-white animate-pulse z-20' : ''} 
                                        ${isDimmed ? 'opacity-20 grayscale' : ''}
                                    `}>
                                        {isGold && <div className="absolute inset-0 flex items-center justify-center text-yellow-900 font-bold text-xs opacity-50">G</div>}
                                        {gem.type.id === 'pearl' && <div className="absolute inset-0 flex items-center justify-center text-pink-900 font-bold text-xs opacity-50">P</div>}
                                        {isSelectedGem && <div className="absolute inset-0 flex items-center justify-center font-bold text-white drop-shadow-md text-lg">{selectedGems.findIndex(s => s.r === r && s.c === c) + 1}</div>}
                                    </div>
                                    )}
                                </button>
                                );
                            }))}
                        </div>
                    </div>

                    <div className="flex gap-2 mt-4 w-full justify-center">
                        <button onClick={handleReplenish} className="p-3 rounded-xl bg-slate-700 hover:bg-slate-600 transition-colors shadow-lg" title="Replenish Board"><RefreshCw size={20} className={bag.length === 0 ? "text-slate-500" : "text-white"} /></button>
                        {gameMode === 'IDLE' && <button onClick={handleConfirmTake} disabled={selectedGems.length === 0} className={`flex-1 flex items-center justify-center gap-2 px-6 py-3 rounded-xl font-bold shadow-xl transition-all ${selectedGems.length > 0 ? 'bg-gradient-to-r from-emerald-500 to-teal-500 text-white hover:brightness-110' : 'bg-slate-800 text-slate-600'}`}><ShoppingBag size={18} /> Take</button>}
                        {(gameMode === 'PRIVILEGE_ACTION' || gameMode === 'STEAL_ACTION' || gameMode === 'BONUS_ACTION' || gameMode === 'SELECT_ROYAL') && <button onClick={() => { setGameMode('IDLE'); setTurn(turn === 'p1' ? 'p2' : 'p1'); }} className="flex-1 bg-slate-600 text-white px-6 py-3 rounded-xl font-bold shadow-xl hover:bg-slate-500 flex items-center justify-center gap-2"><X size={18} /> Skip</button>}
                        {gameMode === 'RESERVE_WAITING_GEM' && <button onClick={handleCancelReserve} className="flex-1 bg-rose-600 text-white px-6 py-3 rounded-xl font-bold shadow-xl hover:bg-rose-500 flex items-center justify-center gap-2 animate-in fade-in"><X size={18} /> Cancel</button>}
                    </div>
                </div>
             </div>
        </div>

        {/* 3. 底部：当前玩家 */}
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
}