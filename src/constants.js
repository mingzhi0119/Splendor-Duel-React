import { Diamond, Triangle, Square, Circle, Hexagon } from 'lucide-react';

export const GRID_SIZE = 5;

export const GEM_TYPES = {
  BLUE:  { id: 'blue',  color: 'from-blue-400 to-blue-700',     border: 'border-blue-300', label: 'Blue' },
  WHITE: { id: 'white', color: 'from-slate-100 to-slate-400',   border: 'border-white',    label: 'White' },
  GREEN: { id: 'green', color: 'from-emerald-400 to-emerald-700', border: 'border-emerald-300', label: 'Green' },
  BLACK: { id: 'black', color: 'from-slate-700 to-slate-900',   border: 'border-gray-500', label: 'Black' },
  RED:   { id: 'red',   color: 'from-red-400 to-red-700',       border: 'border-red-300',  label: 'Red' },
  PEARL: { id: 'pearl', color: 'from-pink-300 to-pink-500',     border: 'border-pink-300', label: 'Pearl' },
  GOLD:  { id: 'gold',  color: 'from-yellow-300 via-yellow-500 to-yellow-700', border: 'border-yellow-200', label: 'Gold' },
  EMPTY: { id: 'empty', color: 'bg-transparent', border: 'border-transparent', label: '' },
};

export const INITIAL_COUNTS = {
  red: 4, green: 4, blue: 4, black: 4, white: 4, pearl: 2, gold: 3,
};

export const BONUS_COLORS = ['blue', 'white', 'green', 'black', 'red'];

export const SPIRAL_ORDER = [
  [2, 2], // Center
  [2, 3], [3, 3], [3, 2], [3, 1], [2, 1], [1, 1], [1, 2], [1, 3], // Inner Ring
  [1, 4], [2, 4], [3, 4], [4, 4], [4, 3], [4, 2], [4, 1], [4, 0], [3, 0], [2, 0], [1, 0], [0, 0], [0, 1], [0, 2], [0, 3], [0, 4] // Outer Ring
];