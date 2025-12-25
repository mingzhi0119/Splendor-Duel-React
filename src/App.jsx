import React, { useState } from 'react';
import { RotateCcw, BookOpen, Sun, Moon } from 'lucide-react';

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
import { Rulebook } from './components/Rulebook';
import { TopBar } from './components/TopBar';

import { useGameLogic } from './hooks/useGameLogic';
import { useSettings } from './hooks/useSettings';
import { GEM_TYPES, BONUS_COLORS } from './constants';

export default function GemDuelBoard() {
  const [showDebug, setShowDebug] = useState(false);
  const [isReviewing, setIsReviewing] = useState(false);
  const [showRulebook, setShowRulebook] = useState(false);
  const { resolution, setResolution, settings, RESOLUTION_SETTINGS, theme, setTheme } = useSettings();

  const { state, handlers, getters, historyControls } = useGameLogic();

  const {
    board, bag, turn, selectedGems, errorMsg, winner, gameMode,
    bonusGemTarget, decks, market, inventories, privileges, playerTableau,
    playerReserved, royalDeck, playerRoyals, lastFeedback
  } = state;

  const {
    handleSelfGemClick, handleGemClick, handleOpponentGemClick, handleConfirmTake,
    handleReplenish, handleReserveCard, handleReserveDeck, initiateBuy,
    handleSelectRoyal, handleCancelReserve, activatePrivilegeMode,
    checkAndInitiateBuyReserved, handleDebugAddCrowns, handleDebugAddPoints,
    handleForceRoyal, handleSelectBonusColor
  } = handlers;
  
  const { getPlayerScore, isSelected, getCrownCount } = getters;
  
  const effectiveGameMode = isReviewing ? 'REVIEW' : (winner ? 'GAME_OVER' : gameMode);

  return (
    <div className={`h-screen w-screen font-sans flex flex-col overflow-hidden transition-colors duration-500
        ${theme === 'dark' ? 'bg-slate-950 text-slate-100' : 'bg-slate-100 text-slate-900'}
    `}>
      
      {/* 1. Top Global Status Bar */}
      <TopBar 
        p1Score={getPlayerScore('p1')} 
        p1Crowns={getCrownCount('p1')}
        p2Score={getPlayerScore('p2')}
        p2Crowns={getCrownCount('p2')}
        turnCount={historyControls.currentIndex + 1}
        activePlayer={turn}
        theme={theme}
      />

      {/* Floating Controls (Z-Index High) */}
      <div className="fixed top-24 right-4 z-[100] flex flex-col gap-2">
          <ResolutionSwitcher 
            settings={settings}
            resolution={resolution}
            setResolution={setResolution}
            RESOLUTION_SETTINGS={RESOLUTION_SETTINGS}
            theme={theme}
          />
          <button 
            onClick={() => setShowRulebook(true)}
            className={`p-2 rounded-lg backdrop-blur-md border shadow-xl flex items-center gap-2 transition-all justify-center
                ${theme === 'dark' ? 'bg-slate-800/80 hover:bg-slate-700 text-white border-slate-600' : 'bg-white/80 hover:bg-slate-50 text-slate-800 border-slate-300'}
            `}
          >
            <BookOpen size={16} />
            <span className="text-xs font-bold hidden md:inline">Rules</span>
          </button>

          {/* Theme Toggle Button */}
          <button 
            onClick={() => setTheme(t => t === 'dark' ? 'light' : 'dark')}
            className={`p-2 rounded-lg backdrop-blur-md border shadow-xl flex items-center gap-2 transition-all justify-center
                ${theme === 'dark' ? 'bg-slate-800/80 hover:bg-slate-700 text-white border-slate-600' : 'bg-white/80 hover:bg-slate-50 text-slate-800 border-slate-300'}
            `}
          >
            {theme === 'dark' ? <Moon size={16} /> : <Sun size={16} />}
            <span className="text-xs font-bold hidden md:inline">{theme === 'dark' ? 'Dark' : 'Light'}</span>
          </button>
      </div>

      <button 
        onClick={() => setShowDebug(!showDebug)}
        className={`fixed top-24 left-4 z-[100] p-2 rounded border text-[10px] transition-colors
            ${theme === 'dark' ? 'bg-slate-800/80 hover:bg-red-900/60 text-slate-400 border-slate-700' : 'bg-white/80 hover:bg-red-100 text-slate-600 border-slate-300'}
        `}
      >
        {showDebug ? 'CLOSE DEBUG' : 'OPEN DEBUG'}
      </button>

      {showDebug && (
        <div className="fixed left-4 top-36 z-[90] flex flex-col gap-4 animate-in slide-in-from-left duration-300">
          <DebugPanel player="p1" onAddCrowns={() => handleDebugAddCrowns('p1')} onAddPoints={() => handleDebugAddPoints('p1')} onForceRoyal={() => handleForceRoyal()} />
          <DebugPanel player="p2" onAddCrowns={() => handleDebugAddCrowns('p2')} onAddPoints={() => handleDebugAddPoints('p2')} onForceRoyal={() => handleForceRoyal()} />
        </div>
      )}

      {/* Modals */}
      {showRulebook && <Rulebook onClose={() => setShowRulebook(false)} />}
      {gameMode === 'SELECT_CARD_COLOR' && (
        <div className="fixed inset-0 z-[100] bg-black/80 flex flex-col items-center justify-center animate-in fade-in">
            <h2 className="text-2xl font-bold text-white mb-6">Select Card Color</h2>
            <div className="flex gap-4">
                {BONUS_COLORS.map(color => (
                    <button key={color} onClick={() => handleSelectBonusColor(color)} className={`w-16 h-16 rounded-full bg-gradient-to-br ${GEM_TYPES[color.toUpperCase()].color} border-2 border-white/50 shadow-[0_0_15px_rgba(255,255,255,0.3)] hover:scale-110 transition-transform`} />
                ))}
            </div>
        </div>
      )}
      {winner && !isReviewing && <WinnerModal winner={winner} onReview={() => setIsReviewing(true)} />}
      {isReviewing && (
        <div className="fixed bottom-8 left-1/2 -translate-x-1/2 z-[100] animate-in fade-in slide-in-from-bottom-4">
            <button onClick={() => setIsReviewing(false)} className="flex items-center gap-2 bg-slate-800 hover:bg-slate-700 text-white px-6 py-3 rounded-full font-bold shadow-2xl border border-slate-600 transition-all hover:scale-105">
                <RotateCcw size={18} /> Return to Results
            </button>
        </div>
      )}

      {/* 2. Middle Game Area (Centered) */}
      <div className="flex-1 flex items-center justify-center min-h-0 relative z-10 px-6 pt-20 pb-4">
           <div className={`flex flex-row gap-8 xl:gap-16 items-center justify-center transform ${settings.boardScale} origin-center transition-all duration-500`}>
              
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
                  theme={theme}
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
                      theme={theme}
                  />
                  <GameActions 
                      handleReplenish={handleReplenish}
                      bag={bag}
                      gameMode={effectiveGameMode}
                      handleConfirmTake={handleConfirmTake}
                      selectedGems={selectedGems}
                      handleCancelReserve={handleCancelReserve}
                      theme={theme}
                  />
              </div>

              <div className="flex flex-col gap-4 items-center">
                  <RoyalCourt
                      royalDeck={royalDeck}
                      gameMode={effectiveGameMode}
                      handleSelectRoyal={handleSelectRoyal}
                      theme={theme}
                  />
                  <div className={`flex flex-col gap-3 items-center p-3 rounded-2xl border backdrop-blur-sm w-full transition-colors duration-500
                      ${theme === 'dark' ? 'bg-slate-900/40 border-slate-800/50' : 'bg-white/40 border-slate-200/50'}
                  `}>
                      <ReplayControls 
                          undo={historyControls.undo}
                          redo={historyControls.redo}
                          canUndo={historyControls.canUndo}
                          canRedo={historyControls.canRedo}
                          currentIndex={historyControls.currentIndex}
                          historyLength={historyControls.historyLength}
                          theme={theme}
                      />
                  </div>
              </div>
           </div>
      </div>

      {/* 3. Bottom Dashboards (Dual Player Panels) */}
      <div className={`h-[280px] shrink-0 flex w-full border-t backdrop-blur-md relative z-20 transition-colors duration-500
          ${theme === 'dark' ? 'border-slate-800 bg-slate-950/80' : 'border-slate-300 bg-slate-100/80'}
      `}>
          {/* Player 1 Dashboard (Left) */}
          <div className={`flex-1 border-r relative ${theme === 'dark' ? 'border-slate-800' : 'border-slate-300'}`}>
              <PlayerZone 
                  player="p1"
                  inventory={inventories.p1} 
                  cards={playerTableau.p1} 
                  reserved={playerReserved.p1} 
                  royals={playerRoyals.p1}
                  privileges={privileges.p1}
                  score={getPlayerScore('p1')} 
                  crowns={getCrownCount('p1')}
                  lastFeedback={lastFeedback}
                  isActive={turn === 'p1' && !isReviewing && !winner}
                  onBuyReserved={checkAndInitiateBuyReserved}
                  onUsePrivilege={activatePrivilegeMode}
                  isPrivilegeMode={effectiveGameMode === 'PRIVILEGE_ACTION'}
                  isStealMode={effectiveGameMode === 'STEAL_ACTION' && turn !== 'p1'}
                  isDiscardMode={false} 
                  onGemClick={turn === 'p1' ? handleSelfGemClick : handleOpponentGemClick}
                  theme={theme}
              />
          </div>

          {/* Player 2 Dashboard (Right) */}
          <div className="flex-1 relative">
              <PlayerZone 
                  player="p2"
                  inventory={inventories.p2} 
                  cards={playerTableau.p2} 
                  reserved={playerReserved.p2} 
                  royals={playerRoyals.p2}
                  privileges={privileges.p2}
                  score={getPlayerScore('p2')} 
                  crowns={getCrownCount('p2')}
                  lastFeedback={lastFeedback}
                  isActive={turn === 'p2' && !isReviewing && !winner}
                  onBuyReserved={checkAndInitiateBuyReserved}
                  onUsePrivilege={activatePrivilegeMode}
                  isPrivilegeMode={effectiveGameMode === 'PRIVILEGE_ACTION'}
                  isStealMode={effectiveGameMode === 'STEAL_ACTION' && turn !== 'p2'}
                  isDiscardMode={false} 
                  onGemClick={turn === 'p2' ? handleSelfGemClick : handleOpponentGemClick}
                  theme={theme}
              />
          </div>
      </div>
    </div>
  );
}
