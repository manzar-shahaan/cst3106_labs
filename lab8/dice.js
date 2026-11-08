// dice object and roll logic
class Dice {
    constructor() {
        this.value = null;
    }
    roll() {
        this.value = Math.floor(Math.random() * 6) + 1;
        return this.value;
    }
    initRollSix() {
        this.value = 6;
        return this.value;
    }
    getValue() {
        return this.value;
    }
}