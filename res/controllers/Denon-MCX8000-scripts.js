////////////////////////////////////////////////////////////////////////
// JSHint configuration                                               //
////////////////////////////////////////////////////////////////////////
/* global engine                                                      */
/* global script                                                      */
/* global print                                                       */
/* global midi                                                        */
////////////////////////////////////////////////////////////////////////

////////////////////////////////////////////////////////////////////////
/* MIDI mapping for the Denon MCX8000 dj controller                   */
/* Author: Caelia Chapin <crc@caelia.net>                             */
////////////////////////////////////////////////////////////////////////

var DenonMCX8000 = {};

const DECK1 = 0;
const DECK2 = 1;
const DECK3 = 2;
const DECK4 = 3;

const LEFT = 0;
const RIGHT = 1;

var Deck = function(id) {
    this.id = id;
}

var ControlSet = function(controller, side) {
    this.side = side;
    this.activateDeck = function(channel, control, value, status, group) {
        if (channel === DECK1 && side === LEFT) {
            this.activeDeck = controller.decks[DECK1];
        } else if (channel === DECK3 && side === LEFT) {
            this.activeDeck = controller.decks[DECK3];
        } else if (channel === DECK2 && side === RIGHT) {
            this.activeDeck = controller.decks[DECK2];
        } else if (channel === DECK4 && side === RIGHT) {
            this.activeDeck = controller.decks[DECK4];
        } else {
            // Error
        }
    }
}

DenonMCX8000.decks = [];


DenonMCX8000.init = function(id, debugging) {
    this.shiftPressed = false;
    var decks = [
        new Deck(DECK1),
        new Deck(DECK2),
        new Deck(DECK3),
        new Deck(DECK4)
    ];
    this.leftSide = new ControlSet(this, LEFT);
    this.rightSide = new ControlSet(this, RIGHT);
    this.decks = decks;
}

DenonMCX8000.shutdown = function() {}
