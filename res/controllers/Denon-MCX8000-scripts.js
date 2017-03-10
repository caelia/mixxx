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

var DenonMCX8000 = {};

///////////////////////////////////////////////////////////////
//                       USER OPTIONS                        //
///////////////////////////////////////////////////////////////

// Keylock on by default?
DenonMCX8000.keylockOn = true;

// Prevents accidental activation of the touchstrip
// User must press shift in order to active while a track is playing
DenonMCX8000.safeNeedleDrop = true;

// Sets the jogwheel's sensivity. 1 is default, 2 is twice as sensitive, 0.5 is half as sensitive.
DenonMCX8000.jogwheelSensivity = 1.0;

// Sets how much more sensitive the jogwheels get when holding shift.
// Set to 1 to disable jogwheel sensitivity increase when holding shift.
DenonMCX8000.jogwheelShiftMultiplier = 20;

// Colors for performance pad LEDs - see color table below for
// additional color names.
DenonMCX8000.hotCueInactiveColor = 'grey';
DenonMCX8000.hotCueActiveColors = [
    'red', 'orange', 'yellow', 'yellowGreen',
    'paleGreen', 'skyBlue', 'magenta', 'fuchsia'
];
DenonMCX8000.loopInactiveColor = 'dimRed';
DenonMCX8000.loopActiveColor = 'red';
DenonMCX8000.beatJumpInactiveColor = 'yellow';
DenonMCX8000.beatJumpActiveColor = 'yellow';
DenonMCX8000.samplerInactiveColor = 'dimViolet';
DenonMCX8000.samplerActiveColor = 'blue';


///////////////////////////////////////////////////////////////
//                         CONSTANTS                         //
///////////////////////////////////////////////////////////////

// Colors for performance pad LEDs
DenonMCX8000.colors = {
    'none':         0x00,
    'dimViolet':    0x02,
    'blue':         0x03,
    'dimGrass':     0x05,
    'dimMint':      0x06,
    'lightBlue':    0x07,
    'yellowGreen':  0x09,
    'paleGreen':    0x0A,
    'mintGreen':    0x0B,
    'jade':         0x0F, // very similar to mintGreen and iceGreen
    'dimRed':       0x11,
    'dimFuchsia':   0x12,
    'dimGold':      0x15,
    'grey':         0x16,
    'skyBlue':      0x17,
    'red':          0x21,
    'pink':         0x22,
    'fuchsia':      0x23,
    'orange':       0x35,
    'salmon':       0x26,
    'magenta':      0x27,
    'yellow':       0x29,
    'lightGold':    0x2A,
    'white':        0x40,
};


// DenonMCX8000.blinkPadsRGB = function() {
DenonMCX8000.initPads = function() {
    var setPadMode = function() {
        for (var i = 3; i > -1; i--) {
            DenonMCX8000.setPadMode(0, 0x00, 0x00, 0, '[Channel' + (i + 1) + ']');
            midi.sendShortMsg(0x94 + i, 0x00, 0x00);
        }
    };
    var turnOff = function() {
        for (var i = 20; i < 28; i++) {
            midi.sendShortMsg(0x94, i, 0x00);
            midi.sendShortMsg(0x95, i, 0x00);
            midi.sendShortMsg(0x96, i, 0x00);
            midi.sendShortMsg(0x97, i, 0x00);
        }
        engine.beginTimer(333, setPadMode, true);
    };
    var showBlue = function() {
        for (var i = 20; i < 28; i++) {
            midi.sendShortMsg(0x94, i, 0x14);
            midi.sendShortMsg(0x95, i, 0x14);
            midi.sendShortMsg(0x96, i, 0x14);
            midi.sendShortMsg(0x97, i, 0x14);
        }
        engine.beginTimer(667, turnOff, true);
    };
    var showGreen = function() {
        for (var i = 20; i < 28; i++) {
            midi.sendShortMsg(0x94, i, 0x0E);
            midi.sendShortMsg(0x95, i, 0x0E);
            midi.sendShortMsg(0x96, i, 0x0E);
            midi.sendShortMsg(0x97, i, 0x0E);
        }
        engine.beginTimer(667, showBlue, true);
    };
    for (var i = 20; i < 28; i++) {
        midi.sendShortMsg(0x94, i, 0x21);
        midi.sendShortMsg(0x95, i, 0x21);
        midi.sendShortMsg(0x96, i, 0x21);
        midi.sendShortMsg(0x97, i, 0x21);
    }
    engine.beginTimer(667, showGreen, true);
};

DenonMCX8000.hotCueInactiveColorCode = 0x00;
DenonMCX8000.hotCueActiveColorCodes = [];
DenonMCX8000.loopInactiveColorCode = 0x00;
DenonMCX8000.loopActiveColorCode = 0x00;
DenonMCX8000.beatJumpInactiveColorCode = 0x00;
DenonMCX8000.beatJumpActiveColorCode = 0x00;
DenonMCX8000.samplerInactiveColorCode = 0x00;
DenonMCX8000.samplerActiveColorCode = 0x00;

DenonMCX8000.initColors = function() {
    DenonMCX8000.hotCueInactiveColorCode
        = DenonMCX8000.colors[DenonMCX8000.hotCueInactiveColor];
    for (var i = 0; i < 8; i++) {
        DenonMCX8000.hotCueActiveColorCodes[i]
            = DenonMCX8000.colors[DenonMCX8000.hotCueActiveColors[i]];
    }
    DenonMCX8000.loopInactiveColorCode
        = DenonMCX8000.colors[DenonMCX8000.loopInactiveColor];
    DenonMCX8000.loopActiveColorCode
        = DenonMCX8000.colors[DenonMCX8000.loopActiveColor];
    DenonMCX8000.beatJumpInactiveColorCode
        = DenonMCX8000.colors[DenonMCX8000.beatJumpInactiveColor];
    DenonMCX8000.beatJumpActiveColorCode
        = DenonMCX8000.colors[DenonMCX8000.beatJumpActiveColor];
    DenonMCX8000.samplerInactiveColorCode
        = DenonMCX8000.colors[DenonMCX8000.samplerInactiveColor];
    DenonMCX8000.samplerActiveColorCode
        = DenonMCX8000.colors[DenonMCX8000.samplerActiveColor];
};

DenonMCX8000.scratchMode = [false, false, false, false];
DenonMCX8000.scratching = [false, false, false, false];

DenonMCX8000.init = function(id, debugging) {
    DenonMCX8000.shift = false;
    DenonMCX8000.scratchSettings = {
        'alpha': 1.0 / 8,
        'beta': 1.0 / 8 / 32,
        'jogResolution': 800,
        'vinylSpeed': 33 + 1 / 3,
        'safeScratchTimeout': 20
    };
    if (engine.getValue('[Master]', 'num_samplers') < 8) {
        engine.setValue('[Master]', 'num_samplers', 8);
    }
    // Apparently the GUI remembers the previous setting of keylock
    // var initKeylock = DenonMCX8000.keylockOn ? 1 : 0 ;
    for (var i = 0; i < 4; i++) {
        // var group = '[Channel' + (i + 1) + ']';
        // engine.setValue(group, 'keylock', initKeylock);
        DenonMCX8000.setKeylockLED(i);
    }
    DenonMCX8000.inSidebar = false;
    DenonMCX8000.initColors();
    DenonMCX8000.initPads();
    for (var i = 1; i < 5; i++) {
        engine.connectControl('[Channel' + i + ']',
                              'VuMeter',
                              'DenonMCX8000.channelVUMeter');
    }
};

DenonMCX8000.shutdown = function() {};


///////////////////////////////////////////////////////////////
//                      LED SIGNALS                          //
///////////////////////////////////////////////////////////////

DenonMCX8000.setKeylockLED = function(channel) {
    if (engine.getValue('[Channel' + (channel + 1) + ']', 'keylock')) {
        midi.sendShortMsg(0x90 + channel, 0x0D, 0x02);
    } else {
        midi.sendShortMsg(0x90 + channel, 0x0D, 0x01);
    }
};

DenonMCX8000.setSlipButtonLED = function(channel) {
    if (engine.getValue('[Channel' + (channel + 1) + ']', 'slip_enabled')) {
        midi.sendShortMsg(0x90 + channel, 0x0F, 0x02);
    } else {
        midi.sendShortMsg(0x90 + channel, 0x0F, 0x01);
    }
};

DenonMCX8000.setChannelFxLED = function(channel, control, group) {
    if (engine.getValue(group, 'group_[Channel' + (control - 4) + ']_enable')) {
        midi.sendShortMsg(0x90 + channel, control, 0x02);
    } else {
        midi.sendShortMsg(0x90 + channel, control, 0x01);
    }
};

DenonMCX8000.channelVUMeter = function(value, group, control) {
    var midival = Math.round(value * 127);
    var status;
    switch (group) {
        case '[Channel1]':
            status = 0xB0;
            break;
        case '[Channel2]':
            status = 0xB1;
            break;
        case '[Channel3]':
            status = 0xB2;
            break;
        case '[Channel4]':
            status = 0xB3;
            break;
    }
    midi.sendShortMsg(status, 0x1F, midival);
}


///////////////////////////////////////////////////////////////
//                     MISCELLANEOUS                         //
///////////////////////////////////////////////////////////////

DenonMCX8000.togglePFL = function(channel, control, value, status, group) {
    if (!value) {
        var old_pfl = engine.getValue(group, 'pfl');
        var new_pfl = old_pfl ? 0 : 1 ;
        engine.setValue(group, 'pfl', new_pfl);
        midi.sendShortMsg(0x90 + channel, 0x1B, new_pfl);
    }
};

DenonMCX8000.shiftButton = function(channel, control, value, status, group) {
    DenonMCX8000.shift = (value === 0x7f);
};

DenonMCX8000.tapButton = function(channel, control, value, status, group) {
};

// Only needed until v2.1
DenonMCX8000.trackLoaded = function(group) {
    var ts = engine.getValue(group, 'track_samples');
    return (ts > 0);
};

var TestUnit = function(id) {
    var self = this;
    self.id = id;
    self.sillyProcessTimer = 0;
    self.printMessage = function() {
        print("Hello from Test Unit " + self.id);
    };
    self.startSillyProcess = function() {
        self.sillyProcessTimer = engine.beginTimer(1000, self.printMessage);
    };
    self.stopSillyProcess = function() {
        engine.stopTimer(self.sillyProcessTimer);
        self.sillyProcessTimer = 0;
    };
};

DenonMCX8000.testUnit1 = new TestUnit(1);
DenonMCX8000.testUnit2 = new TestUnit(2);

DenonMCX8000.testFunc = function(channel, control, value, status, group) {
    if (value) {
        DenonMCX8000.testUnit1.startSillyProcess();
        DenonMCX8000.testUnit2.startSillyProcess();
    } else {
        DenonMCX8000.testUnit1.stopSillyProcess();
        DenonMCX8000.testUnit2.stopSillyProcess();
    }
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
};

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
//             MISCELLANEOUS TRANSPORT CONTROL               //
///////////////////////////////////////////////////////////////

DenonMCX8000.toggleKeylock = function(channel, control, value, status, group) { 
    if (!value) {
        script.toggleControl(group, 'keylock');
        DenonMCX8000.setKeylockLED(channel);
    }
};

DenonMCX8000.toggleSlipMode = function(channel, control, value, status, group) {
    if (!value) {
        script.toggleControl(group, 'slip_enabled');
        DenonMCX8000.setSlipButtonLED(channel);
    }
};

DenonMCX8000.needleDropMSB = function(channel, control, value, status, group) { 
    DenonMCX8000.highResMSB[group].needleDrop = value;
};

DenonMCX8000.needleDropLSB = function(channel, control, value, status, group) { 
    var playing = DenonMCX8000.trackLoaded(group) && engine.getValue(group, 'play');
    if (!playing || !DenonMCX8000.safeNeedleDrop || DenonMCX8000.shift) {
        var fullValue = (DenonMCX8000.highResMSB[group].needleDrop << 7) + value;
        engine.setValue(group,
                        'playposition',
                        (fullValue / 16383) * 1.14
        );
    }
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
    // Is it better to check the value of 'value' here - to eliminate excessive
    // calls to engine? Or just leave it up to the engine?
    engine.setValue(group, 'hotcue_' + (control - 19) + '_activate', value);
};

DenonMCX8000.cueLoopPad = function(channel, control, value, status, group) {
    engine.setValue(group, 'hotcue_' + (control - 19) + '_set', value);
};

DenonMCX8000.shiftCuePad = function(channel, control, value, status, group) {
    engine.setValue(group, 'hotcue_' + (control - 19) + '_clear', value);
};

DenonMCX8000.activeLoop = {
    '[Channel1]': 0,
    '[Channel2]': 0,
    '[Channel3]': 0,
    '[Channel4]': 0
};

DenonMCX8000.rollPad = function(channel, control, value, status, group) {
    if (value) {
        var beats = (1 << ((control - 0x14) % 8)) / 2;
        if (DenonMCX8000.activeLoop[group] === beats) {
            engine.setValue(group, 'beatloop_' + beats + '_toggle', 1);
            // engine.setValue(group, 'reloop_exit', 0);
            DenonMCX8000.setPadLEDsRoll(group);
            DenonMCX8000.activeLoop[group] = 0;
        } else if (DenonMCX8000.activeLoop[group]) {
            engine.setValue(group, 'beatloop_' + beats + '_activate', value);
            DenonMCX8000.setPadLEDsRoll(group);
            DenonMCX8000.setActiveLoopLED(group, control);
            DenonMCX8000.activeLoop[group] = beats;
        } else {
            engine.setValue(group, 'beatloop_' + beats + '_activate', value);
            DenonMCX8000.setActiveLoopLED(group, control);
            DenonMCX8000.activeLoop[group] = beats;
        }
    }
};

// FIXME: code is mostly redundant w/ rollPad function
DenonMCX8000.savedLoopPad = function(channel, control, value, status, group) {
    if (value) {
        var beats = (1 << ((control - 0x14) % 8)) / 2;
        if (DenonMCX8000.activeLoop[group] === beats) {
            engine.setValue(group, 'beatloop_' + beats + '_toggle', 1);
            DenonMCX8000.setPadLEDsRoll(group);
            DenonMCX8000.activeLoop[group] = 0;
        } else if (DenonMCX8000.activeLoop[group]) {
            engine.setValue(group, 'beatlooproll_' + beats + '_activate', value);
            DenonMCX8000.setPadLEDsRoll(group);
            DenonMCX8000.setActiveLoopLED(group, control);
            DenonMCX8000.activeLoop[group] = beats;
        } else {
            engine.setValue(group, 'beatlooproll_' + beats + '_activate', value);
            DenonMCX8000.setActiveLoopLED(group, control);
            DenonMCX8000.activeLoop[group] = beats;
        }
    }
};

DenonMCX8000.slicerPad = function(channel, control, value, status, group) {
    if (value) {
        var beats = 1 << (control % 4);
        if (control > 0x17) {
            engine.setValue(group, 'beatjump_' + beats + '_backward', value);
        } else {
            engine.setValue(group, 'beatjump_' + beats + '_forward', value);
        }
    }
};

DenonMCX8000.slicerLoopPad = function(channel, control, value, status, group) {
    DenonMCX8000.slicerPad(channel, control, value, status, group);
};

DenonMCX8000.samplerVolume = [null, -1, -1, -1, -1, -1, -1, -1, -1];

DenonMCX8000.loadSampler = function(group, smpNo) {
    engine.setValue('[Sampler' + smpNo + ']', 'LoadSelectedTrack', 1);
    DenonMCX8000.setPadLEDActiveSampler(group, smpNo);
};

DenonMCX8000.samplerPad = function(channel, control, value, status, group) {
    if (value) {
        if (DenonMCX8000.shift) {
            DenonMCX8000.loadSampler(group, control - 0x1B);
        } else {
            var sampler = '[Sampler' + (control - 0x13) + ']';
            engine.setValue(sampler, 'start_play', value);
        }
    }
};

DenonMCX8000.velocitySamplerPad = function(channel, control, value, status, group) {
    if (value) {
        if (DenonMCX8000.shift) {
            DenonMCX8000.loadSampler(group, control - 0x1B);
        } else {
            var smpNo = control - 0x13;
            var sampler = '[Sampler' + smpNo + ']';
            DenonMCX8000.samplerVolume[smpNo] = engine.getValue(sampler, 'pregain');
            engine.setValue(sampler, 'pregain', value / 32);
            engine.setValue(sampler, 'start_play', value);
        }
    }
};

DenonMCX8000.shiftSamplerPad = function(channel, control, value, status, group) {
    DenonMCX8000.samplerPad(channel, control, value, status, group);
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
                for (var i = 1; i < 9; i++) {
                    var vol = DenonMCX8000.samplerVolume[i];
                    if (vol !== -1) {
                        engine.setValue('[Sampler' + i + ']', 'pregain', vol);
                    }
                }
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
        DenonMCX8000.perfPadFunc[group] = padFunc;
        DenonMCX8000.shiftPerfPadFunc[group] = shiftPadFunc;
        ledFunc(group);
    }
};

DenonMCX8000.setPadLEDsCue = function(group) {
    var status = 0x90 + DenonMCX8000.padChannel[group];
    // track_loaded not available until v2.1
    // if (engine.getValue(group, 'track_loaded')) {
    if (DenonMCX8000.trackLoaded(group)) {
        for (var i = 0; i < 8; i++) {
            if (engine.getValue(group, 'hotcue_' + (i + 1) + '_enabled')) {
                midi.sendShortMsg(status, 0x14 + i, 
                                  DenonMCX8000.hotCueActiveColorCodes[i]);
            } else {
                midi.sendShortMsg(status, 0x14 + i,
                                  DenonMCX8000.hotCueInactiveColorCode);
            }
        }
    } else {
        for (var i = 0; i < 8; i++) {
            midi.sendShortMsg(status, 0x14 + i,
                              DenonMCX8000.hotCueInactiveColorCode);
        }
    }
};

DenonMCX8000.setPadLEDsRoll = function(group) {
    var status = 0x90 + DenonMCX8000.padChannel[group];
    for (var i = 0; i < 8; i++) {
        midi.sendShortMsg(status, 0x14 + i,
                          DenonMCX8000.loopInactiveColorCode);
    }
};

DenonMCX8000.setActiveLoopLED = function(group, control) {
    DenonMCX8000.setPadLEDsRoll(group);
    var status = 0x90 + DenonMCX8000.padChannel[group];
    midi.sendShortMsg(status, control,
                      DenonMCX8000.loopActiveColorCode);
};

DenonMCX8000.setPadLEDsSlicer = function(group) {
    var status = 0x90 + DenonMCX8000.padChannel[group];
    for (var i = 0; i < 8; i++) {
        midi.sendShortMsg(status, 0x14 + i,
                          DenonMCX8000.beatJumpActiveColorCode);
    }
};

DenonMCX8000.setPadLEDActiveSampler = function(group, smpNo) {
    print("setPadLEDActiveSampler");
    print("group: " + group);
    print("smpNo: " + smpNo);
    midi.sendShortMsg(0x90 + DenonMCX8000.padChannel[group],
                      0x1B + smpNo,
                      DenonMCX8000.samplerActiveColorCode);
};

DenonMCX8000.setPadLEDsSampler = function(group) {
    var status = 0x90 + DenonMCX8000.padChannel[group];
    var i;
    for (i = 1; i < 9; i++) {
        var active = DenonMCX8000.trackLoaded('[Sampler' + i + ']');
        if (active) {
            midi.sendShortMsg(status, 0x13 + i,
                              DenonMCX8000.samplerActiveColorCode);
        } else {
            midi.sendShortMsg(status, 0x13 + i,
                              DenonMCX8000.samplerInactiveColorCode);
        }
    }
};


///////////////////////////////////////////////////////////////
//                   MIXER & EQ THINGS                       //
///////////////////////////////////////////////////////////////

DenonMCX8000.setCrossfaderCurve = function(channel, control, value, status, group) {
    script.crossfaderCurve(value);
};

DenonMCX8000.setMixOrientation = function(channel, control, value, status, group) {
    var orientation;
    switch (value) {
        case 0:
            orientation = 1;
            break;
        case 1:
            orientation = 0;
            break;
        case 2:
            orientation = 2;
            break;
    }
    engine.setValue(group, 'orientation', orientation);
};


///////////////////////////////////////////////////////////////
//                     EFFECT UNITS                          //
///////////////////////////////////////////////////////////////

/*
DenonMCX8000.FxUnit = function(channel) {
    var status = 0x90 + channel;
    var unit = {};
    unit.setupMode = false;
    unit.setupModeButton = null;
    unit.blinkTimer = 0;
    unit.effects = [];
    unit.blinkOff = function() {
        midi.sendShortMsg(status, unit.setupModeButton, 0x01);  // dim, not off
    };
    unit.blinkOnce = function() {
        midi.sendShortMsg(status, unit.setupModeButton, 0x02);
        engine.beginTimer(800, unit.blinkOff, true);
    };
    unit.blinkOnOff = function(button) {
        unit.setupModeButton = button - 11;
        unit.blinkOnce();
        unit.blinkTimer = engine.beginTimer(1600, unit.blinkOnce);
    };
    unit.stopBlinking = function() {
        engine.stopTimer(unit.blinkTimer);
        unit.blinkTimer = 0;
        unit.setupModeButton = null;
        unit.blinkOff();
    };
    return unit;
}

DenonMCX8000.fx1 = DenonMCX8000.FxUnit(8);
DenonMCX8000.fx2 = DenonMCX8000.FxUnit(9);
*/
DenonMCX8000.FxUnit = function(channel, group) {
    var self = this;    // prevent shadowing
    var status = 0x90 + channel;
    self.setupMode = false;
    self.setupItem = null;
    self.effect = [null, null, null, null];
    self.effectEnabled = [false, false, false];
    self.showNormalMode = function() {
        for (var i = 0; i < 3; i++) {
            if (self.effectEnabled[i]) {
                midi.sendShortMsg(status, i, 0x01);
            } else {
                midi.sendShortMsg(status, i, 0x00);
            }
            midi.sendShortMsg(status, i + 11, 0x00);
        }
    };
    self.showSetupMode = function(control) {
        self.showNormalMode();
        midi.sendShortMsg(status, control - 11, 0x02);
        midi.sendShortMsg(status, control, 0x02);
    };
};

DenonMCX8000.fx1 = new DenonMCX8000.FxUnit(8);
DenonMCX8000.fx2 = new DenonMCX8000.FxUnit(9);

DenonMCX8000.toggleEffect = function(channel, control, value, status, group) {
    if (!value) {
        var unitNo, fxUnit;
        if (status === 0x98) {
            unitNo = 1;
            fxUnit = DenonMCX8000.fx1;
        } else {
            unitNo = 2;
            fxUnit = DenonMCX8000.fx2 ;
        }
        var effectNo = control < 3 ? control + 1 : control - 10;
        var gid = '[EffectRack1_EffectUnit' + unitNo + 'Effect' + effectNo + ']';
        fxUnit.setupMode = false;
        fxUnit.setupItem = null;
        script.toggleControl(gid, 'enabled');
        fxUnit.effectEnabled[control] = !fxUnit.effectEnabled[control];
        fxUnit.showNormalMode();
    }
};

DenonMCX8000.enterEffectSetupMode = function(channel, control, value, status, group) {
    if (!value) {
        var fxUnit = status === 0x98 ? DenonMCX8000.fx1 : DenonMCX8000.fx2 ;
        fxUnit.setupMode = true;
        fxUnit.setupItem = control;
        fxUnit.showSetupMode(control);
        // Not sure this is the right place to do this, but the assumption
        // is that if you set up an effect unit you want to use it.
        engine.setValue(group, 'enabled', 1);
    }
};

DenonMCX8000.adjustEffect = function(channel, control, value, status, group) {
    var unitNo, fxUnit;
    if (status === 0x98) {
        unitNo = 1;
        fxUnit = DenonMCX8000.fx1;
    } else {
        unitNo = 2;
        fxUnit = DenonMCX8000.fx2;
    }
    if (fxUnit.setupMode) {
        var item = fxUnit.setupItem;
        var effectNo = item < 3 ? item + 1 : item - 10;
        var paramNo = control < 3 ? control + 1 : control - 7;
        var gid = '[EffectRack1_EffectUnit' + unitNo + '_Effect' + effectNo + ']';
        if (paramNo <= engine.getValue(gid, 'num_parameters')) {
            engine.setParameter(gid, 'parameter' + paramNo, value / 127);
        }
    }
};

DenonMCX8000.beatsKnob = function(channel, control, value, status, group) {
    var unitNo = status === 0x98 ? 1 : 2;
    var fxUnit = unitNo === 1 ? DenonMCX8000.fx1 : DenonMCX8000.fx2 ;
    var increment = (64 - value) / 63;
    var gid;
    if (fxUnit.setupMode) {
        var item = fxUnit.setupItem;
        var effectNo = item < 3 ? item + 1 : item - 10;
        gid = '[EffectRack1_EffectUnit' + unitNo + '_Effect' + effectNo + ']';
        engine.setValue(gid, 'effect_selector', increment); 
    } else {
        gid = '[EffectRack1_EffectUnit' + unitNo + ']'; 
        if (DenonMCX8000.shift) {
            increment = increment * 10;
        }
        var newval = engine.getValue(gid, 'mix') + (increment / 128);
        engine.setValue(gid, 'mix', Math.max(0.0, Math.min(1.0, newval)));
    }
};

DenonMCX8000.applyFx = function(channel, control, value, status, group) {
    if (!value) {
        var key = 'group_[Channel' + (control - 4) + ']_enable';
        script.toggleControl(group, key); 
        DenonMCX8000.setChannelFxLED(channel, control, group);
    }
};

///////////////////////////////////////////////////////////////
//                   LIBRARY FUNCTIONS                       //
///////////////////////////////////////////////////////////////

DenonMCX8000.moveVertical = function(channel, control, value, status, group) {
    var distance = (value === 0x7F) ? -1 : 1;
    if (DenonMCX8000.inSidebar) {
        engine.setValue('[Playlist]', 'SelectPlaylist', distance);
    } else {
        engine.setValue('[Playlist]', 'SelectTrackKnob', distance);
    }
};

DenonMCX8000.scrollTracks = function(channel, control, value, status, group) {
    var distance;
    if (value === 0x7F) {
        distance = -10;
    } else {
        distance = 10;
    }
    engine.setValue('[Playlist]', 'SelectTrackKnob', distance);
};

DenonMCX8000.activateSidebar = function(channel, control, value, status, group) {
    DenonMCX8000.inSidebar = true;
};

DenonMCX8000.activateTrackList = function(channel, control, value, status, group) {
    DenonMCX8000.inSidebar = false;
};
