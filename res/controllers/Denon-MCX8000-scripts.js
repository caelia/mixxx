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

var nop = function(a, b, c, d, e) {};

var DenonMCX8000 = {
    decks: [],
    leftDeck: null,
    rightDeck: null,
    scratchMode: [false, false, false, false],
    scratching: [false, false, false, false],
};

///////////////////////////////////////////////////////////////
//                       USER OPTIONS                        //
///////////////////////////////////////////////////////////////

// Sets the jogwheels sensivity. 1 is default, 2 is twice as sensitive, 0.5 is half as sensitive.
DenonMCX8000.jogwheelSensivity = 1.0;

// Sets how much more sensitive the jogwheels get when holding shift.
// Set to 1 to disable jogwheel sensitivity increase when holding shift.
DenonMCX8000.jogwheelShiftMultiplier = 20;

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
    this.scratchMode = false;
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

// DenonMCX8000.decks = [];

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
    DenonMCX8000.shift = false;
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
    DenonMCX8000.scratchSettings = {
        'alpha': 1.0 / 8,
        'beta': 1.0 / 8 / 32,
        'jogResolution': 800,
        'vinylSpeed': 33 + 1 / 3,
        'safeScratchTimeout': 20
    };
};

DenonMCX8000.shutdown = function() {};


///////////////////////////////////////////////////////////////
//                     MISCELLANEOUS                         //
///////////////////////////////////////////////////////////////

DenonMCX8000.shiftButton = function(channel, control, value, status, group) {
    DenonMCX8000.shift = (value === 0x7f);
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
//                JOGWHEELS FROM JOGJAKARTA                  //
///////////////////////////////////////////////////////////////

DenonMCX8000.vinylButton = function(channel, control, value, status, group) {
    if (value === 0) {
        var enableScratch = !(DenonMCX8000.scratchMode[channel]);
        DenonMCX8000.scratchMode[channel] = enableScratch;
        if (enableScratch) {
            midi.sendShortMsg(0x90 + channel, 0x07, 0x02);
        } else {
            midi.sendShortMsg(0x90 + channel, 0x07, 0x01);
        }
    }
};

DenonMCX8000.getJogWheelDelta = function(value) {
    if (value < 64) {
        return value;
    } else {
        return value - 128;
    }
};

DenonMCX8000.jogTouch = function(channel, control, value, status, group) {
    if (DenonMCX8000.scratchMode[channel]) {
        if (value) {
            engine.scratchEnable(
                channel + 1,
                DenonMCX8000.scratchSettings.jogResolution,
                DenonMCX8000.scratchSettings.vinylSpeed,
                DenonMCX8000.scratchSettings.alpha,
                DenonMCX8000.scratchSettings.beta,
                true
            );
            DenonMCX8000.scratching[channel] = true;
        } else {
            engine.scratchDisable(channel + 1, true);
            DenonMCX8000.scratching[channel] = false;
        }
    }
};

DenonMCX8000.jogTick = function(channel, control, value, status, group) {
    if (DenonMCX8000.scratching[channel]) {
        engine.scratchTick(channel + 1, DenonMCX8000.getJogWheelDelta(value));
    } else if (DenonMCX8000.shift) {
        DenonMCX8000.pitchBendFromJog(
            channel,
            DenonMCX8000.getJogWheelDelta(value) * DenonMCX8000.jogwheelShiftMultiplier
        );
    } else {
        DenonMCX8000.pitchBendFromJog(channel, DenonMCX8000.getJogWheelDelta(value));
    }
}

/*
DenonMCX8000.toggleScratch = function(channel, control, value, status, group) {
    var deck = DenonMCX8000.channelGroups[group];
    if (value) {
        DenonMCX8000.scratchMode[deck] = !DenonMCX8000.scratchMode[deck];
        DenonMCX8000.triggerVinylLed(deck);
        if (!DenonMCX8000.scratchMode[deck]) {
            engine.scratchDisable(deck + 1, true);
        }
    }
};
*/

/*
DenonMCX8000.triggerVinylLed = function(deck) {
    var led = (DenonMCX8000.invertVinylSlipButton ? DenonMCX8000.nonPadLeds.shiftVinyl : DenonMCX8000.nonPadLeds.vinyl);

    DenonMCX8000.nonPadLedControl(deck, led, DenonMCX8000.scratchMode[deck]);
};
*/

DenonMCX8000.pitchBendFromJog = function(channel, movement) {
    var group = '[Channel' + (channel + 1) + ']';

    engine.setValue(group, 'jog', movement / 5 * DenonMCX8000.jogwheelSensivity);
};


///////////////////////////////////////////////////////////////
//                PERFORMANCE PAD HANDLERS                   //
///////////////////////////////////////////////////////////////

DenonMCX8000.padChannel = {
    '[Channel1]': 4,
    '[Channel2]': 5,
    '[Channel3]': 6,
    '[Channel4]': 7,
};

var testPad = function(a, b, c, d, e) {
    print("PAD");
};

var testShiftPad = function(a, b, c, d, e) {
    print("SHIFT_PAD");
};

DenonMCX8000.padMode = {
    '[Channel1]': PM_CUE,
    '[Channel2]': PM_CUE,
    '[Channel3]': PM_CUE,
    '[Channel4]': PM_CUE,
};

DenonMCX8000.perfPadFunc = {
    '[Channel1]': testPad,
    '[Channel2]': testPad,
    '[Channel3]': testPad,
    '[Channel4]': testPad,
};

DenonMCX8000.shiftPerfPadFunc = {
    '[Channel1]': testShiftPad,
    '[Channel2]': testShiftPad,
    '[Channel3]': testShiftPad,
    '[Channel4]': testShiftPad,
};

DenonMCX8000.perfPad = function(channel, control, value, status, group) {
    DenonMCX8000.perfPadFunc[group](channel, control, value, status, group);
};

DenonMCX8000.shiftPerfPad = function(channel, control, value, status, group) {
    DenonMCX8000.shiftPerfPadFunc[group](channel, control, value, status, group);
};

DenonMCX8000.cuePad = function(channel, control, value, status, group) {
    if (value === 0x00) {
        var hotcue_idx = control - 19;
        engine.setValue(group, 'hotcue_' + hotcue_idx + '_activate', 0);
    }
};

DenonMCX8000.cueLoopPad = function(channel, control, value, status, group) {
    if (value === 0x00) {
        var hotcue_idx = control - 19;
        engine.setValue(group, 'hotcue_' + hotcue_idx + '_set', 0);
    }
};

DenonMCX8000.shiftCuePad = function(channel, control, value, status, group) {
    if (value === 0x00) {
        var hotcue_idx = control - 19;
        engine.setValue(group, 'hotcue_' + hotcue_idx + '_clear', 0);
    }
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

DenonMCX8000.setPadMode = function(channel, control, value, status, group) {
    if (value === 0x00) {
        var padFunc, shiftPadFunc, ledFunc;
        switch (control) {
            case 0x00:
                padFunc = DenonMCX8000.cuePad;
                shiftPadFunc = DenonMCX8000.cuePad;
                ledFunc = DenonMCX8000.setPadLEDsCue;
                break;
            case 0x03:
                padFunc = DenonMCX8000.cueLoopPad;
                shiftPadFunc = DenonMCX8000.cueLoopPad;
                ledFunc = DenonMCX8000.setPadLEDsCue;
                break;
            case 0x02:
                padFunc = DenonMCX8000.shiftCuePad;
                shiftPadFunc = DenonMCX8000.shiftCuePad;
                ledFunc = DenonMCX8000.setPadLEDsCue;
                break;
            case 0x07:
                padFunc = DenonMCX8000.rollPad;
                shiftPadFunc = DenonMCX8000.rollPad;
                ledFunc = DenonMCX8000.setPadLEDsRoll;
                break;
            case 0x0D:
                padFunc = DenonMCX8000.savedLoopPad;
                shiftPadFunc = DenonMCX8000.savedLoopPad;
                ledFunc = DenonMCX8000.setPadLEDsRoll;
                break;
            case 0x09:
                padFunc = DenonMCX8000.slicerPad;
                shiftPadFunc = DenonMCX8000.slicerPad;
                ledFunc = DenonMCX8000.setPadLEDsSlicer;
                break;
            case 0x0A:
                padFunc = DenonMCX8000.slicerLoopPad;
                shiftPadFunc = DenonMCX8000.slicerLoopPad;
                ledFunc = DenonMCX8000.setPadLEDsSlicer;
                break;
            case 0x0B:
                padFunc = DenonMCX8000.samplerPad;
                shiftPadFunc = DenonMCX8000.samplerPad;
                ledFunc = DenonMCX8000.setPadLEDsSampler;
                break;
            case 0x0C:
                padFunc = DenonMCX8000.velocitySamplerPad;
                shiftPadFunc = DenonMCX8000.velocitySamplerPad;
                ledFunc = DenonMCX8000.setPadLEDsSampler;
                break;
            case 0x0F:
                padFunc = DenonMCX8000.shiftSamplerPad;
                shiftPadFunc = DenonMCX8000.shiftSamplerPad;
                ledFunc = DenonMCX8000.setPadLEDsSampler;
                break;
        }
        /*
        DenonMCX8000.decks[DECK1].padMode = PM_CUE;
        */
        DenonMCX8000.perfPadFunc[group] = padFunc;
        DenonMCX8000.shiftPerfPadFunc[group] = shiftPadFunc;
        ledFunc(group);
    }
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
