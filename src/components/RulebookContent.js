export const RULEBOOK_CONTENT = [
    {
        title: { en: "Game Overview", zh: "游戏概述" },
        body: {
            en: " Welcome to the world of Gem Duel! In this standalone game, you face a more aggressive rival. As a master of a guild, you must craft the most exquisite jewelry for the monarchs and nobility of the Renaissance. By collecting rare gems, pearls, and gold, you will build a commercial empire, recruit artisans, and win the favor of the Royals. This is not just a contest of wealth, but a battle of wits and strategy. Only the shrewdest jeweler will prevail in this duel and claim ultimate prestige!",
            zh: " 欢迎来到《宝石：对决》的世界！在这个专为双人对战设计的独立游戏中，你将面对一个更具侵略性的对手。作为公会的大师，你需要为文艺复兴时期的君主和贵族们打造最精美的珠宝。通过收集珍稀的宝石、珍珠和黄金，你将建立商业帝国，招募能工巧匠，并赢得皇室的青睐。这不仅是一场财富的竞赛，更是一场智慧与策略的较量。唯有最精明的珠宝商，才能在这场对决中胜出，赢得至高无上的威望！"
        }
    },
    {
        title: { en: "Winning Conditions", zh: "胜利条件" },
        body: {
            en: "Victory Conditions (Meet any one to win):\n\nTotal Points: Reach 20 or more prestige points.\n\nColor Mastery: Reach 10 or more points in a single color.\n\nCrowns: Collect 10 or more crown symbols.",
            zh: "玩家只需满足以下三个条件之一即可立即获胜：\n\n总分： 获得 20 点或以上的威望分数。\n\n同色分： 在同一种颜色的卡牌上获得 10 点或以上分数。\n\n皇冠： 收集到 10 个或以上的皇冠图标。"
        }
    },
    {
        title: { en: "Turn Actions", zh: "回合行动" },
        body: {
            en: "Actions (Must choose one per turn):\n\nTake Gems: Take up to 3 adjacent gems (horizontally, vertically, or diagonally) from the board (excluding Gold).\n\nGold & Reserve: First, reserve 1 card from the market or a deck to your hand. Then, take 1 Gold from the board. If there is no Gold on the board, you do not get one.\n\nPurchase: Pay the required costs to buy a card from the market or your hand.\n\nGem Limit: At the end of your turn, if you have more than 10 gems (including Gold), you must discard down to 10.",
            zh: "在你的回合，必须从以下三个行动中选择一个：\n\n拿取宝石： 从宝石盘中连续拿取最多 3 颗相邻的宝石（横、竖、斜，不能包含金币）。\n\n拿取金币与预约： 首先，预约 1 张市场或牌库顶的卡牌（放入手牌）。然后，从盘面上拿取 1 枚金币。如果盘面上没有金币，则不获得金币。\n\n购买卡牌： 支付对应的宝石成本，购买 1 张市场或手牌中的卡牌。\n\n宝石上限：回合结束时，如果你持有的宝石（含黄金）超过 10 个，必须弃置直到剩余 10 个。"
        }
    },
    {
        title: { en: "Privilege & Refill", zh: "特权与补给" },
        body: {
            en: "Privileges & Refill:\n\nPrivilege Scrolls:\n* Setup: Player 2 starts with 1 Privilege Scroll.\n* Gain: Earned when the opponent refills the board or takes 2 Pearls/3 same-colored gems.\n* Use: Spend before your action to take any non-gold gem from the board.\n\nRefill: You can refill the board at any time, but your opponent gains a Privilege scroll. Note: If the board is empty at the start of your turn, you must refill it, and your opponent does not gain a Privilege.",
            zh: "特权卷轴 (Privilege)：\n初始设置： 后手玩家（Player 2）开局获得 1 个特权卷轴。\n获得： 当对手执行“补给盘面”或同时拿取 2 颗珍珠/3 颗同色宝石时获得。\n使用： 在行动前消耗一个卷轴，从盘面任意取走一颗非金币宝石。\n\n补给盘面： 你可以随时选择补给，但对手会因此获得一个特权卷轴。注意：如果回合开始时盘面为空，你必须补给，且对手不会获得特权。"
        }
    },
    {
        title: { en: "Card Abilities", zh: "卡牌技能" },
        body: {
            en: "Card Abilities:\n\nExtra Turn: Take another turn immediately.\n\nMatching Gem: Take a gem from the board that matches the card's color.\n\nSteal: Take one gem from your opponent's inventory (except Gold).\n\nPrivilege: Gain one Privilege scroll.\n\nWildcard (Joker): Choose a color for the card upon purchase.",
            zh: "购买带有图标的卡牌会立即触发特殊能力：\n\n额外回合 (Double Arrow)： 立即进行另一个回合。\n\n同色奖励 (Gem Icon)： 从盘面拿取一颗与该卡牌同色的宝石。\n\n偷取 (Steal)： 从对手手中偷取一颗宝石（不能偷金币）。\n\n特权 (Scroll)： 获得一个特权卷轴。\n\n百搭颜色 (Joker)： 购买时指定该卡牌代表的一种颜色。"
        }
    },
    {
        title: { en: "Royal Cards", zh: "皇室卡" },
        body: {
            en: "When you reach 3 and 6 total Crowns, immediately choose one available Royal card. These provide high points or powerful abilities.",
            zh: "当你的皇冠总数达到 3 个和 6 个时，可以立即从皇室卡堆中选择一张。这些卡牌提供高额分数或特殊技能。"
        }
    }
];