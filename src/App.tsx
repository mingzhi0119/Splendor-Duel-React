import { useState } from 'react';
import { RotateCcw, BookOpen, Sun, Moon, Users, User } from 'lucide-react';

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
import { DraftScreen } from './components/DraftScreen';
import { DeckPeekModal } from './components/DeckPeekModal';

import { useGameLogic } from './hooks/useGameLogic';
import { useSettings } from './hooks/useSettings';
import { GEM_TYPES, BONUS_COLORS } from './constants';

export default function GemDuelBoard() {
    const [showDebug, setShowDebug] = useState(false);
    const [isReviewing, setIsReviewing] = useState(false);
    const [showRulebook, setShowRulebook] = useState(false);
    const [gameConfig, setGameConfig] = useState<{ useBuffs: boolean } | null>(null);

    const { resolution, setResolution, settings, RESOLUTION_SETTINGS, theme, setTheme } =
        useSettings();

    const { state, handlers, getters, historyControls } = useGameLogic();

    const {
        board,
        bag,
        turn,
        selectedGems,
        errorMsg,
        winner,
        gameMode,
        bonusGemTarget,
        decks,
        market,
        inventories,
        privileges,
        playerTableau,
        playerReserved,
        royalDeck,
        playerRoyals,
        lastFeedback,
        playerBuffs,
        draftPool,
        buffLevel,
        activeModal,
    } = state;

    const {
        handleSelfGemClick,
        handleGemClick,
        handleOpponentGemClick,
        handleConfirmTake,
        handleReplenish,
        handleReserveCard,
        handleReserveDeck,
        initiateBuy,
        handleSelectRoyal,
        handleCancelReserve,
        activatePrivilegeMode,
        checkAndInitiateBuyReserved,
        handleDebugAddCrowns,
        handleDebugAddPoints,
        handleForceRoyal,
        handleSelectBonusColor,
        startGame,
        handleSelectBuff,
        handleCloseModal,
        handlePeekDeck,
    } = handlers;

    const { getPlayerScore, isSelected, getCrownCount } = getters;

    const effectiveGameMode = isReviewing ? 'REVIEW' : winner ? 'GAME_OVER' : gameMode;

    // --- 1. Start Screen ---
    if (historyControls.historyLength === 0) {
        if (!gameConfig) {
            return (
                <div
                    className={`h-screen w-screen flex flex-col items-center justify-center gap-8 transition-colors duration-500
                  ${theme === 'dark' ? 'bg-slate-950 text-slate-100' : 'bg-slate-100 text-slate-900'}
              `}
                >
                    <div className="flex flex-col items-center gap-2 animate-in slide-in-from-bottom-4 duration-700">
                        <h1 className="text-4xl md:text-6xl font-black tracking-tighter bg-gradient-to-br from-amber-400 to-amber-600 bg-clip-text text-transparent drop-shadow-lg">
                            SPLENDOR DUEL
                        </h1>
                        <span className="text-sm uppercase tracking-widest opacity-60">
                            Reimagined
                        </span>
                    </div>

                    <div className="flex flex-col md:flex-row gap-6 mt-8">
                        <button
                            onClick={() => setGameConfig({ useBuffs: false })}
                            className="group relative w-64 h-40 rounded-2xl border-2 flex flex-col items-center justify-center gap-4 transition-all hover:scale-105 active:scale-95 overflow-hidden
                              border-slate-300 hover:border-blue-500 bg-white/5 hover:bg-blue-500/10"
                        >
                            <div className="absolute inset-0 bg-gradient-to-br from-blue-500/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                            <span className="text-2xl font-bold">Classic</span>
                            <span className="text-xs opacity-70 max-w-[80%] text-center">
                                Standard rules. Pure strategy.
                            </span>
                        </button>

                        <button
                            onClick={() => setGameConfig({ useBuffs: true })}
                            className="group relative w-64 h-40 rounded-2xl border-2 flex flex-col items-center justify-center gap-4 transition-all hover:scale-105 active:scale-95 overflow-hidden
                              border-slate-300 hover:border-purple-500 bg-white/5 hover:bg-purple-500/10"
                        >
                            <div className="absolute inset-0 bg-gradient-to-br from-purple-500/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                            <div className="flex items-center gap-2">
                                <span className="text-2xl font-bold">Roguelike</span>
                                <span className="bg-purple-500 text-white text-[10px] px-1.5 py-0.5 rounded-full font-bold">
                                    NEW
                                </span>
                            </div>
                            <span className="text-xs opacity-70 max-w-[80%] text-center">
                                Random starting buffs & distinct playstyles.
                            </span>
                        </button>
                    </div>

                    <div className="absolute bottom-8 text-xs opacity-30">
                        Select a mode to begin
                    </div>
                </div>
            );
        }

        return (
            <div
                className={`h-screen w-screen flex flex-col items-center justify-center gap-8 transition-colors duration-500
              ${theme === 'dark' ? 'bg-slate-950 text-slate-100' : 'bg-slate-100 text-slate-900'}
          `}
            >
                <div className="flex flex-col items-center gap-2">
                    <h2 className="text-2xl font-bold uppercase tracking-widest opacity-80">
                        Select Opponent
                    </h2>
                    <span className="text-xs opacity-50">
                        {gameConfig.useBuffs ? 'Roguelike Mode' : 'Classic Mode'}
                    </span>
                </div>

                <div className="flex flex-col md:flex-row gap-6 mt-4">
                    <button
                        onClick={() => startGame({ useBuffs: gameConfig.useBuffs, isPvE: false })}
                        className="group relative w-64 h-40 rounded-2xl border-2 border-slate-300 hover:border-emerald-500 bg-white/5 hover:bg-emerald-500/10 flex flex-col items-center justify-center gap-4 transition-all hover:scale-105 active:scale-95 overflow-hidden"
                    >
                        <Users size={40} className="text-emerald-500" />
                        <span className="text-xl font-bold">Local PvP</span>
                        <span className="text-[10px] opacity-60">Play with a friend locally</span>
                    </button>

                    <button
                        onClick={() => startGame({ useBuffs: gameConfig.useBuffs, isPvE: true })}
                        className="group relative w-64 h-40 rounded-2xl border-2 border-slate-300 hover:border-amber-500 bg-white/5 hover:bg-amber-500/10 flex flex-col items-center justify-center gap-4 transition-all hover:scale-105 active:scale-95 overflow-hidden"
                    >
                        <User size={40} className="text-amber-500" />
                        <span className="text-xl font-bold">vs AI (Solo)</span>
                        <span className="text-[10px] opacity-60">Challenge the Gem Bot</span>
                    </button>
                </div>

                <button
                    onClick={() => setGameConfig(null)}
                    className="text-xs underline opacity-40 hover:opacity-100 transition-opacity mt-4"
                >
                    Back to Mode Selection
                </button>
            </div>
        );
    }

    // --- 2. Draft Phase ---
    if (gameMode === 'DRAFT_PHASE') {
        return (
            <DraftScreen
                draftPool={draftPool}
                buffLevel={buffLevel}
                activePlayer={turn}
                onSelectBuff={handleSelectBuff}
                theme={theme}
            />
        );
    }

    // --- 3. Main Game Interface ---
    return (
        <div
            className={`h-screen w-screen font-sans flex flex-col overflow-hidden transition-colors duration-500
        ${theme === 'dark' ? 'bg-slate-950 text-slate-100' : 'bg-slate-100 text-slate-900'}
    `}
        >
            {/* 1. Top Global Status Bar */}
            <TopBar
                p1Score={getPlayerScore('p1')}
                p1Crowns={getCrownCount('p1')}
                p2Score={getPlayerScore('p2')}
                p2Crowns={getCrownCount('p2')}
                turnCount={historyControls.currentIndex + 1}
                activePlayer={turn}
                playerBuffs={playerBuffs}
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
                    onClick={() => setTheme((t) => (t === 'dark' ? 'light' : 'dark'))}
                    className={`p-2 rounded-lg backdrop-blur-md border shadow-xl flex items-center gap-2 transition-all justify-center
                ${theme === 'dark' ? 'bg-slate-800/80 hover:bg-slate-700 text-white border-slate-600' : 'bg-white/80 hover:bg-slate-50 text-slate-800 border-slate-300'}
            `}
                >
                    {theme === 'dark' ? <Moon size={16} /> : <Sun size={16} />}
                    <span className="text-xs font-bold hidden md:inline">
                        {theme === 'dark' ? 'Dark' : 'Light'}
                    </span>
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
                    <DebugPanel
                        player="p1"
                        onAddCrowns={() => handleDebugAddCrowns('p1')}
                        onAddPoints={() => handleDebugAddPoints('p1')}
                        onForceRoyal={() => handleForceRoyal()}
                        theme={theme}
                    />
                    <DebugPanel
                        player="p2"
                        onAddCrowns={() => handleDebugAddCrowns('p2')}
                        onAddPoints={() => handleDebugAddPoints('p2')}
                        onForceRoyal={() => handleForceRoyal()}
                        theme={theme}
                    />
                </div>
            )}

            {/* Modals */}
            {showRulebook && <Rulebook onClose={() => setShowRulebook(false)} theme={theme} />}
            <DeckPeekModal
                isOpen={activeModal?.type === 'PEEK'}
                data={activeModal?.data}
                onClose={handleCloseModal}
                theme={theme}
            />
            {gameMode === 'SELECT_CARD_COLOR' && (
                <div className="fixed inset-0 z-[100] bg-black/80 flex flex-col items-center justify-center animate-in fade-in">
                    <h2 className="text-2xl font-bold text-white mb-6">Select Card Color</h2>
                    <div className="flex gap-4">
                        {BONUS_COLORS.map((color) => (
                            <button
                                key={color}
                                onClick={() => handleSelectBonusColor(color)}
                                className={`w-16 h-16 rounded-full bg-gradient-to-br ${(GEM_TYPES as any)[color.toUpperCase()].color} border-2 border-white/50 shadow-[0_0_15px_rgba(255,255,255,0.3)] hover:scale-110 transition-transform`}
                            />
                        ))}
                    </div>
                </div>
            )}
            {winner && !isReviewing && (
                <WinnerModal winner={winner} onReview={() => setIsReviewing(true)} />
            )}
            {isReviewing && (
                <div className="fixed bottom-8 left-1/2 -translate-x-1/2 z-[100] animate-in fade-in slide-in-from-bottom-4">
                    <button
                        onClick={() => setIsReviewing(false)}
                        className="flex items-center gap-2 bg-slate-800 hover:bg-slate-700 text-white px-6 py-3 rounded-full font-bold shadow-2xl border border-slate-600 transition-all hover:scale-105"
                    >
                        <RotateCcw size={18} /> Return to Results
                    </button>
                </div>
            )}

            {/* 2. Middle Game Area (Centered) */}
            <div className="flex-1 flex items-center justify-center min-h-0 relative z-10 px-6 pt-20 pb-4">
                <div
                    className={`flex flex-row gap-8 xl:gap-16 items-center justify-center transform ${settings.boardScale} origin-center transition-all duration-500`}
                >
                    <Market
                        market={market}
                        decks={decks}
                        gameMode={effectiveGameMode}
                        turn={turn}
                        inventories={inventories}
                        playerTableau={playerTableau}
                        playerBuffs={playerBuffs}
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
                            activeBuff={playerBuffs[turn]}
                            onPeekDeck={handlePeekDeck}
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
                        <div
                            className={`flex flex-col gap-3 items-center p-3 rounded-2xl border backdrop-blur-sm w-full transition-colors duration-500
                      ${theme === 'dark' ? 'bg-slate-900/40 border-slate-800/50' : 'bg-white/40 border-slate-200/50'}
                  `}
                        >
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
            <div
                className={`h-[280px] shrink-0 flex w-full border-t backdrop-blur-md relative z-20 transition-colors duration-500
          ${theme === 'dark' ? 'border-slate-800 bg-slate-950/80' : 'border-slate-300 bg-slate-100/80'}
      `}
            >
                {/* Player 1 Dashboard (Left) */}
                <div
                    className={`flex-1 border-r relative ${theme === 'dark' ? 'border-slate-800' : 'border-slate-300'}`}
                >
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
                        isDiscardMode={effectiveGameMode === 'DISCARD_EXCESS_GEMS' && turn === 'p1'}
                        onGemClick={turn === 'p1' ? handleSelfGemClick : handleOpponentGemClick}
                        buff={playerBuffs?.p1}
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
                        isDiscardMode={effectiveGameMode === 'DISCARD_EXCESS_GEMS' && turn === 'p2'}
                        onGemClick={turn === 'p2' ? handleSelfGemClick : handleOpponentGemClick}
                        buff={playerBuffs?.p2}
                        theme={theme}
                    />
                </div>
            </div>
        </div>
    );
}
