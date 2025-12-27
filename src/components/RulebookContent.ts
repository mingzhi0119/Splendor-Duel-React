export interface RulebookPage {
    title: { en: string; zh: string };
    body: { en: string; zh: string };
}

export const RULEBOOK_CONTENT: RulebookPage[] = [
    {
        title: { en: 'Introduction', zh: '介绍' },
        body: {
            en: `
Welcome to Gem Duel

Gem Duel is a 2-player game where you play as a guild master of jewelers. You will compete against your opponent to acquire the most prestigious Gem cards, gain the favor of the Royal Court, and ultimately become the most renowned jeweler in the realm.

Goal of the Game

There are three ways to win the game. The game ends immediately if you meet any of these conditions at the end of your turn:

1.  20 Prestige Points total.
2.  10 Crowns collected.
3.  10 Prestige Points on cards of a single color.

Components

    Game Board: A 5x5 grid holding up to 25 Gem tokens.
    Gem Tokens: 
        Basic: Blue, White, Green, Black, Red (4 of each).
        Special: Pearl (2), Gold (3).
    Cards: 3 levels of Gem cards (Level 1, 2, 3).
    Royal Cards: Special cards awarded for collecting Crowns.
    Privilege Scrolls: Tokens that allow extra actions.
        `,
            zh: `
欢迎来到 Gem Duel

《Gem Duel》是一款双人游戏，你将扮演珠宝商公会的会长。你将与对手竞争，获取最负盛名的宝石卡，赢得皇室的青睐，并最终成为王国中最著名的珠宝商。

游戏目标

有三种获胜方式。如果在你的回合结束时满足以下任一条件，游戏立即结束：

1.  20点声望值。
2.  收集10个皇冠。
3.  单一颜色卡牌获得10点声望值。

游戏组件

    游戏版图：一个 5x5 的网格，最多可容纳 25 个宝石代币。
    宝石代币：
        基础：蓝色、白色、绿色、黑色、红色（各 4 个）。
        特殊：珍珠 (2 个)、黄金 (3 个)。
    卡牌：3 个等级的宝石卡（1级、2级、3级）。
    皇室卡：通过收集皇冠获得的特殊奖励卡。
    特权卷轴：允许执行额外行动的代币。
`,
        },
    },
    {
        title: { en: 'Turn Overview', zh: '回合概述' },
        body: {
            en: `
On Your Turn

You must perform exactly one of the following Main Actions:

1.  Take Gems from the Board:
    Select up to 3 consecutive tokens in a contiguous line (row, column, or diagonal).
    You cannot take Gold tokens with this action.
    You cannot take tokens if there is a gap between them.

2.  Take 1 Gold Token:
    Take 1 Gold token from the board.
    Reserve 1 Card from the Market (or top of a deck) into your hand.
    You can hold a maximum of 3 Reserved cards.
    Note: If no Gold is available, you can still Reserve a card, but you don't get the Gold.

3.  Buy a Card:
    Buy a card from the Market or your Reserved hand.
    Pay the cost shown on the card using your Gems and/or Bonuses.

Optional Actions

Before your Main Action, you may use any number of Privilege Scrolls:
Return 1 Scroll to the supply to take 1 Non-Gold Gem from the board.

Before your Main Action, you may Replenish the Board:
If the bag is not empty, you can refill the board spirally.
Penalty: Your opponent gains 1 Privilege Scroll.
        `,
            zh: `
你的回合

你必须执行以下**恰好一个**主要行动：

1.  从版图拿取宝石：
    选择最多 3 个连续 的代币，它们必须排成一条直线（行、列或对角线）。
    你不能通过此行动拿取黄金代币。
    如果代币之间有空隙，你不能同时拿取它们。

2.  拿取 1 个黄金代币：
    从版图上拿取 1 个黄金代币。
    从市场（或卡组顶端）保留 1 张卡牌到你的手中。
    你最多可以持有 3 张保留卡牌。
    注意：如果没有黄金可用，你仍然可以保留卡牌，但无法获得黄金。

3.  购买卡牌：
    从市场或你的保留卡牌中购买一张卡。
    使用你的宝石和/或奖励支付卡牌上显示的成本。

可选行动

在执行主要行动之前，你可以使用任意数量特权卷轴：
将 1 个卷轴归还至供应堆，从版图上拿取 1 个非黄金宝石。

在执行主要行动之前，你可以补给版图：
如果袋子不为空，你可以按螺旋顺序填满版图。
惩罚：你的对手获得 1 个特权卷轴。
`,
        },
    },
    {
        title: { en: 'Buying Cards & Bonuses', zh: '购买卡牌与奖励' },
        body: {
            en: `
Cost & Payment

Each card shows its cost in Gems (bottom left).
Bonuses: Cards you have already bought provide Bonuses (top right gem icon).
    1 Bonus reduces the cost of future cards of that color by 1.
    Example: If a card costs 3 Blue and you have 2 Blue Bonuses, you only pay 1 Blue Gem.
Gold (Joker): Gold tokens can replace any basic color Gem.
Pearls: Pearls cannot be discounted by Bonuses. You must pay with actual Pearl tokens (or Gold).

Abilities

Some cards have special abilities (icons at the top center):

Play Again: Take another turn immediately.
Bonus Gem: Take 1 Gem of the card's color from the Board (if available).
Steal: Steal 1 non-Gold Gem from your opponent.
Privilege: Take 1 Privilege Scroll from the supply (or opponent if supply is empty).
        `,
            zh: `
成本与支付

每张卡牌左下角显示其宝石成本。
奖励 (Bonuses)：你已经购买的卡牌会提供奖励（右上角的宝石图标）。
    1 个奖励可以使未来购买该颜色卡牌的成本减少 1。
    例如：如果一张卡需要 3 个蓝色，而你有 2 个蓝色奖励，你只需支付 1 个蓝色宝石。
黄金 (百搭)：黄金代币可以替代任何基础颜色的宝石。
珍珠：珍珠不能被奖励抵扣。你必须支付实际的珍珠代币（或黄金）。

能力

某些卡牌具有特殊能力（顶部中央的图标）：

再次行动 (Play Again)：立即获得额外的一个回合。
奖励宝石 (Bonus Gem)：从版图上拿取 1 个与该卡牌颜色相同的宝石（如果有）。
掠夺 (Steal)：从对手那里偷取 1 个非黄金宝石。
特权 (Privilege)：从供应堆拿取 1 个特权卷轴（如果供应堆为空，则从对手处拿取）。
`,
        },
    },
    {
        title: { en: 'The Royal Court', zh: '皇室法院' },
        body: {
            en: `
Crowns & Royals

Some cards display Crowns (top of the card).
When you collect 3 Crowns, you must immediately take a Royal Card.
When you collect 6 Crowns, you take another Royal Card.
Royal Cards provide Prestige Points and sometimes special abilities.
Royal Cards do not have a cost; they are free rewards.
Royal Cards count towards your total score and Crown count, but do not provide color bonuses.

Winning Condition Check

At the end of your turn, check if you have met any of the 3 victory conditions:
1.  20 Points
2.  10 Crowns
3.  10 Points in one color

If so, you win immediately!
        `,
            zh: `
皇冠与皇室卡

某些卡牌上显示有皇冠（卡牌顶部）。
当你收集到 3 个皇冠 时，必须立即拿取一张皇室卡。
当你收集到 6 个皇冠 时，再拿取一张皇室卡。
皇室卡提供声望值，有时还带有特殊能力。
皇室卡没有成本，它们是免费的奖励。
皇室卡计入你的总分和皇冠总数，但不提供颜色奖励。

获胜条件检查

在你的回合结束时，检查是否满足以下 3 个获胜条件之一：
1.  20 分
2.  10 个皇冠
3.  单一颜色获得 10 分

如果满足，你立即获胜！
`,
        },
    },
    {
        title: { en: 'Tokens & Limits', zh: '代币与限制' },
        body: {
            en: `
Token Limits

10 Gems Max: At the end of your turn, if you have more than 10 tokens (including Gold and Pearls), you must discard down to 10.

Privilege Scrolls

Used to take 1 Gem from the board (optional free action).
If you need to take a Scroll and the supply is empty, you take one from your opponent!
If you and your opponent both have 0 Scrolls, taking a gem or refilling the board might give one to your opponent.
        `,
            zh: `
代币限制

最多 10 个宝石：在你的回合结束时，如果你持有的代币（包括黄金和珍珠）超过 10 个，你必须弃掉多余的，直到剩下 10 个。

特权卷轴

用于从版图拿取 1 个宝石（可选的免费行动）。
如果你需要拿取卷轴而供应堆已空，如果你和对手都没有卷轴，拿取特定宝石或补给版图可能会给对手一个卷轴。
`,
        },
    },
    {
        title: { en: 'Roguelike Mode (New!)', zh: '肉鸽模式（新！）' },
        body: {
            en: `
Roguelike Mode: Unique Starting Buffs

In this mode, players start with asymmetric abilities ("Buffs") that alter their strategy.
Before the game starts, a random **Buff Level (1-3)** is chosen.
Players draft a Buff from a pool of 3. Player 2 picks first.

Buff Levels

Level 1 (Minor Tweak): Small boosts to start the game.
Level 2 (Tactical Shift): Changes resource management or card costs.
Level 3 (Game Changer): Powerful effects with major trade-offs (e.g., increased victory requirements).

See the next page for a full list of Buffs.
        `,
            zh: `
肉鸽模式：独特的初始增益

在此模式下，玩家开始时拥有不对称的能力（“Buff”），这些能力会改变他们的策略。
游戏开始前，会随机选择一个 **Buff 等级 (1-3)**。
玩家从 3 个 Buff 的池中轮流挑选。玩家 2 先选。

Buff 等级

1 级 (微调)：游戏开始时的小幅提升。
2 级 (战术转变)：改变资源管理或卡牌成本。
3 级 (规则改变)：强大的效果，但伴随着重大的权衡（例如：提高获胜要求）。

请参阅下一页查看 Buff 的完整列表。
`,
        },
    },
    {
        title: { en: 'Buff Compendium', zh: '增益手册' },
        body: {
            en: `
Level 1: Minor Tweaks

Privilege Favor: Start with 1 extra Privilege Scroll and 1 Gold.
Head Start: Start with 1 random basic Gem. Win Condition: 18 Points.
Royal Blood: Start with 1 Crown.
Intelligence: Action: Peek at top 3 cards of any deck.
Deep Pockets: Gem holding limit increased to 12.
Backup Supply: Start with 2 random basic Gems.
Patient Investor: Gain 2 Gold on your first Reserve action.
Insight: You can always see the top card of the Level 1 Deck.

Level 2: Tactical Shifts

Pearl Trader: Gem limit increased to 11. Start with 1 Pearl.
Gold Reserve: Start with 1 Gold and 1 random Reserved Card.
Color Preference: Random color costs -1 for you (assigned at start).
Extortion: Every 2nd time you Replenish the board, steal 1 basic gem from opponent. (Cooldown: 2 Refills).
Flexible Discount: Reduce cost of Level 2 and 3 cards by 1.
Bounty Hunter: Gain 1 random gem when you buy a card with Crowns.
Recycler: Get 1 gem back when buying Level 2 or 3 cards.
Aggressive Expansion: Gain 1 random gem when you Replenish the board.

Level 3: Game Changers

King of Greed: All cards give +1 Point. Win Condition: 25 Points.
Royal Envoy: Can pick remaining Royal Card at Turn 5. No Single Color Win.
Double Agent: Privileges take 2 gems. Gem Cap: 8.
All-Seeing Eye: Reveal extra Level 3 card. Pay L3 cards with Gold at half value. Win Condition: Single Color 13.
Wonder Architect: Level 3 cards cost 3 less. Win Condition: 13 Crowns (No Single Color Win).
Minimalist: First 5 cards purchased provide Double Bonuses. Max Gems: 6.
Pacifist: Immune to negative effects (Theft). Start with 1 extra Privilege.
Desperate Gamble: Start with 2 Gold. Cannot "Take 3 Gems". Gain a special (non-stealable) Privilege every 2 turns.
        `,
            zh: `
1 级：微调 (Minor Tweaks)

特权眷顾 (Privilege Favor)：开始时额外获得 1 个特权卷轴和 1 个黄金。
先行一步 (Head Start)：开始时获得 1 个随机基础宝石。获胜条件：18 分。
皇室血统 (Royal Blood)：开始时拥有 1 个皇冠。
情报员 (Intelligence)：行动：查看任何卡组顶部的 3 张牌。
深口袋 (Deep Pockets)：宝石持有上限增加至 12 个。
后备补给 (Backup Supply)：开始时获得 2 个随机基础宝石。
耐心投资者 (Patient Investor)：在你的第一次保留行动中获得 2 个黄金。
洞察力 (Insight)：你始终可以看到 1 级卡组顶部的牌。

2 级：流派 (Tactical Shifts)

珍珠贸易商 (Pearl Trader)：宝石上限增加至 11。开始时获得 1 个珍珠。
黄金储备 (Gold Reserve)：开始时获得 1 个黄金和 1 张随机保留卡。
色彩偏好 (Color Preference)：随机一种颜色对你而言成本 -1。
巧取豪夺 (Extortion)：你每执行 2 次 补给版图，就从对手那里偷取 1 个基础宝石。
灵活折扣 (Flexible Discount)：购买 2 级和 3 级卡牌时，成本减少 1。
赏金猎人 (Bounty Hunter)：当你购买带有皇冠的卡牌时，获得 1 个随机宝石。
回收者 (Recycler)：购买 2 级或 3 级卡牌时，退回 1 个宝石。
激进扩张 (Aggressive Expansion)：当你补给版图时，获得 1 个随机宝石。

3 级：规则改变 (Game Changers)

贪婪之王 (King of Greed)：所有卡牌额外提供 +1 分。获胜条件：25 分。
皇家特使 (Royal Envoy)：可以在第 5 回合直接拿取剩余的皇室卡。取消单色获胜。
双重间谍 (Double Agent)：特权可以拿取 2 个宝石。宝石上限：8。
全知之眼 (All-Seeing Eye)：额外展示一张 3 级卡。用黄金支付 3 级卡时价值翻倍。获胜条件：单色 13 分。
奇迹建筑师 (Wonder Architect)：3 级卡成本减少 3。获胜条件：13 个皇冠（取消单色获胜）。
极简主义 (Minimalist)：购买的前 5 张卡提供双倍奖励。宝石上限：6。
和平主义者 (Pacifist)：免疫负面效果（偷取）。开始时额外获得 1 个特权。
孤注一掷 (Desperate Gamble)：开始时获得 2 个黄金。无法执行“拿取 3 个宝石”。每 2 回合获得一个特殊的特权。
`,
        },
    },
];
