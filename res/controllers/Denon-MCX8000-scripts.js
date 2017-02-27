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

// Pad modes
const PM_CUE = 0;
const PM_CUE_LOOP = 1;
const PM_SHIFT_CUE = 2;
const PM_ROLL = 3;
const PM_SAVED_LOOP = 4;
const PM_SLICER = 5;
const PM_SLICER_LOOP = 6;
const PM_SAMPLER = 7;
const PM_VELOCITY_SAMPLER = 8;
const PM_SHIFT_SAMPLER = 9;


var Deck = function(id) {
    this.id = id;
    this.padMode = null;
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
    var i;
    for (i = 0; i < 4; i++) {
        decks[i].padMode = PM_CUE;
    }
    this.leftSide = new ControlSet(this, LEFT);
    this.rightSide = new ControlSet(this, RIGHT);
    this.leftSide.activateDeck(DECK1);
    this.rightSide.activateDeck(DECK2);
    this.decks = decks;
}

DenonMCX8000.shutdown = function() {}


///////////////////////////////////////////////////////////////
//                     MISCELLANEOUS                         //
///////////////////////////////////////////////////////////////

DenonMCX8000.shiftButton = function(channel, control, value, status, group) {
    DenonMCX8000.shiftPressed = (value === 0x7f);
}

// DANGER!! Cutted & pasted from DDJ-SB2 script.

///////////////////////////////////////////////////////////////
//            HIGH RESOLUTION MIDI INPUT HANDLERS            //
///////////////////////////////////////////////////////////////

DenonMCX8000.highResMSB = {
    '[Channel1]': {},
    '[Channel2]': {},
    '[Channel3]': {},
    '[Channel4]': {}
};

DenonMCX8000.tempoSliderMSB = function(channel, control, value, status, group) {
    DenonMCX8000.highResMSB[group].tempoSlider = value;
};

DenonMCX8000.tempoSliderLSB = function(channel, control, value, status, group) {
    var fullValue = (DenonMCX8000.highResMSB[group].tempoSlider << 7) + value;
    engine.setValue(
        DenonMCX8000.deckSwitchTable[group],
        'rate',
        ((0x4000 - fullValue) - 0x2000) / 0x2000
    );
};


///////////////////////////////////////////////////////////////
//                 PERFORMANCE PAD HANDLERS                  //
///////////////////////////////////////////////////////////////

DenonMCX8000.perfPad = function(channel, control, value, status, group) {
}

DenonMCX8000.perfPadShift = function(channel, control, value, status, group) {
}
