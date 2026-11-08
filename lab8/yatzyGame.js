// game state lives here
const players = [];
const scoreTable = [];

const UPPER_CATEGORIES = ['ones', 'twos', 'threes', 'fours', 'fives', 'sixes'];
const LOWER_CATEGORIES = ['onepair', 'twopairs', 'threeofakind', 'fourofakind', 'fullhouse', 'smallstraight', 'largestraight', 'chance', 'yatzy'];

class yatzyGame {
  constructor() {
    this.currentPlayer = null;
    this.currentRound = null;
    this.totalScore = null;
    this.usedCategories = new Set();
    this.committedScores = {};
    this.rollCount = 0;
  }

  startNewGame() {
    this.usedCategories = new Set();
    this.committedScores = {};
    this.rollCount = 0;
    this.totalScore = 0;
  }

  recordRoll() {
    this.rollCount++;
  }

  canRoll() {
    // 3 rolls max per turn
    return this.rollCount < 3;
  }

  hasRolled() {
    return this.rollCount > 0;
  }

  categoryUsed(category) {
    return this.usedCategories.has(category);
  }

  endTurn(category, score) {
    this.usedCategories.add(category);
    this.committedScores[category] = score;
    this.rollCount = 0;
  }

  getTotals() {
    // bonus at 63 or more
    const sum = (categories) => categories.reduce((sum, c) => sum + (this.committedScores[c] || 0), 0);
    const upperSum = sum(UPPER_CATEGORIES);
    const bonus = upperSum >= 63 ? 50 : 0;
    return { upperSum, bonus, total: upperSum + bonus + sum(LOWER_CATEGORIES) };
  }

  allCategoriesUsed() {
    return UPPER_CATEGORIES.concat(LOWER_CATEGORIES).every(c => this.usedCategories.has(c));
  }

  endGame() {

  }
}

const game = new yatzyGame();
