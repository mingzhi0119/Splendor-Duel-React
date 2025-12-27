# Gem Duel

**Gem Duel** is a competitive strategy game designed specifically for two players. In this digital adaptation, players act as masters of a jewelry guild, competing to satisfy monarchs and nobility by collecting gems, pearls, and gold to acquire prestigious cards.

> **v4.1.0 "Global Nexus & Intelligence" Update** is now live!

## 🚀 What's New in v4.1.0

### 🌐 Online Multiplayer (P2P)

- **Decentralized Play:** Real-time online matches using **PeerJS (WebRTC)**. No central game server required—connect directly with friends via unique Room IDs.
- **Live Sync:** Fully synchronized game state across peers using a deterministic Action-Log architecture.

### 🧠 AI Strategy Optimization

- **Smart Resource Management:** The AI ("Gem Bot") now intelligently monitors its gem capacity. It will automatically adjust its gem-taking strategy to prevent overflow, avoiding the efficiency loss of the discard phase.

### 📼 Replay Save/Load System

- **Match Persistence:** Export your entire game history as a portable JSON file.
- **Post-Match Analysis:** Import replay files to review every move, utilizing the infinite Undo/Redo system to analyze strategic turning points.

### 🛡️ Interface & QoL

- **Contextual UI:** Debug panels and replay controls now dynamically adapt to the game mode (Solo vs PvP vs Online) to ensure a fair and clean experience.
- **Action Cancel:** Added a "Cancel" option during Privilege gem selection to prevent accidental clicks.

## 🏗️ v4.0.0 "The Modernization" Update

### ⚛️ Modern Tech Stack

- **React 19 & Vite 6:** Upgraded to the latest industry standards for superior performance and developer experience.
- **100% TypeScript:** The entire codebase has been migrated to TypeScript, ensuring absolute type safety and eliminating runtime logic errors.

### 🤖 AI Battle Mode (Solo PvE)

- **Challenge the Bot:** A custom heuristic-based AI allows for solo practice and testing of complex buff combinations.

## 🚀 v3.0.0 "Fate & Fortune" Features

### 🔮 Roguelike Mode (Asymmetric Gameplay)

Break away from the symmetry! Before the game begins, players participate in a **Draft Phase** to select powerful Buffs.

- **24 Unique Buffs:** From "Color Preference" (cost reduction) to "Minimalism" (double bonuses for early cards).
- **Dynamic Win Conditions:** Victory thresholds adapt dynamically based on your chosen Buff.

## 🌟 Key Features

### Core Mechanics

- **Card Abilities:** Extra Turn, Bonus Gem, Steal, and Privilege.
- **Royal Court:** Claim powerful Royal cards upon reaching Crown milestones (3 and 6).
- **Three Victory Paths:** 20 Points, 10 Crowns, or 10 Points in a single color.

### Technical Highlights

- **Pure Logic Engine:** Decoupled game rules for high-performance state transitions.
- **Deterministic Rehydration:** Supports seamless infinite undo/redo.
- **Cross-Resolution Support:** Optimized for **1080p**, **2K**, and **4K** displays.

## 🛠️ Tech Stack

- **Framework:** React 19
- **Bundler:** Vite 6
- **Language:** TypeScript 5.8
- **Communication:** PeerJS (WebRTC)
- **Testing:** Vitest 3
- **Styling:** Tailwind CSS

## 📦 Getting Started

1.  Clone the repository: `git clone https://github.com/mingzhi0119/GemDuel-Dev.git`
2.  Install dependencies: `npm install`
3.  Start the game: `npm run dev`

## 🎮 How to Play

Perform **ONE** main action per turn:

1.  **Take Gems:** Up to 3 contiguous gems (no Gold).
2.  **Reserve:** Take 1 Gold and reserve 1 card.
3.  **Buy Card:** Pay the gem cost (minus bonuses).

**Optional Actions:**

- **Use Privilege:** Spend a scroll to take 1 non-Gold gem.
- **Replenish:** Refill the board (opponent gains a Privilege).
