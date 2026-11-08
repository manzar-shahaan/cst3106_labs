// scoring math

const upperScoring = { ones: 1, twos: 2, threes: 3, fours: 4, fives: 5, sixes: 6 };


function calculateScore(category, rolledDie) {
    // upper categories sum matching faces only
    const face = upperScoring[category];
    if (face != undefined) {
      return rolledDie.reduce((sum, die) => die.value === face ? sum + die.value : sum, 0);   
    }
    // lower scores every combo then picks one
    return combination(rolledDie)[category];
}

function combination(rolledDie) {
    // reads every combo after counting faces
    const rolledValues = rolledDie.map(die => die.value);

    const counts = {};
    for (const value of rolledValues) {
        counts[value] = (counts[value] || 0) + 1;
    }

    const result = {
        onepair: 0,
        twopairs: 0,
        threeofakind: 0,
        fourofakind: 0,
        smallstraight: 0,
        largestraight: 0,
        fullhouse: 0,
        chance: 0,
        yatzy: 0,
    };

    // keys come back as strings
    const faces = Object.keys(counts).map(Number);

    // higher count still qualifies for the smaller combo
    for (const face of faces) {
        if (counts[face] >= 2) result.onepair = Math.max(result.onepair, face * 2);
        if (counts[face] >= 3) result.threeofakind = Math.max(result.threeofakind, face * 3);
        if (counts[face] >= 4) result.fourofakind = Math.max(result.fourofakind, face * 4);
        if (counts[face] === 5) result.yatzy = 50;
    }

    // count 4 gives two pairs of one face
    const pairs = [];
    for (const face of faces) {
        const pairCount = Math.floor(counts[face] / 2);
        for (let i = 0; i < pairCount; i++) pairs.push(face);
    }
    if (pairs.length >= 2) {
        pairs.sort((a, b) => b - a);
        result.twopairs = (pairs[0] + pairs[1]) * 2;
    }

    // all five faces must be present
    if ([1, 2, 3, 4, 5].every(f => counts[f] !== undefined)) result.smallstraight = 15;
    if ([2, 3, 4, 5, 6].every(f => counts[f] !== undefined)) result.largestraight = 20;

    const total = rolledValues.reduce((sum, value) => sum + value, 0);
    result.chance = total;

    // triple and a different pair
    const tripleFace = faces.find(f => counts[f] >= 3);
    const pairFace = faces.find(f => f !== tripleFace && counts[f] >= 2);
    if (tripleFace !== undefined && pairFace !== undefined) {
        result.fullhouse = total;
    }

    return result;
}

