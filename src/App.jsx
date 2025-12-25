import React, { useState } from 'react';
import { SkipForward, RotateCcw } from 'lucide-react';

import { PlayerZone } from './components/PlayerZone';
import { DebugPanel } from './components/DebugPanel';
import { ResolutionSwitcher } from './components/ResolutionSwitcher';
import { WinnerModal } from './components/WinnerModal';
import { Market } from './components/Market';
import { GameBoard } from './components/GameBoard';
import { StatusBar } from './components/StatusBar';
import { GameActions } from './components/GameActions';
import { ReplayControls } from './components/ReplayControls';
import { RoyalCourt } from './components/RoyalCourt';

import { useGameLogic } from './hooks/useGameLogic';
import { useSettings } from './hooks/useSettings';




export default function GemDuelBoard() {
  const [showDebug, setShowDebug] = useState(false);
  const [isReviewing, setIsReviewing] = useState(false);
  const { resolution, setResolution, settings, RESOLUTION_SETTINGS } = useSettings();

  const { state, handlers, getters, historyControls } = useGameLogic();

  const {
    board, bag, turn, selectedGems, errorMsg, winner, gameMode,
    bonusGemTarget, decks, market, inventories, privileges, playerTableau,
    playerReserved, royalDeck, playerRoyals
  } = state;

  const {
    handleSelfGemClick, handleGemClick, handleOpponentGemClick, handleConfirmTake,
    handleReplenish, handleReserveCard, handleReserveDeck, initiateBuy,
    handleSelectRoyal, handleCancelReserve, activatePrivilegeMode,
    checkAndInitiateBuyReserved, handleDebugAddCrowns, handleDebugAddPoints,
    handleForceRoyal, handleSkipAction
  } = handlers;
  
  const { getPlayerScore, isSelected } = getters;
  
  const opponent = turn === 'p1' ? 'p2' : 'p1';

  // In Review mode, we override gameMode to 'REVIEW' to disable interactions in children
  const effectiveGameMode = isReviewing ? 'REVIEW' : (winner ? 'GAME_OVER' : gameMode);

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 font-sans flex flex-col items-center overflow-hidden">
      
      <button 
        onClick={() => setShowDebug(!showDebug)}
        className="fixed top-2 left-2 z-[100] bg-slate-800/80 hover:bg-red-900/60 text-slate-400 p-2 rounded border border-slate-700 text-[10px] transition-colors"
      >
        {showDebug ? 'CLOSE DEBUG' : 'OPEN DEBUG'}
      </button>

      {showDebug && (
        <div className="fixed left-4 top-16 z-[90] flex flex-col gap-4 animate-in slide-in-from-left duration-300">
          <DebugPanel 
            player="p1" 
            onAddCrowns={() => handleDebugAddCrowns('p1')}
            onAddPoints={() => handleDebugAddPoints('p1')}
            onForceRoyal={() => handleForceRoyal()}
          />
          <DebugPanel 
            player="p2" 
            onAddCrowns={() => handleDebugAddCrowns('p2')}
            onAddPoints={() => handleDebugAddPoints('p2')}
            onForceRoyal={() => handleForceRoyal()}
          />
        </div>
      )}

      <ResolutionSwitcher 
        settings={settings}
        resolution={resolution}
        setResolution={setResolution}
        RESOLUTION_SETTINGS={RESOLUTION_SETTINGS}
      />

      {winner && !isReviewing && <WinnerModal winner={winner} onReview={() => setIsReviewing(true)} />}

      {isReviewing && (
        <div className="fixed bottom-8 z-[100] animate-in fade-in slide-in-from-bottom-4">
            <button onClick={() => setIsReviewing(false)} className="flex items-center gap-2 bg-slate-800 hover:bg-slate-700 text-white px-6 py-3 rounded-full font-bold shadow-2xl border border-slate-600 transition-all hover:scale-105">
                <RotateCcw size={18} />
                Return to Results
            </button>
        </div>
      )}

      <div className="w-full h-screen flex flex-col p-0">

        {/* Opponent Zone */}
        <div className={`w-full ${settings.zoneHeight} shrink-0 z-30 flex justify-center items-start pt-4 overflow-visible relative border-b border-slate-800/30 transition-all duration-500`}>
          <div className={`w-[98%] max-w-[1800px] transform ${settings.zoneScale} origin-top transition-transform duration-500`}>
            <PlayerZone 
                player={opponent}
                inventory={inventories[opponent]} 
                cards={playerTableau[opponent]} 
                reserved={playerReserved[opponent]} 
                royals={playerRoyals[opponent]}
                privileges={privileges[opponent]}
                score={getPlayerScore(opponent)} 
                isActive={false}
                onBuyReserved={() => false}
                onUsePrivilege={() => {}}
                isPrivilegeMode={false}
                isStealMode={effectiveGameMode === 'STEAL_ACTION' && turn !== opponent}
                isDiscardMode={false} 
                onGemClick={handleOpponentGemClick}
            />
          </div>
        </div>

        {/* Main Game Area */}
        <div className="flex-1 flex items-center justify-center min-h-0 relative z-10 px-6">
             <div className={`flex flex-row gap-8 xl:gap-12 items-center justify-center transform ${settings.boardScale} origin-center transition-all duration-500`}>
                
                <Market 
                    market={market}
                    decks={decks}
                    gameMode={effectiveGameMode}
                    turn={turn}
                    inventories={inventories}
                    playerTableau={playerTableau}
                    handleReserveDeck={handleReserveDeck}
                    initiateBuy={initiateBuy}
                    handleReserveCard={handleReserveCard}
                />

                <div className="relative flex flex-col items-center shrink-0">
                    <StatusBar errorMsg={errorMsg} />

                    <GameBoard 
                        board={board}
                        bag={bag}
                        handleGemClick={handleGemClick}
                        isSelected={isSelected}
                        selectedGems={selectedGems}
                        gameMode={effectiveGameMode}
                        bonusGemTarget={bonusGemTarget}
                    />

                    <GameActions 
                        handleReplenish={handleReplenish}
                        bag={bag}
                        gameMode={effectiveGameMode}
                        handleConfirmTake={handleConfirmTake}
                        selectedGems={selectedGems}
                        handleCancelReserve={handleCancelReserve}
                    />
                </div>

                <div className="flex flex-col gap-4 items-center">
                    <RoyalCourt
                        royalDeck={royalDeck}
                        gameMode={effectiveGameMode}
                        handleSelectRoyal={handleSelectRoyal}
                    />
                    
                    {/* Turn Management Area */}
                    <div className="flex flex-col gap-3 items-center bg-slate-900/40 p-3 rounded-2xl border border-slate-800/50 backdrop-blur-sm w-full">
                        <ReplayControls 
                            undo={historyControls.undo}
                            redo={historyControls.redo}
                            canUndo={historyControls.canUndo}
                            canRedo={historyControls.canRedo}
                            currentIndex={historyControls.currentIndex}
                            historyLength={historyControls.historyLength}
                        />
                        <button onClick={handleSkipAction} className="text-[10px] text-slate-500 hover:text-slate-300 flex items-center gap-1 transition-colors uppercase font-bold tracking-wider">
                            <SkipForward size={12} /> Skip Turn
                        </button>
                    </div>
                </div>
             </div>
        </div>

        {/* Current Player Zone */}
        <div className={`w-full ${settings.zoneHeight} shrink-0 z-30 flex justify-center items-end pb-4 overflow-visible relative border-t border-slate-800/30 transition-all duration-500`}>
             <div className={`w-[98%] max-w-[1800px] transform ${settings.zoneScale} origin-bottom transition-transform duration-500`}>
                <PlayerZone 
                    player={turn} 
                    inventory={inventories[turn]} 
                    cards={playerTableau[turn]} 
                    reserved={playerReserved[turn]} 
                    royals={playerRoyals[turn]}
                    privileges={privileges[turn]}
                    score={getPlayerScore(turn)} 
                    isActive={!isReviewing && !winner} 
                    onBuyReserved={checkAndInitiateBuyReserved}
                    onUsePrivilege={activatePrivilegeMode}
                    isPrivilegeMode={effectiveGameMode === 'PRIVILEGE_ACTION'}
                    isStealMode={effectiveGameMode === 'STEAL_ACTION' && turn === turn}
                    isDiscardMode={effectiveGameMode === 'DISCARD_EXCESS_GEMS'}
                    onGemClick={handleSelfGemClick}
                />
             </div>
        </div>
      </div>
    </div>
  );
}