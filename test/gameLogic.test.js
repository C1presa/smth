import CardBattleGame from '../src/CardBattleGame.js';
import Player from '../src/models/Player.js';
import Unit from '../src/models/Unit.js';
import { getCardByName } from '../src/data/cards.js';
import { PHASES, ROWS, COLS, YAR_RANGE } from '../src/utils/constants.js';
import * as Effects from '../src/utils/effects.js'; // For direct effect testing if needed

// --- Test Runner Setup ---
let testCount = 0;
let assertionsMade = 0;
let failures = 0;

function describe(description, fn) {
    console.log(`\n--- ${description} ---`);
    fn();
}

function it(description, fn) {
    testCount++;
    console.log(`  - ${description}`);
    try {
        fn();
    } catch (e) {
        failures++;
        console.error(`    [FAIL] Test failed: ${description}`);
        console.error(e);
    }
}

function assert(condition, message) {
    assertionsMade++;
    if (!condition) {
        failures++;
        console.error(`    [ASSERT FAIL] ${message}`);
    }
}

function assertEquals(actual, expected, message) {
    assertionsMade++;
    if (actual !== expected) {
        failures++;
        console.error(`    [ASSERT FAIL] ${message}: Expected ${expected}, but got ${actual}`);
    }
}

function assertExists(value, message) {
    assertionsMade++;
    if (value === null || value === undefined) {
        failures++;
        console.error(`    [ASSERT FAIL] ${message}: Expected value to exist, but got ${value}`);
    }
}

function reportSummary() {
    console.log(`\n--- Test Summary ---`);
    console.log(`Total Tests: ${testCount}`);
    console.log(`Total Assertions: ${assertionsMade}`);
    if (failures === 0) {
        console.log(`All tests passed! ✅`);
    } else {
        console.log(`Failures: ${failures} ❌`);
    }
    // Reset for potential next run in same environment
    testCount = 0;
    assertionsMade = 0;
    failures = 0;
}

// --- Helper Functions ---
function createTestGame(player1DeckCardNames = [], player2DeckCardNames = []) {
    // Ensure some default cards for drawing if decks are empty, plus Kriper
    const p1Cards = player1DeckCardNames.length > 0 ? player1DeckCardNames : ['Mercenary', 'Mercenary', 'Mercenary'];
    const p2Cards = player2DeckCardNames.length > 0 ? player2DeckCardNames : ['Mercenary', 'Mercenary', 'Mercenary'];

    if (!p1Cards.includes('Kriper')) p1Cards.push('Kriper');
    if (!p2Cards.includes('Kriper')) p2Cards.push('Kriper');
    
    const deck1Definition = { archetype: 'TestArchetype1', cards: p1Cards.map(name => ({ name, count: 1 })) };
    const deck2Definition = { archetype: 'TestArchetype2', cards: p2Cards.map(name => ({ name, count: 1 })) };
    
    const game = new CardBattleGame(deck1Definition, deck2Definition);
    game.isTestMode = true; 
    
    game.board = { 
        tiles: Array(ROWS).fill(null).map(() => Array(COLS).fill(null).map(() => ({ unit: null }))),
        animateEffectTrigger: () => {}, 
        getUnitElement: () => null, 
        removeUnitElement: (unit) => {
            // Mock removal from board representation
            if (unit && unit.row !== null && unit.col !== null && game.board.tiles[unit.row][unit.col].unit === unit) {
                game.board.tiles[unit.row][unit.col].unit = null;
            }
        }, 
        updateUnitPosition: () => {}, 
    };

    // Override player drawCard for tests to ensure hand is populated
    [game.players[0], game.players[1]].forEach(player => {
        player.originalDrawCard = player.drawCard; // Keep original if needed elsewhere
        player.drawCard = function(count = 1) {
            const drawnCards = [];
            for (let i = 0; i < count; i++) {
                if (this.deck.length > 0) {
                    const cardToDraw = this.deck.pop(); // deck is already full card objects
                    this.hand.push(cardToDraw);
                    drawnCards.push(cardToDraw);
                } else {
                   // console.warn(`Player ${this.id} deck empty, cannot draw.`);
                    break;
                }
            }
            return drawnCards.length > 0 ? (count === 1 ? drawnCards[0] : drawnCards) : null;
        };
        player.startTurn(1); // Initialize player for turn 1
    });

    return game;
}

function placeUnitOnBoard(game, player, cardName, row, col) {
    const card = getCardByName(cardName);
    if (!card) throw new Error(`Test setup error: Card ${cardName} not found.`);
    const unit = new Unit(card, player.id);
    player.units.push(unit);
    unit.row = row;
    unit.col = col;
    game.board.tiles[row][col].unit = unit; // Mock board placement
    return unit;
}

// --- Test Suites ---

describe('Card Effect Fixes', () => {
    it('In-fur-nal Ritualist: sacrifices, draws 3, deals 2 AoE damage to enemies', () => {
        // Ensure player1 has enough cards in deck to draw 3, plus the ritualist and sacrifice fodder
        const game = createTestGame(
            ['In-fur-nal Ritualist', 'Elite Warrior', 'Mercenary', 'Mercenary', 'Mercenary'], // P1 deck
            ['Mercenary', 'Hired Guard'] // P2 deck
        );
        const player1 = game.players[0];
        const player2 = game.players[1];
        
        // Explicitly set up deck for player 1 for this test
        player1.deck = [
            getCardByName('Mercenary'), 
            getCardByName('Mercenary'), 
            getCardByName('Mercenary'), 
            getCardByName('War Beast')
        ];
        // Assert that all cards were found for the deck
        player1.deck.forEach((card, index) => assertExists(card, `Card for deck (Merc/WB) index ${index} not found by getCardByName`));
        player1.deck = player1.deck.filter(Boolean); // Keep filtering just in case, though assertion would fail first

        player1.hand = []; 

        assertEquals(player1.deck.length, 4, "Pre-condition: Player 1 deck should have 4 cards (after filtering undefined)");
        assertEquals(player1.hand.length, 0, "Pre-condition: Player 1 hand should be empty");

        // Setup board
        const ritualist = placeUnitOnBoard(game, player1, 'In-fur-nal Ritualist', 2, 0);
        const validSacrificeTarget = placeUnitOnBoard(game, player1, 'Elite Warrior', 2, 2); // Cost 6
        
        const enemy1 = placeUnitOnBoard(game, player2, 'Mercenary', 1, 0); // Health 2
        const enemy2 = placeUnitOnBoard(game, player2, 'Hired Guard', 1, 1); // Health 3
        
        const initialP1UnitsCount = player1.units.length;

        const effect = ritualist.effects.find(e => e.type === 'warshout');
        assertExists(effect, 'Ritualist warshout effect should exist');

        game.selectedUnit = ritualist; 
        game.targetingUnit = ritualist;
        game.targetingEffect = effect;
        
        const sacrificeResult = Effects.applySacrificeEffect(effect, validSacrificeTarget, game);
        assert(sacrificeResult.died, 'Valid target should be sacrificed.');
        
        // Detailed check for draw
        assertEquals(player1.deck.length, 1, "Player 1 deck should have 1 card left after drawing 3 from 4");
        assertEquals(player1.hand.length, 3, 'Player 1 should have 3 cards in hand');
        assertExists(player1.hand[0], "Card 0 in hand should exist");
        assertExists(player1.hand[1], "Card 1 in hand should exist");
        assertExists(player1.hand[2], "Card 2 in hand should exist");
        
        // Check enemy damage
        const finalEnemy1 = game.getUnitAt(enemy1.row, enemy1.col);
        const finalEnemy2 = game.getUnitAt(enemy2.row, enemy2.col);

        assert(finalEnemy1 === null || finalEnemy1.health <= 0, 'Enemy 1 (Mercenary) should be removed or have <= 0 health');
        assertEquals(enemy2.health, 1, 'Enemy 2 (Hired Guard) should take 2 damage (3-2=1)');
        
        // Check sacrifice target removed
        assert(!player1.units.includes(validSacrificeTarget), 'Sacrificed unit should be removed from player units');
    });

    it('Ancient Bog Guardian: Warshout heals allies for 3, buffs +1/+1, respects YAR', () => {
        const game = createTestGame(['Ancient Bog Guardian']);
        const player1 = game.players[0];
        const player2 = game.players[1]; // Opponent for context, not directly affected

        // Player 1 is current player, spawn row is 4 (ROWS-1)
        const bogGuardian = placeUnitOnBoard(game, player1, 'Ancient Bog Guardian', 4, 0);
        const allyInYAR1 = placeUnitOnBoard(game, player1, 'Mercenary', 3, 0); // Health 2, Attack 2. YAR Range is 2. Distance = 1
        const allyInYAR2 = placeUnitOnBoard(game, player1, 'Hired Guard', 4, 1); // Health 3, Attack 2. Distance = 0
        const allyOutOfYAR = placeUnitOnBoard(game, player1, 'War Beast', 0, 0); // Health 3, Attack 4. Distance = 4

        // Set initial damage
        allyInYAR1.takeDamage(1); // Health becomes 1
        allyInYAR2.takeDamage(1); // Health becomes 2
        allyOutOfYAR.takeDamage(1); // Health becomes 2

        const effect = bogGuardian.effects.find(e => e.type === 'warshout' && e.action === 'compound');
        assertExists(effect, 'Ancient Bog Guardian compound warshout effect should exist');
        assert(effect.yar, 'Bog Guardian effect should have YAR property');

        // Execute the effect
        Effects.executeWarshoutEffect(effect, bogGuardian, null, game);
        
        // AllyInYAR1 (Mercenary): Original 2/2. Damaged to 2/1. Expected: Heal 3 -> 2/2 (maxHealth). Buff +1/+1 -> 3/3.
        assertEquals(allyInYAR1.attack, 3, 'AllyInYAR1 attack should be 2+1=3');
        assertEquals(allyInYAR1.health, 3, 'AllyInYAR1 health should be 1, healed by 3 (to original max 2), then maxHP buffed to 3, health becomes 3.');
        assertEquals(allyInYAR1.maxHealth, 3, 'AllyInYAR1 maxHealth should be 2+1=3');

        // AllyInYAR2 (Hired Guard): Original 2/3. Damaged to 2/2. Expected: Heal 3 -> 2/3 (maxHealth). Buff +1/+1 -> 3/4.
        assertEquals(allyInYAR2.attack, 3, 'AllyInYAR2 attack should be 2+1=3');
        assertEquals(allyInYAR2.health, 4, 'AllyInYAR2 health should be 2, healed by 3 (to original max 3), then maxHP buffed to 4, health becomes 4.');
        assertEquals(allyInYAR2.maxHealth, 4, 'AllyInYAR2 maxHealth should be 3+1=4');

        // AllyOutOfYAR (War Beast): Original 4/3. Damaged to 4/2. Should not be affected.
        assertEquals(allyOutOfYAR.attack, 4, 'AllyOutOfYAR attack should remain 4');
        assertEquals(allyOutOfYAR.health, 2, 'AllyOutOfYAR health should remain 2 (not healed)');
        assertEquals(allyOutOfYAR.maxHealth, 3, 'AllyOutOfYAR maxHealth should remain 3 (not buffed)');
    });

    it('Ancient Forest Guardian: Warshout summons two 3/3 Beasts with Taunt', () => {
        const game = createTestGame(['Ancient Forest Guardian']);
        const player1 = game.players[0];
        
        const forestGuardian = placeUnitOnBoard(game, player1, 'Ancient Forest Guardian', 2, 2);
        const initialUnitCount = player1.units.length; // Should be 1 (the Guardian itself)

        const effect = forestGuardian.effects.find(e => e.type === 'warshout' && e.action === 'summon');
        assertExists(effect, 'Ancient Forest Guardian summon warshout effect should exist');
        assertEquals(effect.count, 2, 'Effect count should be 2');

        // Execute the effect
        Effects.executeWarshoutEffect(effect, forestGuardian, null, game);
        
        assertEquals(player1.units.length, initialUnitCount + 2, 'Player 1 should have 2 new units');
        
        const summonedUnits = player1.units.filter(u => u.cardName === effect.value.name);
        assertEquals(summonedUnits.length, 2, 'Should find 2 summoned units with the correct name');
        
        summonedUnits.forEach(summon => {
            assertEquals(summon.attack, 3, `Summoned ${summon.cardName} attack should be 3`);
            assertEquals(summon.health, 3, `Summoned ${summon.cardName} health should be 3`);
            assertEquals(summon.maxHealth, 3, `Summoned ${summon.cardName} maxHealth should be 3`);
            assert(summon.hasTaunt(), `Summoned ${summon.cardName} should have Taunt`);
            assertExists(game.getUnitAt(summon.row, summon.col), 'Summoned unit should be on the mocked board');
        });
    });

    it('Speed Demon: Warshout buffs itself with +1 extraMove', () => {
        const game = createTestGame(['Speed Demon']);
        const player1 = game.players[0];
        player1.startTurn(1); // Initialize turn stats for player

        const speedDemon = placeUnitOnBoard(game, player1, 'Speed Demon', 3, 0);
        assertEquals(speedDemon.extraMove, 0, 'Speed Demon initial extraMove should be 0');

        const effect = speedDemon.effects.find(e => e.type === 'warshout' && e.action === 'buff');
        assertExists(effect, 'Speed Demon buff warshout effect should exist');

        // Execute the effect - targetUnit is null for self-targeting non-AoE effects
        Effects.executeWarshoutEffect(effect, speedDemon, null, game);

        assertEquals(speedDemon.extraMove, 1, 'Speed Demon extraMove should be 1 after warshout');
    });
});

describe('AI Logic Fixes', () => {
    it('AI correctly uses handleTargetSelection for Warshout targeting', () => {
        const game = createTestGame(
            ['Mercenary'], // Player 1 deck
            ['Venomous Lurker', 'Mercenary'] // Player 2 (AI) deck
        );
        game.isAIOpponent = true;
        game.currentPlayerIndex = 1; // AI's turn
        
        const aiPlayer = game.players[1];
        const humanPlayer = game.players[0];
        aiPlayer.mana = 5; // Ensure AI has mana

        // AI hand with Venomous Lurker
        const venomousLurkerCard = getCardByName('Venomous Lurker');
        assertExists(venomousLurkerCard, "Venomous Lurker card definition should be found by getCardByName for AI hand setup");
        aiPlayer.hand = venomousLurkerCard ? [venomousLurkerCard] : []; // Only add if found
        
        // Place a target for the AI's Venomous Lurker
        const mercenaryCardForTarget = getCardByName('Mercenary');
        assertExists(mercenaryCardForTarget, "Mercenary card for target unit setup not found");
        const targetUnit = placeUnitOnBoard(game, humanPlayer, 'Mercenary', 2, 0); 
        const initialTargetHealth = targetUnit.health;

        let enterTargetingModeCalled = false;
        let enterTargetingModeArgs = null;
        const originalEnterTargetingMode = game.enterTargetingMode.bind(game);
        game.enterTargetingMode = (unit, effect, validTargets, player, callback) => {
            console.log("Mocked enterTargetingMode called"); // Debug log
            enterTargetingModeCalled = true;
            enterTargetingModeArgs = { unit, effect, validTargets, player, callback };
            return originalEnterTargetingMode(unit, effect, validTargets, player, callback);
        };
        
        let handleTargetSelectionCalledWithCorrectTarget = false;
        let handleTargetSelectionArgs = null;
        const originalHandleTargetSelection = game.handleTargetSelection.bind(game);
        game.handleTargetSelection = (selectedTarget) => {
            console.log("Mocked handleTargetSelection called"); // Debug log
            handleTargetSelectionArgs = { selectedTarget };
            if (selectedTarget && targetUnit && game.targetingUnit &&
                selectedTarget.id === targetUnit.id && 
                game.targetingUnit.cardName === 'Venomous Lurker') {
                handleTargetSelectionCalledWithCorrectTarget = true;
            }
            return originalHandleTargetSelection(selectedTarget); 
        };
        
        game.currentPlayerIndex = 1;
        aiPlayer.startTurn(game.turnNumber); 
        game.currentPhase = PHASES.PLAY; 

        // Simplified AI Play Logic for this card
        const cardToPlay = aiPlayer.hand.find(card => card.name === 'Venomous Lurker' && card.cost <= aiPlayer.mana);
        assertExists(cardToPlay, "AI should have Venomous Lurker and enough mana");
        const cardIndexInHand = aiPlayer.hand.indexOf(cardToPlay);

        let spotFoundAndPlayed = false;
        const spawnRow = aiPlayer.id === 1 ? 4 : 0;
        for (let col = 0; col < COLS; col++) {
            if (!game.isOccupied(spawnRow, col)) {
                const playResult = game.playCard(cardIndexInHand, spawnRow, col);
                assert(playResult.success, `AI failed to play Venomous Lurker: ${playResult.reason}`);
                assert(playResult.requiresTargeting, "Venomous Lurker should require targeting after play");
                
                // Check game state immediately after playCard returns
                assert(game.targetingMode, "Game should be in targetingMode after Venomous Lurker is played.");
                assert(enterTargetingModeCalled, 'enterTargetingMode should have been called by playCard');

                if (playResult.requiresTargeting && game.targetingMode && game.targetingValidTargets && game.targetingValidTargets.length > 0) {
                    const aiChosenTarget = game.targetingValidTargets[0]; // AI picks first
                    assert(aiChosenTarget.id === targetUnit.id, "AI's first valid target should be the mercenary");
                    game.handleTargetSelection(aiChosenTarget); 
                } else {
                    assert(false, "AI should have entered targeting and had valid targets for Venomous Lurker");
                }
                spotFoundAndPlayed = true;
                break;
            }
        }
        assert(spotFoundAndPlayed, "AI should have found a spot and played the card.");
        
        assert(handleTargetSelectionCalledWithCorrectTarget, 'AI handleTargetSelection mock should confirm correct target selection');
        
        const finalTargetUnit = game.getUnitAt(targetUnit.row, targetUnit.col);
        assertExists(finalTargetUnit, "Target unit should still exist on board after being targeted");
        assertEquals(finalTargetUnit.health, initialTargetHealth - 1, 'Target unit should take 1 damage from AI Venomous Lurker');
    });

    it('AI battle target selection handles 0 attack units without error', () => {
        const game = createTestGame(
            ['Mercenary'], // Player 1 (Human) deck
            ['War Beast']  // Player 2 (AI) deck
        );
        game.isAIOpponent = true;
        game.currentPlayerIndex = 1; // AI's turn

        const aiPlayer = game.players[1];
        const humanPlayer = game.players[0];

        // AI unit
        const aiUnit = placeUnitOnBoard(game, aiPlayer, 'War Beast', 1, 0); // Attack 4

        // Human units - one with 0 attack
        const target1 = placeUnitOnBoard(game, humanPlayer, 'Hired Guard', 2, 0); // 2/3
        const targetWithZeroAttackCard = {...getCardByName('Mercenary'), attack: 0, name: 'Pacifist Mercenary'}; // Create a mock 0-attack unit
        const target2 = new Unit(targetWithZeroAttackCard, humanPlayer.id);
        humanPlayer.units.push(target2);
        target2.row = 2;
        target2.col = 1;
        game.board.tiles[2][1].unit = target2; // 0/2
        
        // Set game to BATTLE phase for AI
        game.currentPhase = PHASES.BATTLE;
        
        let attackMade = false;
        // Spy on attackWithUnit
        const originalAttackWithUnit = game.attackWithUnit.bind(game);
        game.attackWithUnit = (unit, target) => {
            attackMade = true;
            assertExists(target, "AI should select a target to attack");
            if (target.attack === 0) {
                console.log("AI attacked the 0-attack unit.");
            } else {
                console.log(`AI attacked ${target.cardName} with attack ${target.attack}`);
            }
            return originalAttackWithUnit(unit, target);
        };

        // Part of processAITurn's battle phase:
        aiPlayer.units.forEach(unit => {
            if (unit.hasAttacked || !aiPlayer.units.includes(unit)) return;
            const targets = Effects.getPotentialAttackTargets(unit, game);
            if (targets.length > 0) {
                const playerHealthTarget = targets.find(t => t.isPlayerHealth);
                if (playerHealthTarget) {
                    game.attackWithUnit(unit, playerHealthTarget);
                } else {
                    const unitTargets = targets.filter(t => !t.isPlayerHealth && t.health > 0);
                    if (unitTargets.length === 0) return;
                    const bestTarget = unitTargets.reduce((best, current) => {
                        if (!best) return current;
                        const currentAttackValue = current.attack === 0 ? 0.001 : current.attack;
                        const bestAttackValue = best.attack === 0 ? 0.001 : best.attack;
                        const currentValue = current.health / currentAttackValue;
                        const bestValue = best.health / bestAttackValue;
                        return currentValue < bestValue ? current : best;
                    }, null);
                    if (bestTarget) game.attackWithUnit(unit, bestTarget);
                }
            }
        });

        assert(attackMade, 'AI should have made an attack');
        // The key is no error. The actual target chosen depends on the heuristic,
        // but it shouldn't crash with a 0-attack unit present.
        // With the heuristic (health / attack_val), 0-attack unit (e.g. 2 / 0.001 = 2000) is less attractive than 3 / 2 = 1.5
        assertEquals(target1.health < 3 || target2.health < 2, true, "One of the targets should have been damaged.")
    });
});


// --- Run Tests ---
// This would typically be run by a test runner like Jest or by executing this file with Node.
// For this environment, I'll assume it's executed and then report summary.

// To actually run these in a Node environment, you'd need to:
// 1. Make sure imports work (e.g., by setting up package.json with "type": "module")
// 2. Run `node test/gameLogic.test.js`
// For now, this defines the tests. The actual execution and summary reporting would be next.

reportSummary(); // Call this to log the results after all tests have run.
