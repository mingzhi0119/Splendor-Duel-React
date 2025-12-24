import { ABILITIES } from '../constants';

/* Manual Fixed Data
  确保 Level 绝对正确，防止 CSV 解析错位
*/

const LEVEL_1_CARDS = [
  { id: 'l1-bl-0', level: 1, points: 0, bonusColor: 'black', bonusCount: 1, crowns: 0, cost: { red: 1, green: 1, blue: 1, white: 1 }, ability: ABILITIES.NONE.id },
  { id: 'l1-bl-1', level: 1, points: 0, bonusColor: 'black', bonusCount: 1, crowns: 0, cost: { pearl: 1, blue: 2, white: 2 }, ability: ABILITIES.AGAIN.id },
  { id: 'l1-bl-2', level: 1, points: 0, bonusColor: 'black', bonusCount: 1, crowns: 0, cost: { red: 2, green: 2 }, ability: ABILITIES.BONUS_GEM.id },
  { id: 'l1-bl-3', level: 1, points: 1, bonusColor: 'black', bonusCount: 1, crowns: 0, cost: { green: 3, blue: 2 }, ability: ABILITIES.NONE.id },
  { id: 'l1-bl-4', level: 1, points: 0, bonusColor: 'black', bonusCount: 1, crowns: 1, cost: { white: 3 }, ability: ABILITIES.NONE.id },
  { id: 'l1-re-5', level: 1, points: 0, bonusColor: 'red', bonusCount: 1, crowns: 0, cost: { black: 1, green: 1, blue: 1, white: 1 }, ability: ABILITIES.NONE.id },
  { id: 'l1-re-6', level: 1, points: 0, bonusColor: 'red', bonusCount: 1, crowns: 0, cost: { pearl: 1, black: 2, white: 2 }, ability: ABILITIES.AGAIN.id },
  { id: 'l1-re-7', level: 1, points: 0, bonusColor: 'red', bonusCount: 1, crowns: 0, cost: { green: 2, blue: 2 }, ability: ABILITIES.BONUS_GEM.id },
  { id: 'l1-re-8', level: 1, points: 1, bonusColor: 'red', bonusCount: 1, crowns: 0, cost: { black: 3, blue: 3, white: 2 }, ability: ABILITIES.NONE.id },
  { id: 'l1-re-9', level: 1, points: 0, bonusColor: 'red', bonusCount: 1, crowns: 1, cost: { black: 3 }, ability: ABILITIES.NONE.id },
  { id: 'l1-gr-10', level: 1, points: 0, bonusColor: 'green', bonusCount: 1, crowns: 0, cost: { black: 1, red: 1, blue: 1, white: 1 }, ability: ABILITIES.NONE.id },
  { id: 'l1-gr-11', level: 1, points: 0, bonusColor: 'green', bonusCount: 1, crowns: 0, cost: { pearl: 1, black: 2, red: 2 }, ability: ABILITIES.AGAIN.id },
  { id: 'l1-gr-12', level: 1, points: 0, bonusColor: 'green', bonusCount: 1, crowns: 0, cost: { blue: 2, white: 2 }, ability: ABILITIES.BONUS_GEM.id },
  { id: 'l1-gr-13', level: 1, points: 1, bonusColor: 'green', bonusCount: 1, crowns: 0, cost: { black: 2, white: 3 }, ability: ABILITIES.NONE.id },
  { id: 'l1-gr-14', level: 1, points: 0, bonusColor: 'green', bonusCount: 1, crowns: 1, cost: { red: 3 }, ability: ABILITIES.NONE.id },
  { id: 'l1-bl-15', level: 1, points: 0, bonusColor: 'blue', bonusCount: 1, crowns: 0, cost: { black: 1, red: 1, green: 1, white: 1 }, ability: ABILITIES.NONE.id },
  { id: 'l1-bl-16', level: 1, points: 0, bonusColor: 'blue', bonusCount: 1, crowns: 0, cost: { pearl: 1, red: 2, green: 2 }, ability: ABILITIES.AGAIN.id },
  { id: 'l1-bl-17', level: 1, points: 0, bonusColor: 'blue', bonusCount: 1, crowns: 0, cost: { black: 2, white: 2 }, ability: ABILITIES.BONUS_GEM.id },
  { id: 'l1-bl-18', level: 1, points: 1, bonusColor: 'blue', bonusCount: 1, crowns: 0, cost: { black: 3, red: 2 }, ability: ABILITIES.NONE.id },
  { id: 'l1-bl-19', level: 1, points: 0, bonusColor: 'blue', bonusCount: 1, crowns: 1, cost: { green: 3 }, ability: ABILITIES.NONE.id },
  { id: 'l1-wh-20', level: 1, points: 0, bonusColor: 'white', bonusCount: 1, crowns: 0, cost: { black: 1, red: 1, green: 1, blue: 1 }, ability: ABILITIES.NONE.id },
  { id: 'l1-wh-21', level: 1, points: 0, bonusColor: 'white', bonusCount: 1, crowns: 0, cost: { pearl: 1, green: 2, blue: 2 }, ability: ABILITIES.AGAIN.id },
  { id: 'l1-wh-22', level: 1, points: 0, bonusColor: 'white', bonusCount: 1, crowns: 0, cost: { black: 2, red: 2 }, ability: ABILITIES.BONUS_GEM.id },
  { id: 'l1-wh-23', level: 1, points: 1, bonusColor: 'white', bonusCount: 1, crowns: 0, cost: { red: 3, green: 2 }, ability: ABILITIES.NONE.id },
  { id: 'l1-wh-24', level: 1, points: 0, bonusColor: 'white', bonusCount: 1, crowns: 1, cost: { blue: 3 }, ability: ABILITIES.NONE.id },
  { id: 'l1-jo-26', level: 1, points: 1, bonusColor: 'gold', bonusCount: 1, crowns: 0, cost: { pearl: 1, black: 4 }, ability: ABILITIES.NONE.id },
  { id: 'l1-jo-27', level: 1, points: 0, bonusColor: 'gold', bonusCount: 1, crowns: 1, cost: { pearl: 1, white: 4 }, ability: ABILITIES.NONE.id },
  { id: 'l1-jo-28', level: 1, points: 1, bonusColor: 'gold', bonusCount: 1, crowns: 0, cost: { pearl: 1, black: 1, green: 2, white: 2 }, ability: ABILITIES.NONE.id },
  { id: 'l1-jo-29', level: 1, points: 1, bonusColor: 'gold', bonusCount: 1, crowns: 0, cost: { pearl: 1, black: 1, red: 2, blue: 2 }, ability: ABILITIES.NONE.id },
];

const LEVEL_2_CARDS = [
  { id: 'l2-bl-32', level: 2, points: 1, bonusColor: 'black', bonusCount: 1, crowns: 0, cost: { green: 3, white: 4 }, ability: ABILITIES.STEAL.id },
  { id: 'l2-bl-33', level: 2, points: 1, bonusColor: 'black', bonusCount: 2, crowns: 0, cost: { blue: 2, white: 5 }, ability: ABILITIES.NONE.id },
  { id: 'l2-bl-34', level: 2, points: 2, bonusColor: 'black', bonusCount: 1, crowns: 1, cost: { pearl: 1, red: 2, green: 2, blue: 2 }, ability: ABILITIES.NONE.id },
  { id: 'l2-bl-35', level: 2, points: 2, bonusColor: 'black', bonusCount: 1, crowns: 0, cost: { pearl: 1, black: 4, red: 2 }, ability: ABILITIES.SCROLL.id },
  { id: 'l2-re-36', level: 2, points: 1, bonusColor: 'red', bonusCount: 1, crowns: 0, cost: { black: 4, blue: 3 }, ability: ABILITIES.STEAL.id },
  { id: 'l2-re-37', level: 2, points: 1, bonusColor: 'red', bonusCount: 2, crowns: 0, cost: { black: 5, white: 2 }, ability: ABILITIES.NONE.id },
  { id: 'l2-re-38', level: 2, points: 2, bonusColor: 'red', bonusCount: 1, crowns: 1, cost: { pearl: 1, green: 2, blue: 2, white: 2 }, ability: ABILITIES.NONE.id },
  { id: 'l2-re-39', level: 2, points: 2, bonusColor: 'red', bonusCount: 1, crowns: 0, cost: { pearl: 1, red: 4, green: 2 }, ability: ABILITIES.SCROLL.id },
  { id: 'l2-gr-40', level: 2, points: 1, bonusColor: 'green', bonusCount: 1, crowns: 0, cost: { red: 4, white: 3 }, ability: ABILITIES.STEAL.id },
  { id: 'l2-gr-41', level: 2, points: 1, bonusColor: 'green', bonusCount: 2, crowns: 0, cost: { black: 2, black: 5 }, ability: ABILITIES.NONE.id },
  { id: 'l2-gr-42', level: 2, points: 2, bonusColor: 'green', bonusCount: 1, crowns: 1, cost: { pearl: 1, black: 2, blue: 2, white: 2 }, ability: ABILITIES.NONE.id },
  { id: 'l2-gr-43', level: 2, points: 2, bonusColor: 'green', bonusCount: 1, crowns: 0, cost: { pearl: 1, green: 4, blue: 2 }, ability: ABILITIES.SCROLL.id },
  { id: 'l2-bl-44', level: 2, points: 1, bonusColor: 'blue', bonusCount: 1, crowns: 0, cost: { black: 3, green: 4 }, ability: ABILITIES.STEAL.id },
  { id: 'l2-bl-45', level: 2, points: 1, bonusColor: 'blue', bonusCount: 2, crowns: 0, cost: { red: 2, green: 5 }, ability: ABILITIES.NONE.id },
  { id: 'l2-bl-46', level: 2, points: 2, bonusColor: 'blue', bonusCount: 1, crowns: 1, cost: { pearl: 1, black: 2, red: 2, white: 2 }, ability: ABILITIES.NONE.id },
  { id: 'l2-bl-47', level: 2, points: 2, bonusColor: 'blue', bonusCount: 1, crowns: 0, cost: { pearl: 1, blue: 4, white: 2 }, ability: ABILITIES.SCROLL.id },
  { id: 'l2-wh-48', level: 2, points: 1, bonusColor: 'white', bonusCount: 1, crowns: 0, cost: { red: 3, blue: 4 }, ability: ABILITIES.STEAL.id },
  { id: 'l2-wh-49', level: 2, points: 1, bonusColor: 'white', bonusCount: 2, crowns: 0, cost: { green: 2, blue: 5 }, ability: ABILITIES.NONE.id },
  { id: 'l2-wh-50', level: 2, points: 2, bonusColor: 'white', bonusCount: 1, crowns: 1, cost: { pearl: 1, black: 2, red: 2, green: 2 }, ability: ABILITIES.NONE.id },
  { id: 'l2-wh-51', level: 2, points: 2, bonusColor: 'white', bonusCount: 1, crowns: 0, cost: { pearl: 1, black: 2, white: 4 }, ability: ABILITIES.SCROLL.id },
  { id: 'l2-jo-53', level: 2, points: 2, bonusColor: 'gold', bonusCount: 1, crowns: 0, cost: { pearl: 1, green: 6 }, ability: ABILITIES.NONE.id },
  { id: 'l2-jo-54', level: 2, points: 0, bonusColor: 'gold', bonusCount: 1, crowns: 2, cost: { pearl: 1, green: 6 }, ability: ABILITIES.NONE.id },
  { id: 'l2-jo-55', level: 2, points: 0, bonusColor: 'gold', bonusCount: 1, crowns: 2, cost: { pearl: 1, blue: 6 }, ability: ABILITIES.NONE.id },
];

const LEVEL_3_CARDS = [
  { id: 'l3-bl-58', level: 3, points: 3, bonusColor: 'black', bonusCount: 1, crowns: 2, cost: { pearl: 1, red: 3, green: 5, white: 3 }, ability: ABILITIES.NONE.id },
  { id: 'l3-bl-59', level: 3, points: 4, bonusColor: 'black', bonusCount: 1, crowns: 0, cost: { black: 6, red: 2, white: 2 }, ability: ABILITIES.NONE.id },
  { id: 'l3-re-60', level: 3, points: 3, bonusColor: 'red', bonusCount: 1, crowns: 2, cost: { pearl: 1, black: 3, green: 3, blue: 5 }, ability: ABILITIES.NONE.id },
  { id: 'l3-re-61', level: 3, points: 4, bonusColor: 'red', bonusCount: 1, crowns: 0, cost: { black: 2, red: 6, green: 2 }, ability: ABILITIES.NONE.id },
  { id: 'l3-gr-62', level: 3, points: 3, bonusColor: 'green', bonusCount: 1, crowns: 2, cost: { pearl: 1, red: 3, blue: 3, white: 5 }, ability: ABILITIES.NONE.id },
  { id: 'l3-gr-63', level: 3, points: 4, bonusColor: 'green', bonusCount: 1, crowns: 0, cost: { red: 2, green: 6, blue: 2 }, ability: ABILITIES.NONE.id },
  { id: 'l3-bl-64', level: 3, points: 3, bonusColor: 'blue', bonusCount: 1, crowns: 2, cost: { pearl: 1, black: 5, red: 3, white: 3 }, ability: ABILITIES.NONE.id },
  { id: 'l3-bl-65', level: 3, points: 4, bonusColor: 'blue', bonusCount: 1, crowns: 0, cost: { green: 2, blue: 6, white: 2 }, ability: ABILITIES.NONE.id },
  { id: 'l3-wh-66', level: 3, points: 3, bonusColor: 'white', bonusCount: 1, crowns: 2, cost: { pearl: 1, black: 3, green: 5, blue: 3 }, ability: ABILITIES.NONE.id },
  { id: 'l3-wh-67', level: 3, points: 4, bonusColor: 'white', bonusCount: 1, crowns: 0, cost: { black: 2, blue: 2, white: 6 }, ability: ABILITIES.NONE.id },
  { id: 'l3-jo-69', level: 3, points: 0, bonusColor: 'gold', bonusCount: 1, crowns: 3, cost: { black: 8 }, ability: ABILITIES.NONE.id },
  { id: 'l3-jo-70', level: 3, points: 3, bonusColor: 'gold', bonusCount: 1, crowns: 0, cost: { red: 8 }, ability: ABILITIES.AGAIN.id }
];

export const REAL_CARDS = [...LEVEL_1_CARDS, ...LEVEL_2_CARDS, ...LEVEL_3_CARDS];