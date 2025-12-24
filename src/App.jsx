import React, { useState, useEffect } from 'react';
import { RefreshCw, Shield, Info, X, ShoppingBag, Scroll } from 'lucide-react';

// 引入模块
import { GRID_SIZE, GEM_TYPES, BONUS_COLORS, SPIRAL_ORDER } from './constants';
import { generateGemPool, generateDeck, isAdjacent, getDirection, calculateCost } from './utils';
import { Card } from './components/Card';
import { PlayerZone } from './components/PlayerZone';

export default function SplendorDuelBoard() {
  // --- State Definitions ---
  const [board, setBoard] = useState([]);
  const [bag, setBag] = useState([]);
  const [turn, setTurn] = useState('p1');
  const [selectedGems, setSelectedGems] = useState([]);
  const [errorMsg, setErrorMsg] = useState(null);
  
  // Game Modes: 'IDLE', 'RESERVE_WAITING_GEM', 'PRIVILEGE_ACTION'
  const [gameMode, setGameMode] = useState('IDLE');
  
  // 🟢 新增：暂存预约操作的数据 (用于反悔逻辑)
  const [pendingReserve, setPendingReserve] = useState(null); // { card, level, idx }

  const [decks, setDecks] = useState({ 1: [], 2: [], 3: [] });
  const [market, setMarket] = useState({ 1: [], 2: [], 3: [] });
  const [inventories, setInventories] = useState({
    p1: { blue: 0, white: 0, green: 0, black: 0, red: 0, gold: 0, pearl: 0 },
    p2: { blue: 0, white: 0, green: 0, black: 0, red: 0, gold: 0, pearl: 0 },
  });
  const [privileges, setPrivileges] = useState({ p1: 0, p2: 0 });
  
  const [playerTableau, setPlayerTableau] = useState({ p1: [], p2: [] });
  const [playerReserved, setPlayerReserved] = useState({ p1: [], p2: [] });

  // --- Initialization ---
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
    setMarket({ 3: d3.splice(0, 3), 2: d2.splice(0, 4), 1: d1.splice(0, 4) });
    setDecks({ 1: d1, 2: d2, 3: d3 });
  }, []);

  // --- Helpers ---
  const getGemAt = (r, c) => (r >= 0 && r < GRID_SIZE && c >= 0 && c < GRID_SIZE) ? board[r][c] : null;
  const isSelected = (r, c) => selectedGems.some(s => s.r === r && s.c === c);
  const getPlayerScore = (pid) => playerTableau[pid].reduce((acc, c) => acc + c.points, 0);

  // --- Logic: Give Privilege ---
  const giveOpponentPrivilege = () => {
    const opponent = turn === 'p1' ? 'p2' : 'p1';
    const totalInPlay = privileges.p1 + privileges.p2;
    let newPrivs = { ...privileges };
    let msg = "";

    if (totalInPlay < 3) {
        newPrivs[opponent]++;
        msg = "Opponent gains a Privilege Scroll.";
    } else {
        if (newPrivs[turn] > 0) {
            newPrivs[turn]--;
            newPrivs[opponent]++;
            msg = "Opponent stole a Privilege Scroll from you!";
        } else {
            msg = "Opponent gains Privilege (Supply empty, you have none).";
        }
    }
    setPrivileges(newPrivs);
    return msg;
  };

  // --- 🟢 Logic: Execute Reserve (Commit) ---
  // 这个函数负责真正执行预约操作：移动卡牌、刷新市场、拿走黄金
  const executeReserve = (card, level, idx, takeGold, goldCoords = null) => {
      // 1. Move Card to Player's Reserved
      setPlayerReserved(prev => ({ ...prev, [turn]: [...prev[turn], card] }));
      
      // 2. Refill Market (Pop from deck)
      const newDecks = { ...decks, [level]: [...decks[level]] }; // Copy deck array
      const newMarket = { ...market };
      
      if (newDecks[level].length > 0) {
          newMarket[level][idx] = newDecks[level].pop();
      } else {
          newMarket[level][idx] = null;
      }
      
      setMarket(newMarket);
      setDecks(newDecks);

      // 3. Take Gold (if applicable)
      if (takeGold && goldCoords) {
          const { r, c } = goldCoords;
          const newBoard = [...board];
          newBoard[r][c] = { type: GEM_TYPES.EMPTY, uid: `empty-${r}-${c}-${Date.now()}` };
          setBoard(newBoard);
          
          const newInv = { ...inventories[turn] };
          newInv.gold += 1;
          setInventories(prev => ({ ...prev, [turn]: newInv }));
      }

      // 4. Cleanup & End Turn
      setPendingReserve(null);
      setGameMode('IDLE');
      setTurn(turn === 'p1' ? 'p2' : 'p1');
      
      if (takeGold) setErrorMsg("Reserved & Took Gold.");
      else setErrorMsg("Reserved (No Gold Available).");
      setTimeout(() => setErrorMsg(null), 2000);
  };

  // --- Handlers (Interactions) ---
  const handleGemClick = (r, c) => {
    const gem = getGemAt(r, c);
    if (!gem || !gem.type || gem.type.id === 'empty') return;

    // --- MODE: Privilege Action ---
    if (gameMode === 'PRIVILEGE_ACTION') {
        if (gem.type.id === 'gold') {
            setErrorMsg("Cannot use Privilege on Gold.");
            setTimeout(() => setErrorMsg(null), 2000);
            return;
        }
        const newBoard = [...board];
        newBoard[r][c] = { type: GEM_TYPES.EMPTY, uid: `empty-${r}-${c}-${Date.now()}` };
        const newInv = { ...inventories[turn] };
        newInv[gem.type.id]++;
        const newPrivs = { ...privileges };
        newPrivs[turn]--; 
        
        setBoard(newBoard);
        setInventories({ ...inventories, [turn]: newInv });
        setPrivileges(newPrivs);
        setGameMode('IDLE');
        setErrorMsg("Used Privilege Scroll.");
        setTimeout(() => setErrorMsg(null), 1500);
        return;
    }

    // --- MODE: Reserve (Waiting for Gold) ---
    if (gameMode === 'RESERVE_WAITING_GEM') {
      if (gem.type.id !== 'gold') {
        setErrorMsg("Must select a Gold gem to finish reserving!");
        setTimeout(() => setErrorMsg(null), 2000);
        return;
      }
      // 🟢 确认提交预约
      executeReserve(pendingReserve.card, pendingReserve.level, pendingReserve.idx, true, { r, c });
      return;
    }

    // --- MODE: Standard Take ---
    if (isSelected(r, c)) {
      if (selectedGems.length > 0) {
        const last = selectedGems[selectedGems.length - 1];
        if (last.r === r && last.c === c) {
            setSelectedGems(selectedGems.slice(0, -1));
            return;
        }
      }
      setSelectedGems([]);
      return;
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

  const handleConfirmTake = () => {
    if (selectedGems.length === 0) return;
    
    const newBoard = board.map(row => [...row]);
    const newInv = { ...inventories[turn] };
    
    let pearlCount = 0;
    let colorCounts = {};
    let triggerPrivilege = false;

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

    if (triggerPrivilege) {
        const msg = giveOpponentPrivilege();
        setErrorMsg(msg); 
        setTimeout(() => setErrorMsg(null), 3000);
    }

    setBoard(newBoard);
    setInventories({ ...inventories, [turn]: newInv });
    setSelectedGems([]);
    setTurn(turn === 'p1' ? 'p2' : 'p1');
  };

  const handleReplenish = () => {
    if (bag.length === 0) { setErrorMsg("Bag empty!"); setTimeout(() => setErrorMsg(null), 2000); return; }
    
    const msg = giveOpponentPrivilege();
    
    const newBoard = board.map(row => [...row]);
    const newBag = [...bag];
    let filled = 0;
    
    // Spiral Order
    for (let i = 0; i < SPIRAL_ORDER.length; i++) {
        const [r, c] = SPIRAL_ORDER[i];
        if (newBoard[r][c].type.id === 'empty' && newBag.length > 0) {
            newBoard[r][c] = newBag.pop();
            filled++;
        }
    }

    setBoard(newBoard);
    setBag(newBag);
    if(filled > 0) { 
        setErrorMsg(`Refilled ${filled}. ${msg}`); 
        setTimeout(() => setErrorMsg(null), 3000); 
    }
  };

  // --- 🟢 Initiation: Start Reserve Process ---
  const handleReserveCard = (card, level, idx) => {
      if (playerReserved[turn].length >= 3) { setErrorMsg("Reserve full (max 3)."); setTimeout(() => setErrorMsg(null), 2000); return; }
      
      const goldExists = board.some(row => row.some(g => g.type.id === 'gold'));
      
      if (goldExists) {
          // 暂存状态，不提交
          setPendingReserve({ card, level, idx });
          setGameMode('RESERVE_WAITING_GEM');
          setErrorMsg("Reserving... Pick a Gold gem to confirm.");
      } else {
          // 没黄金，直接提交 (原版规则: 没黄金也能预约)
          executeReserve(card, level, idx, false);
      }
  };

  // --- 🟢 Action: Cancel Reserve ---
  const handleCancelReserve = () => {
      setPendingReserve(null);
      setGameMode('IDLE');
      setErrorMsg("Reserve cancelled.");
      setTimeout(() => setErrorMsg(null), 1500);
  };

  const activatePrivilegeMode = () => {
      if (privileges[turn] > 0) {
          setGameMode('PRIVILEGE_ACTION');
          setSelectedGems([]); 
      }
  };

  const cancelPrivilegeMode = () => {
      setGameMode('IDLE');
  };

  const executeBuy = (card, source = 'market', marketInfo = {}) => {
      const inv = inventories[turn];
      const newInv = { ...inv };
      const bonuses = BONUS_COLORS.reduce((acc, color) => { acc[color] = playerTableau[turn].filter(c => c.bonusColor === color).length; return acc; }, {});
      
      let goldCost = 0;
      const gemsToReturn = [];

      Object.entries(card.cost).forEach(([color, cost]) => {
          const discount = bonuses[color] || 0;
          const needed = Math.max(0, cost - discount);
          const available = newInv[color];
          
          let paidAmt = 0;
          if (available >= needed) {
              newInv[color] -= needed;
              paidAmt = needed;
          } else {
              newInv[color] = 0;
              paidAmt = available; 
              goldCost += (needed - available);
          }

          for(let k=0; k < paidAmt; k++) {
              gemsToReturn.push({ type: GEM_TYPES[color.toUpperCase()], uid: `returned-${color}-${Date.now()}-${k}` });
          }
      });

      newInv.gold -= goldCost;
      for(let k=0; k < goldCost; k++) {
          gemsToReturn.push({ type: GEM_TYPES.GOLD, uid: `returned-gold-${Date.now()}-${k}` });
      }

      setInventories({ ...inventories, [turn]: newInv });
      setPlayerTableau({ ...playerTableau, [turn]: [...playerTableau[turn], card] });
      setBag(prev => [...prev, ...gemsToReturn]);

      if (source === 'market') {
          const newMarket = {...market};
          const { level, idx } = marketInfo;
          if (decks[level].length > 0) newMarket[level][idx] = decks[level].pop();
          else newMarket[level][idx] = null;
          setMarket(newMarket);
      } else if (source === 'reserved') {
          setPlayerReserved({ ...playerReserved, [turn]: playerReserved[turn].filter(c => c.id !== card.id) });
      }
      setTurn(turn === 'p1' ? 'p2' : 'p1');
  };

  const checkCanBuyReserved = (card, execute = false) => {
      const canAfford = calculateCost(card, turn, inventories, playerTableau);
      if (execute && canAfford) executeBuy(card, 'reserved');
      return canAfford;
  };

  // --- Render ---
  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 font-sans flex flex-col items-center p-2 md:p-4 overflow-x-hidden">
      <div className="w-full max-w-4xl mb-4">
        <PlayerZone 
            player={turn === 'p1' ? 'p2' : 'p1'} 
            inventory={turn === 'p1' ? inventories.p2 : inventories.p1} 
            cards={turn === 'p1' ? playerTableau.p2 : playerTableau.p1} 
            reserved={turn === 'p1' ? playerReserved.p2 : playerReserved.p1} 
            privileges={turn === 'p1' ? privileges.p2 : privileges.p1}
            score={getPlayerScore(turn === 'p1' ? 'p2' : 'p1')} 
            isActive={false} 
            onBuyReserved={() => false}
            onUsePrivilege={() => {}}
            isPrivilegeMode={false}
        />
      </div>

      <div className="flex flex-col md:flex-row gap-6 items-start justify-center w-full max-w-5xl">
        <div className="flex flex-col gap-3 w-full md:w-auto items-center">
          <h2 className="text-xs font-bold text-slate-500 uppercase tracking-widest w-full text-center border-b border-slate-800 pb-1">Market</h2>
          {[3, 2, 1].map(lvl => (
            <div key={lvl} className="flex gap-2">
              {market[lvl].map((card, i) => (
                <Card key={i} card={card} 
                    canBuy={card && calculateCost(card, turn, inventories, playerTableau)} 
                    onClick={() => card && executeBuy(card, 'market', { level: lvl, idx: i })}
                    onReserve={() => card && handleReserveCard(card, lvl, i)}
                />
              ))}
            </div>
          ))}
        </div>

        <div className="relative flex flex-col items-center">
          <div className={`absolute -top-10 bg-red-500/90 text-white px-4 py-1 rounded-full shadow-xl text-sm font-semibold transition-all duration-300 z-50 flex items-center gap-2 whitespace-nowrap ${errorMsg ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4 pointer-events-none'}`}>
            <Info size={14} /> {errorMsg}
          </div>

          {gameMode === 'RESERVE_WAITING_GEM' && <div className="mb-2 bg-yellow-500/20 border border-yellow-500 text-yellow-200 px-4 py-1 rounded-full text-sm font-bold animate-pulse">Select a Gold Gem...</div>}
          {gameMode === 'PRIVILEGE_ACTION' && <div className="mb-2 bg-amber-500/20 border border-amber-500 text-amber-200 px-4 py-1 rounded-full text-sm font-bold animate-pulse">Select 1 Gem (Privilege)...</div>}

          <div className={`bg-slate-800/80 p-3 rounded-2xl shadow-2xl border transition-colors duration-300 ${gameMode === 'RESERVE_WAITING_GEM' ? 'border-yellow-500/50' : gameMode === 'PRIVILEGE_ACTION' ? 'border-amber-500/50' : 'border-slate-700/50'} backdrop-blur-sm`}>
            <div className="text-right text-[10px] text-slate-500 mb-1 font-mono">Bag: {bag.length}</div>
            <div className="grid grid-cols-5 gap-2 w-[300px] h-[300px] md:w-[350px] md:h-[350px]">
              {board.map((row, r) => row.map((gem, c) => {
                  const isSelectedGem = isSelected(r, c);
                  const isGold = gem && gem.type.id === 'gold';
                  const isTarget = (gameMode === 'RESERVE_WAITING_GEM' && isGold) || (gameMode === 'PRIVILEGE_ACTION' && !isGold);
                  const isEmpty = gem && gem.type.id === 'empty';
                  
                  return (
                    <button key={`${r}-${c}-${gem ? gem.uid : 'null'}`} onClick={() => handleGemClick(r, c)} disabled={isEmpty} className={`relative group w-full h-full rounded-full flex items-center justify-center transition-all duration-150 ${isEmpty ? 'cursor-default' : 'cursor-pointer hover:scale-105 active:scale-95'}`}>
                      {isEmpty ? <div className="w-2 h-2 rounded-full bg-slate-700/30"></div> : (
                        <div className={`w-full h-full rounded-full shadow-inner bg-gradient-to-br ${gem.type.color} border ${gem.type.border} 
                            ${isSelectedGem ? 'ring-2 ring-white scale-105 shadow-[0_0_10px_white]' : 'opacity-90'} 
                            ${isTarget ? (gameMode === 'PRIVILEGE_ACTION' ? 'ring-4 ring-amber-400 animate-pulse z-20' : 'ring-4 ring-yellow-400 animate-pulse z-20') : ''} 
                            ${(gameMode === 'RESERVE_WAITING_GEM' && !isGold) || (gameMode === 'PRIVILEGE_ACTION' && isGold) ? 'opacity-30 grayscale' : ''}
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
             
             {gameMode === 'IDLE' && <button onClick={handleConfirmTake} disabled={selectedGems.length === 0} className={`flex-1 flex items-center justify-center gap-2 px-6 py-3 rounded-xl font-bold shadow-xl transition-all ${selectedGems.length > 0 ? 'bg-gradient-to-r from-emerald-500 to-teal-500 text-white hover:brightness-110' : 'bg-slate-800 text-slate-600'}`}><ShoppingBag size={18} /> Take Gems</button>}
             
             {gameMode === 'PRIVILEGE_ACTION' && (
                 <button onClick={cancelPrivilegeMode} className="flex-1 bg-slate-600 text-white px-6 py-3 rounded-xl font-bold shadow-xl hover:bg-slate-500 flex items-center justify-center gap-2">
                    <X size={18} /> Cancel Scroll
                 </button>
             )}
             
             {/* 🟢 新增：反悔按钮 */}
             {gameMode === 'RESERVE_WAITING_GEM' && (
                 <button onClick={handleCancelReserve} className="flex-1 bg-rose-600 text-white px-6 py-3 rounded-xl font-bold shadow-xl hover:bg-rose-500 flex items-center justify-center gap-2 animate-in fade-in">
                    <X size={18} /> Cancel Reserve
                 </button>
             )}
          </div>
        </div>
      </div>

      <div className="w-full max-w-4xl mt-4">
        <PlayerZone 
            player={turn} 
            inventory={inventories[turn]} 
            cards={playerTableau[turn]} 
            reserved={playerReserved[turn]} 
            privileges={privileges[turn]}
            score={getPlayerScore(turn)} 
            isActive={true} 
            onBuyReserved={checkCanBuyReserved}
            onUsePrivilege={activatePrivilegeMode}
            isPrivilegeMode={gameMode === 'PRIVILEGE_ACTION'}
        />
      </div>
    </div>
  );
}