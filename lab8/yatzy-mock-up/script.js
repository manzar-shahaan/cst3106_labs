const headerUrl = 'header.html';
const footerUrl = 'footer.html';

// html partial loader
async function loadContent(url, targetId) {
    try {
        const response = await fetch(url);

        if (!response.ok) {
            throw new Error(`HTTP error! Status: ${response.status}`);
        }

        const content = await response.text();
        const $target = $(`#${targetId}`);

        if ($target.length) {
            $target.html(content);
        }

    } catch (error) {
        console.error(`Could not load ${url}:`, error);
        const $target = $(`#${targetId}`);
        if ($target.length) {
            $target.html(`<p style="color: red;">Error loading page components.</p>`);
        }
    }
}

loadContent(headerUrl, 'header');
loadContent(footerUrl, 'footer');

const boardStart = 'board-ingame.html'
$('#start-button').on('click', startYatzy);

// start button flow
async function startYatzy() {
    // board DOM only exists after START
    await loadContent(boardStart, 'board-main-content');
    $('header').addClass('in-game');
    initRolledDie();
    game.startNewGame();
    rollButton = $('#roll-dice');
    rollButton.on('click', renderDice);
    initScoreTableClicks();
    await loadDiceTemplate();
    firstKeptDice = $('#my-first-dice');
    secondKeptDice = $('#my-second-dice');
    thirdKeptDice = $('#my-third-dice');
    fourthKeptDice = $('#my-fourth-dice');
    fifthKeptDice = $('#my-fifth-dice');
    initDie();
}

const diceUrl = '../dice-design/main.html';
let diceTemplate;

// caches dice faces
async function loadDiceTemplate() {
    const response = await fetch(diceUrl);
    if (!response.ok) throw new Error(`HTTP error! Status: ${response.status}`);
    // jQuery parses the fetched HTML; wrapper stays detached (never in the DOM)
    diceTemplate = $('<div>').html(await response.text());
}

// hangs initial frames
async function initDie() {
    const target = $('#dice-roll-render');
    if (!target.length || !diceTemplate) return;
    // if (!game.canRoll()) return;
    
    target.empty();
    const returnedDieArray = initRollDieAllSix(rolledDie.length);
    returnedDieArray.forEach(dieObj => {
        // permanent frame wrapper; the face inside it gets swapped on roll
        const face = diceTemplate.find(`#dice-${dieObj.value}`).clone();
        const el = $('<div>', { class: 'die-slot' });
        el.append(face);

        // keep/unkeep handler lives on the frame, attached exactly once
        el.on('click', () => {
            if (!game.hasRolled()) return; // can't keep dice you haven't rolled
            dieObj.kept = !dieObj.kept;
            if (!dieObj.kept) {
                unkeepDice(dieObj);
                target.append(el);
            }
            else {
                keepDice(dieObj, el);
            }
        });

        // remember this die's frame so renderDice can swap its face later
        dieObj.$el = el;
        target.append(el);
    });
}

// presets all sixes
function initRollDieAllSix() {
  for (let i = 0; i < 5; i++) {
      rolledDie[i].initRollSix();
    }
    return rolledDie;
}

const rolledDie = [];
const keptDie = [];
let rollButton;

// shake, then reroll
async function renderDice() {
    const target = $('#dice-roll-render');
    if (!target.length || !diceTemplate) return;
    if (!game.canRoll()) return;


    target
        .animate({ marginLeft: '-=25px' }, 90)
        .animate({ marginLeft: '+=50px' }, 110)
        .animate({ marginLeft: '-=25px' }, 90, function () {
            // animation complete — now roll and swap the faces
            rollDie(rolledDie.length);
            rolledDie.forEach(dieObj => {
                const newFace = diceTemplate.find(`#dice-${dieObj.value}`).clone();
                dieObj.$el.empty().append(newFace); // swap photo inside the frame
            });

            updatePreview();

            game.recordRoll();
            const rollsLeft = 3 - game.rollCount;
            $('#turn-message').text(
                rollsLeft > 0 ? `${rollsLeft} roll${rollsLeft > 1 ? 's' : ''} left` : 'No rolls left — pick a category'
            );
            if (!game.canRoll()) {
                rollButton.prop('disabled', true); // rolls used up so must score
            }
        });
}

// five fresh dice
function initRolledDie() {
    rolledDie.length = 0;
    for (let i = 0; i < 5; i++) {
        rolledDie.push(new Dice());
  }
}

// rerolls pooled dice
function rollDie(value) {
    for (let i = 0; i < value; i++) {
        rolledDie[i].roll();
      }
      return rolledDie;
}

let firstKeptDice;
let secondKeptDice;
let thirdKeptDice;
let fourthKeptDice;
let fifthKeptDice;

// moves die to slot
function keepDice(newDice, el) {
    // kept dice skip reroll
    keptDie.push(newDice);
    numOfKeptDie = keptDie.length;
    rolledDie.splice(rolledDie.indexOf(newDice), 1);

    if (numOfKeptDie == 1) {
        firstKeptDice.append(el);
    }
    if (numOfKeptDie == 2) {
        secondKeptDice.append(el);
    }
    if (numOfKeptDie == 3) {
        thirdKeptDice.append(el);
    }
    if (numOfKeptDie == 4) {
        fourthKeptDice.append(el);
    }
    if (numOfKeptDie == 5) {
        fifthKeptDice.append(el);
    }
}

// returns die to pool
function unkeepDice(dice) {
    keptDie.splice(keptDie.indexOf(dice), 1);
    rolledDie.push(dice);
}

// kept dice accessor
function getSelectedDice() {
    return keptDie;
}


const rowCategories = {
    'Ones': 'ones',
    'Twos': 'twos',
    'Threes': 'threes',
    'Fours': 'fours',
    'Fives': 'fives',
    'Sixes': 'sixes',
    'One pair': 'onepair',
    'Two pairs': 'twopairs',
    'Three of a kind': 'threeofakind',
    'Four of a kind': 'fourofakind',
    'Full House': 'fullhouse',
    'Small straight': 'smallstraight',
    'Large straight': 'largestraight',
    'Chance': 'chance',
    'Yatzy': 'yatzy',
};

// live score preview
function updatePreview() {
    // live preview for current dice
    const allDice = [...rolledDie, ...keptDie];
    $('#score-table tr').each(function () {
        const $cells = $(this).find('td');
        if (!$cells.length) return;
        const category = rowCategories[$cells.eq(0).text().trim()];
        if (!category || game.categoryUsed(category)) return;
        $cells.eq(1).text(calculateScore(category, allDice));
    });
}

// wires category cells
function initScoreTableClicks() {
    $('#score-table tr').each(function () {
        const $cells = $(this).find('td');
        if (!$cells.length) return;
        const category = rowCategories[$cells.eq(0).text().trim()];
        if (!category) return;
        $cells.eq(1).addClass('score-cell').on('click', () => commitScore(category, $(this)));
    });
}

// locks category score
function commitScore(category, $row) {
    if (game.categoryUsed(category)) return; // already scored
    if (!game.hasRolled()) return;
    $('#turn-message').text('');

    const score = calculateScore(category, [...rolledDie, ...keptDie]);
    game.endTurn(category, score);
    $row.find('td').eq(1).text(score).addClass('used');
    $row.css('opacity', 0.50); // marks category as used
    updateTotals();
    // clear previews on unused rows
    $('#score-table tr').each(function () {
        const $cells = $(this).find('td');
        const otherCategory = $cells.length && rowCategories[$cells.eq(0).text().trim()];
        if (otherCategory && !game.categoryUsed(otherCategory)) {
            $cells.eq(1).text('');
        }
    });

    // dice back in pool for new turn
    resetTurnDice();
    if (rollButton) rollButton.prop('disabled', false);

    // game over when all 15 scored
    const totals = game.getTotals();
    if (game.allCategoriesUsed()) {
      const verdict = totals.total >= 200 ? 'Congratulations' : 'Better luck next time';
      $('#board-main-content').html(`<p>Finished! You scored ${totals.total} points. ${verdict}!</p>`);
    }
}

// refreshes sum cells
function updateTotals() {
    const totals = game.getTotals();
    setTotalCell('SUM', totals.upperSum);
    setTotalCell('BONUS', totals.bonus);
    setTotalCell('TOTAL', totals.total);
}

// writes one total
function setTotalCell(label, value) {
    $('#score-table tr').each(function () {
        const $cells = $(this).find('td');
        if ($cells.length && $cells.eq(0).text().trim() === label) {
            $cells.eq(1).text(value);
        }
    });
}

// re-hangs all frames
function resetTurnDice() {
    keptDie.forEach(die => rolledDie.push(die));
    keptDie.length = 0;
    // frames are permanent: re-hang them on the wall (moving removes them from slots)
    rolledDie.forEach(dieObj => {
        $('#dice-roll-render').append(dieObj.$el);
    });
}
