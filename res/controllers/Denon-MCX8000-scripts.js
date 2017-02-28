////////////////////////////////////////////////////////////////////////
// JSHint configuration                                               //
////////////////////////////////////////////////////////////////////////
/* global engine                                                      */
/* global script                                                      */
/* global print                                                       */
/* global midi                                                        */
/* global nop                                                         */
////////////////////////////////////////////////////////////////////////

////////////////////////////////////////////////////////////////////////
/* MIDI mapping for the Denon MCX8000 dj controller                   */
/* Author: Caelia Chapin <crc@caelia.net>                             */
////////////////////////////////////////////////////////////////////////

var DenonMCX8000 = {
    decks: [],
    leftDeck: null,
    rightDeck: null,
    scratchEnabled: false,
};

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
    this.perfPad = nop;
    this.shiftPerfPad = nop;
    this.scratchEnabled = false;
};

DenonMCX8000.leftDeck = { 'id': null };
DenonMCX8000.rightDeck = { 'id': null };

DenonMCX8000.activateDeck = function(channel, control, value, status, group) {
    if (DenonMCX8000.leftDeck && DenonMCX8000.leftDeck.id === channel) {
        nop();
    } else if (DenonMCX8000.rightDeck && DenonMCX8000.rightDeck.id === channel) {
        nop();
    } else if (channel == DECK1) {
        DenonMCX8000.leftDeck = DenonMCX8000.decks[DECK1];
    } else if (channel == DECK3) {
        DenonMCX8000.leftDeck = DenonMCX8000.decks[DECK3];
    } else if (channel == DECK2) {
        DenonMCX8000.rightDeck = DenonMCX8000.decks[DECK2];
    } else if (channel == DECK4) {
        DenonMCX8000.rightDeck = DenonMCX8000.decks[DECK4];
    } else {
        // Error
    }
};

DenonMCX8000.decks = [];

DenonMCX8000.blinkPadsRGB = function() {
    var turnOff = function() {
        for (var i = 20; i < 28; i++) {
            midi.sendShortMsg(0x94, i, 0x00);
            midi.sendShortMsg(0x95, i, 0x00);
            midi.sendShortMsg(0x96, i, 0x00);
            midi.sendShortMsg(0x97, i, 0x00);
        }
    };
    var showBlue = function() {
        for (var i = 20; i < 28; i++) {
            midi.sendShortMsg(0x94, i, 0x14);
            midi.sendShortMsg(0x95, i, 0x14);
            midi.sendShortMsg(0x96, i, 0x14);
            midi.sendShortMsg(0x97, i, 0x14);
        }
        engine.beginTimer(1000, turnOff, true);
    };
    var showGreen = function() {
        for (var i = 20; i < 28; i++) {
            midi.sendShortMsg(0x94, i, 0x0E);
            midi.sendShortMsg(0x95, i, 0x0E);
            midi.sendShortMsg(0x96, i, 0x0E);
            midi.sendShortMsg(0x97, i, 0x0E);
        }
        engine.beginTimer(1000, showBlue, true);
    };
    for (var i = 20; i < 28; i++) {
        midi.sendShortMsg(0x94, i, 0x21);
        midi.sendShortMsg(0x95, i, 0x21);
        midi.sendShortMsg(0x96, i, 0x21);
        midi.sendShortMsg(0x97, i, 0x21);
    }
    engine.beginTimer(1000, showGreen, true);
}

DenonMCX8000.init = function(id, debugging) {
    DenonMCX8000.blinkPadsRGB();
    DenonMCX8000.shiftPressed = false;
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
    DenonMCX8000.activateDeck(DECK1);
    DenonMCX8000.activateDeck(DECK2);
    DenonMCX8000.decks = decks;
};

DenonMCX8000.shutdown = function() {};


///////////////////////////////////////////////////////////////
//                     MISCELLANEOUS                         //
///////////////////////////////////////////////////////////////

DenonMCX8000.shiftButton = function(channel, control, value, status, group) {
    DenonMCX8000.shiftPressed = (value === 0x7f);
};

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
        // DenonMCX8000.deckSwitchTable[group],
        group,
        'rate',
        ((0x4000 - fullValue) - 0x2000) / 0x2000
    );
};


///////////////////////////////////////////////////////////////
//                       JOG WHEEL                           //
///////////////////////////////////////////////////////////////

DenonMCX8000.vinylButton = function(channel, control, value, status, group) {
    if (value === 0) {
        var enableScratch = !(DenonMCX8000.decks[channel].scratchEnabled);
        DenonMCX8000.decks[channel].scratchEnabled = enableScratch;
        if (enableScratch) {
            midi.sendShortMsg(0x90 + channel, 0x07, 0x02);
        } else {
            midi.sendShortMsg(0x90 + channel, 0x07, 0x01);
        }
    }
};


///////////////////////////////////////////////////////////////
//                 PERFORMANCE PAD HANDLERS                  //
///////////////////////////////////////////////////////////////

DenonMCX8000.padChannel = {
    '[Channel1]': 4,
    '[Channel2]': 5,
    '[Channel3]': 6,
    '[Channel4]': 7,
};

DenonMCX8000.perfPad = function(channel, control, value, status, group) {
    if (group === '[Channel1]' || group === '[Channel3]') {
        DenonMCX8000.leftDeck.perfPad(channel, control, value, status, group);
    } else {
        DenonMCX8000.rightDeck.perfPad(channel, control, value, status, group);
    }
}

DenonMCX8000.shiftPerfPad = function(channel, control, value, status, group) {
    if (group === '[Channel1]' || group === '[Channel3]') {
        DenonMCX8000.leftDeck.shiftPerfPad(channel, control, value, status, group);
    } else {
        DenonMCX8000.rightDeck.shiftPerfPad(channel, control, value, status, group);
    }
}

DenonMCX8000.cuePad = function(channel, control, value, status, group) {
    nop();
};

DenonMCX8000.cueLoopPad = function(channel, control, value, status, group) {
    nop();
};

DenonMCX8000.shiftCuePad = function(channel, control, value, status, group) {
    nop();
};

DenonMCX8000.rollPad = function(channel, control, value, status, group) {
    nop();
};

DenonMCX8000.savedLoopPad = function(channel, control, value, status, group) {
    nop();
};

DenonMCX8000.slicerPad = function(channel, control, value, status, group) {
    nop();
};

DenonMCX8000.slicerLoopPad = function(channel, control, value, status, group) {
    nop();
};

DenonMCX8000.samplerPad = function(channel, control, value, status, group) {
    nop();
};

DenonMCX8000.velocitySamplerPad = function(channel, control, value, status, group) {
    nop();
};

DenonMCX8000.shiftSamplerPad = function(channel, control, value, status, group) {
    nop();
};

DenonMCX8000.deck1PadModeCue = function(channel, control, value, status, group) {
    DenonMCX8000.decks[DECK1].padMode = PM_CUE;
    DenonMCX8000.decks[DECK1].perfPad = DenonMCX8000.cuePad;
    DenonMCX8000.decks[DECK1].shiftPerfPad = DenonMCX8000.cuePad;
    DenonMCX8000.setPadLEDsCue(group);
};

DenonMCX8000.deck1PadModeCueLoop = function(channel, control, value, status, group) {
    DenonMCX8000.decks[DECK1].padMode = PM_CUE_LOOP;
    DenonMCX8000.decks[DECK1].perfPad = DenonMCX8000.cueLoopPad;
    DenonMCX8000.decks[DECK1].shiftPerfPad = DenonMCX8000.cueLoopPad;
    DenonMCX8000.setPadLEDsCue(group);
};

DenonMCX8000.deck1PadModeShiftCue = function(channel, control, value, status, group) {
    DenonMCX8000.decks[DECK1].padMode = PM_SHIFT_CUE;
    DenonMCX8000.decks[DECK1].perfPad = DenonMCX8000.shiftCuePad;
    DenonMCX8000.decks[DECK1].shiftPerfPad = DenonMCX8000.shiftCuePad;
    DenonMCX8000.setPadLEDsCue(group);
};

DenonMCX8000.deck1PadModeRoll = function(channel, control, value, status, group) {
    DenonMCX8000.decks[DECK1].padMode = PM_ROLL;
    DenonMCX8000.decks[DECK1].perfPad = DenonMCX8000.rollPad;
    DenonMCX8000.decks[DECK1].shiftPerfPad = DenonMCX8000.rollPad;
    DenonMCX8000.setPadLEDsRoll(group);
};

DenonMCX8000.deck1PadModeSavedLoop = function(channel, control, value, status, group) {
    DenonMCX8000.decks[DECK1].padMode = PM_SAVED_LOOP;
    DenonMCX8000.decks[DECK1].perfPad = DenonMCX8000.savedLoopPad;
    DenonMCX8000.decks[DECK1].shiftPerfPad = DenonMCX8000.savedLoopPad;
    DenonMCX8000.setPadLEDsRoll(group);
};

DenonMCX8000.deck1PadModeSlicer = function(channel, control, value, status, group) {
    DenonMCX8000.decks[DECK1].padMode = PM_SLICER;
    DenonMCX8000.decks[DECK1].perfPad = DenonMCX8000.slicerPad;
    DenonMCX8000.decks[DECK1].shiftPerfPad = DenonMCX8000.slicerPad;
    DenonMCX8000.setPadLEDsSlicer(group);
};

DenonMCX8000.deck1PadModeSlicerLoop = function(channel, control, value, status, group) {
    DenonMCX8000.decks[DECK1].padMode = PM_SLICER_LOOP;
    DenonMCX8000.decks[DECK1].perfPad = DenonMCX8000.slicerLoopPad;
    DenonMCX8000.decks[DECK1].shiftPerfPad = DenonMCX8000.slicerLoopPad;
    DenonMCX8000.setPadLEDsSlicer(group);
};

DenonMCX8000.deck1PadModeSampler = function(channel, control, value, status, group) {
    DenonMCX8000.decks[DECK1].padMode = PM_SAMPLER;
    DenonMCX8000.decks[DECK1].perfPad = DenonMCX8000.samplerPad;
    DenonMCX8000.decks[DECK1].shiftPerfPad = DenonMCX8000.samplerPad;
    DenonMCX8000.setPadLEDsSampler(group);
};

DenonMCX8000.deck1PadModeVelocitySampler = function(channel, control, value, status, group) {
    DenonMCX8000.decks[DECK1].padMode = PM_VELOCITY_SAMPLER;
    DenonMCX8000.decks[DECK1].perfPad = DenonMCX8000.velocitySamplerPad;
    DenonMCX8000.decks[DECK1].shiftPerfPad = DenonMCX8000.velocitySamplerPad;
    DenonMCX8000.setPadLEDsSampler(group);
};

DenonMCX8000.deck1PadModeShiftSampler = function(channel, control, value, status, group) {
    DenonMCX8000.decks[DECK1].padMode = PM_SHIFT_SAMPLER;
    DenonMCX8000.decks[DECK1].perfPad = DenonMCX8000.shiftSamplerPad;
    DenonMCX8000.decks[DECK1].shiftPerfPad = DenonMCX8000.shiftSamplerPad;
    DenonMCX8000.setPadLEDsSampler(group);
};

DenonMCX8000.deck2PadModeCue = function(channel, control, value, status, group) {
    DenonMCX8000.decks[DECK2].padMode = PM_CUE;
    DenonMCX8000.decks[DECK2].perfPad = DenonMCX8000.cuePad;
    DenonMCX8000.decks[DECK2].shiftPerfPad = DenonMCX8000.cuePad;
    DenonMCX8000.setPadLEDsCue(group);
};

DenonMCX8000.deck2PadModeCueLoop = function(channel, control, value, status, group) {
    DenonMCX8000.decks[DECK2].padMode = PM_CUE_LOOP;
    DenonMCX8000.decks[DECK2].perfPad = DenonMCX8000.cueLoopPad;
    DenonMCX8000.decks[DECK2].shiftPerfPad = DenonMCX8000.cueLoopPad;
    DenonMCX8000.setPadLEDsCue(group);
};

DenonMCX8000.deck2PadModeShiftCue = function(channel, control, value, status, group) {
    DenonMCX8000.decks[DECK2].padMode = PM_SHIFT_CUE;
    DenonMCX8000.decks[DECK2].perfPad = DenonMCX8000.shiftCuePad;
    DenonMCX8000.decks[DECK2].shiftPerfPad = DenonMCX8000.shiftCuePad;
    DenonMCX8000.setPadLEDsCue(group);
};

DenonMCX8000.deck2PadModeRoll = function(channel, control, value, status, group) {
    DenonMCX8000.decks[DECK2].padMode = PM_ROLL;
    DenonMCX8000.decks[DECK2].perfPad = DenonMCX8000.rollPad;
    DenonMCX8000.decks[DECK2].shiftPerfPad = DenonMCX8000.rollPad;
    DenonMCX8000.setPadLEDsRoll(group);
};

DenonMCX8000.deck2PadModeSavedLoop = function(channel, control, value, status, group) {
    DenonMCX8000.decks[DECK2].padMode = PM_SAVED_LOOP;
    DenonMCX8000.decks[DECK2].perfPad = DenonMCX8000.savedLoopPad;
    DenonMCX8000.decks[DECK2].shiftPerfPad = DenonMCX8000.savedLoopPad;
    DenonMCX8000.setPadLEDsRoll(group);
};

DenonMCX8000.deck2PadModeSlicer = function(channel, control, value, status, group) {
    DenonMCX8000.decks[DECK2].padMode = PM_SLICER;
    DenonMCX8000.decks[DECK2].perfPad = DenonMCX8000.slicerPad;
    DenonMCX8000.decks[DECK2].shiftPerfPad = DenonMCX8000.slicerPad;
    DenonMCX8000.setPadLEDsSlicer(group);
};

DenonMCX8000.deck2PadModeSlicerLoop = function(channel, control, value, status, group) {
    DenonMCX8000.decks[DECK2].padMode = PM_SLICER_LOOP;
    DenonMCX8000.decks[DECK2].perfPad = DenonMCX8000.slicerLoopPad;
    DenonMCX8000.decks[DECK2].shiftPerfPad = DenonMCX8000.slicerLoopPad;
    DenonMCX8000.setPadLEDsSlicer(group);
};

DenonMCX8000.deck2PadModeSampler = function(channel, control, value, status, group) {
    DenonMCX8000.decks[DECK2].padMode = PM_SAMPLER;
    DenonMCX8000.decks[DECK2].perfPad = DenonMCX8000.samplerPad;
    DenonMCX8000.decks[DECK2].shiftPerfPad = DenonMCX8000.samplerPad;
    DenonMCX8000.setPadLEDsSampler(group);
};

DenonMCX8000.deck2PadModeVelocitySampler = function(channel, control, value, status, group) {
    DenonMCX8000.decks[DECK2].padMode = PM_VELOCITY_SAMPLER;
    DenonMCX8000.decks[DECK2].perfPad = DenonMCX8000.velocitySamplerPad;
    DenonMCX8000.decks[DECK2].shiftPerfPad = DenonMCX8000.velocitySamplerPad;
    DenonMCX8000.setPadLEDsSampler(group);
};

DenonMCX8000.deck2PadModeShiftSampler = function(channel, control, value, status, group) {
    DenonMCX8000.decks[DECK2].padMode = PM_SHIFT_SAMPLER;
    DenonMCX8000.decks[DECK2].perfPad = DenonMCX8000.shiftSamplerPad;
    DenonMCX8000.decks[DECK2].shiftPerfPad = DenonMCX8000.shiftSamplerPad;
    DenonMCX8000.setPadLEDsSampler(group);
};

DenonMCX8000.deck3PadModeCue = function(channel, control, value, status, group) {
    DenonMCX8000.decks[DECK3].padMode = PM_CUE;
    DenonMCX8000.decks[DECK3].perfPad = DenonMCX8000.cuePad;
    DenonMCX8000.decks[DECK3].shiftPerfPad = DenonMCX8000.cuePad;
    DenonMCX8000.setPadLEDsCue(group);
};

DenonMCX8000.deck3PadModeCueLoop = function(channel, control, value, status, group) {
    DenonMCX8000.decks[DECK3].padMode = PM_CUE_LOOP;
    DenonMCX8000.decks[DECK3].perfPad = DenonMCX8000.cueLoopPad;
    DenonMCX8000.decks[DECK3].shiftPerfPad = DenonMCX8000.cueLoopPad;
    DenonMCX8000.setPadLEDsCue(group);
};

DenonMCX8000.deck3PadModeShiftCue = function(channel, control, value, status, group) {
    DenonMCX8000.decks[DECK3].padMode = PM_SHIFT_CUE;
    DenonMCX8000.decks[DECK3].perfPad = DenonMCX8000.shiftCuePad;
    DenonMCX8000.decks[DECK3].shiftPerfPad = DenonMCX8000.shiftCuePad;
    DenonMCX8000.setPadLEDsCue(group);
};

DenonMCX8000.deck3PadModeRoll = function(channel, control, value, status, group) {
    DenonMCX8000.decks[DECK3].padMode = PM_ROLL;
    DenonMCX8000.decks[DECK3].perfPad = DenonMCX8000.rollPad;
    DenonMCX8000.decks[DECK3].shiftPerfPad = DenonMCX8000.rollPad;
    DenonMCX8000.setPadLEDsRoll(group);
};

DenonMCX8000.deck3PadModeSavedLoop = function(channel, control, value, status, group) {
    DenonMCX8000.decks[DECK3].padMode = PM_SAVED_LOOP;
    DenonMCX8000.decks[DECK3].perfPad = DenonMCX8000.savedLoopPad;
    DenonMCX8000.decks[DECK3].shiftPerfPad = DenonMCX8000.savedLoopPad;
    DenonMCX8000.setPadLEDsRoll(group);
};

DenonMCX8000.deck3PadModeSlicer = function(channel, control, value, status, group) {
    DenonMCX8000.decks[DECK3].padMode = PM_SLICER;
    DenonMCX8000.decks[DECK3].perfPad = DenonMCX8000.slicerPad;
    DenonMCX8000.decks[DECK3].shiftPerfPad = DenonMCX8000.slicerPad;
    DenonMCX8000.setPadLEDsSlicer(group);
};

DenonMCX8000.deck3PadModeSlicerLoop = function(channel, control, value, status, group) {
    DenonMCX8000.decks[DECK3].padMode = PM_SLICER_LOOP;
    DenonMCX8000.decks[DECK3].perfPad = DenonMCX8000.slicerLoopPad;
    DenonMCX8000.decks[DECK3].shiftPerfPad = DenonMCX8000.slicerLoopPad;
    DenonMCX8000.setPadLEDsSlicer(group);
};

DenonMCX8000.deck3PadModeSampler = function(channel, control, value, status, group) {
    DenonMCX8000.decks[DECK3].padMode = PM_SAMPLER;
    DenonMCX8000.decks[DECK3].perfPad = DenonMCX8000.samplerPad;
    DenonMCX8000.decks[DECK3].shiftPerfPad = DenonMCX8000.samplerPad;
    DenonMCX8000.setPadLEDsSampler(group);
};

DenonMCX8000.deck3PadModeVelocitySampler = function(channel, control, value, status, group) {
    DenonMCX8000.decks[DECK3].padMode = PM_VELOCITY_SAMPLER;
    DenonMCX8000.decks[DECK3].perfPad = DenonMCX8000.velocitySamplerPad;
    DenonMCX8000.decks[DECK3].shiftPerfPad = DenonMCX8000.velocitySamplerPad;
    DenonMCX8000.setPadLEDsSampler(group);
};

DenonMCX8000.deck3PadModeShiftSampler = function(channel, control, value, status, group) {
    DenonMCX8000.decks[DECK3].padMode = PM_SHIFT_SAMPLER;
    DenonMCX8000.decks[DECK3].perfPad = DenonMCX8000.shiftSamplerPad;
    DenonMCX8000.decks[DECK3].shiftPerfPad = DenonMCX8000.shiftSamplerPad;
    DenonMCX8000.setPadLEDsSampler(group);
};

DenonMCX8000.deck4PadModeCue = function(channel, control, value, status, group) {
    DenonMCX8000.decks[DECK4].padMode = PM_CUE;
    DenonMCX8000.decks[DECK4].perfPad = DenonMCX8000.cuePad;
    DenonMCX8000.decks[DECK4].shiftPerfPad = DenonMCX8000.cuePad;
    DenonMCX8000.setPadLEDsCue(group);
};

DenonMCX8000.deck4PadModeCueLoop = function(channel, control, value, status, group) {
    DenonMCX8000.decks[DECK4].padMode = PM_CUE_LOOP;
    DenonMCX8000.decks[DECK4].perfPad = DenonMCX8000.cueLoopPad;
    DenonMCX8000.decks[DECK4].shiftPerfPad = DenonMCX8000.cueLoopPad;
    DenonMCX8000.setPadLEDsCue(group);
};

DenonMCX8000.deck4PadModeShiftCue = function(channel, control, value, status, group) {
    DenonMCX8000.decks[DECK4].padMode = PM_SHIFT_CUE;
    DenonMCX8000.decks[DECK4].perfPad = DenonMCX8000.shiftCuePad;
    DenonMCX8000.decks[DECK4].shiftPerfPad = DenonMCX8000.shiftCuePad;
    DenonMCX8000.setPadLEDsCue(group);
};

DenonMCX8000.deck4PadModeRoll = function(channel, control, value, status, group) {
    DenonMCX8000.decks[DECK4].padMode = PM_ROLL;
    DenonMCX8000.decks[DECK4].perfPad = DenonMCX8000.rollPad;
    DenonMCX8000.decks[DECK4].shiftPerfPad = DenonMCX8000.rollPad;
    DenonMCX8000.setPadLEDsRoll(group);
};

DenonMCX8000.deck4PadModeSavedLoop = function(channel, control, value, status, group) {
    DenonMCX8000.decks[DECK4].padMode = PM_SAVED_LOOP;
    DenonMCX8000.decks[DECK4].perfPad = DenonMCX8000.savedLoopPad;
    DenonMCX8000.decks[DECK4].shiftPerfPad = DenonMCX8000.savedLoopPad;
    DenonMCX8000.setPadLEDsRoll(group);
};

DenonMCX8000.deck4PadModeSlicer = function(channel, control, value, status, group) {
    DenonMCX8000.decks[DECK4].padMode = PM_SLICER;
    DenonMCX8000.decks[DECK4].perfPad = DenonMCX8000.slicerPad;
    DenonMCX8000.decks[DECK4].shiftPerfPad = DenonMCX8000.slicerPad;
    DenonMCX8000.setPadLEDsSlicer(group);
};

DenonMCX8000.deck4PadModeSlicerLoop = function(channel, control, value, status, group) {
    DenonMCX8000.decks[DECK4].padMode = PM_SLICER_LOOP;
    DenonMCX8000.decks[DECK4].perfPad = DenonMCX8000.slicerLoopPad;
    DenonMCX8000.decks[DECK4].shiftPerfPad = DenonMCX8000.slicerLoopPad;
    DenonMCX8000.setPadLEDsSlicer(group);
};

DenonMCX8000.deck4PadModeSampler = function(channel, control, value, status, group) {
    DenonMCX8000.decks[DECK4].padMode = PM_SAMPLER;
    DenonMCX8000.decks[DECK4].perfPad = DenonMCX8000.samplerPad;
    DenonMCX8000.decks[DECK4].shiftPerfPad = DenonMCX8000.samplerPad;
    DenonMCX8000.setPadLEDsSampler(group);
};

DenonMCX8000.deck4PadModeVelocitySampler = function(channel, control, value, status, group) {
    DenonMCX8000.decks[DECK4].padMode = PM_VELOCITY_SAMPLER;
    DenonMCX8000.decks[DECK4].perfPad = DenonMCX8000.velocitySamplerPad;
    DenonMCX8000.decks[DECK4].shiftPerfPad = DenonMCX8000.velocitySamplerPad;
    DenonMCX8000.setPadLEDsSampler(group);
};

DenonMCX8000.deck4PadModeShiftSampler = function(channel, control, value, status, group) {
    DenonMCX8000.decks[DECK4].padMode = PM_SHIFT_SAMPLER;
    DenonMCX8000.decks[DECK4].perfPad = DenonMCX8000.shiftSamplerPad;
    DenonMCX8000.decks[DECK4].shiftPerfPad = DenonMCX8000.shiftSamplerPad;
    DenonMCX8000.setPadLEDsSampler(group);
};

DenonMCX8000.setPadLEDsCue = function(group) {
    var status = 0x90 + DenonMCX8000.padChannel[group];
    midi.sendShortMsg(status, 0x14, 0x21);
    midi.sendShortMsg(status, 0x15, 0x35);
    midi.sendShortMsg(status, 0x16, 0x39);
    midi.sendShortMsg(status, 0x17, 0x19);
    midi.sendShortMsg(status, 0x18, 0x20);
    midi.sendShortMsg(status, 0x19, 0x04);
    midi.sendShortMsg(status, 0x1A, 0x13);
    midi.sendShortMsg(status, 0x1B, 0x23);
};

DenonMCX8000.setPadLEDsRoll = function(group) {
    var status = 0x90 + DenonMCX8000.padChannel[group];
    var i;
    for (i = 0; i < 8; i++) {
        midi.sendShortMsg(status, 0x14 + i, 0x1E);
    }
};

DenonMCX8000.setPadLEDsSlicer = function(group) {
    var status = 0x90 + DenonMCX8000.padChannel[group];
    var i;
    for (i = 0; i < 8; i++) {
        midi.sendShortMsg(status, 0x14 + i, 0x14);
    }
};

DenonMCX8000.setPadLEDsSampler = function(group) {
    var status = 0x90 + DenonMCX8000.padChannel[group];
    var i;
    for (i = 0; i < 8; i++) {
        midi.sendShortMsg(status, 0x14 + i, 0x21);
    }
};
