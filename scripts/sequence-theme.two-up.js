/**
 * Theme Name: Two Up
 * Version: 1.0.0
 * Theme URL: http://sequencejs.com/themes/two-up/
 *
 * A full-screen, two column layout for showing a featured image and description
 *
 * This theme is powered by Sequence.js - The
 * responsive CSS animation framework for creating unique sliders,
 * presentations, banners, and other step-based applications.
 *
 * Author: Ian Lunn
 * Author URL: http://ianlunn.co.uk/
 *
 * Theme License: http://sequencejs.com/licenses/#free-theme
 * Sequence.js Licenses: http://sequencejs.com/licenses/
 *
 * Copyright © 2015 Ian Lunn Design Limited unless otherwise stated.
 */

// Get the Sequence element
var sequenceElement = document.getElementById("sequence");

// Place your Sequence options here to override defaults
// See: http://sequencejs.com/documentation/#options
var options = {
    animateCanvas: true,
    phaseThreshold: false,
    preloader: true,
    fadeStepWhenSkipped: false,
    reverseWhenNavigatingBackwards: true,
    reverseTimingFunctionWhenNavigatingBackwards: true,
    swipeEvents: {
        left: function(sequence) {
            sequence.next();
            checkScreen();
        },
        right: function(sequence) {
            sequence.prev();
            checkScreen();
        },
        up: function(sequence) {
            sequence.next();
            checkScreen();
        },
        down: function(sequence) {
            sequence.prev();
            checkScreen();
        }
    },
    fallback: {
        speed: 300
    }
};

var mouseWheel = {

    // Only allow mousewheel navigation every x amount of ms
    quietPeriod: 900,

    // Set this to the same length as the longest transition in Sequence
    animationTime: 300
};

// Launch Sequence on the element, and with the options we specified above
var mySequence = sequence(sequenceElement, options);

var modal = new tingle.modal({
    footer: false,
    stickyFooter: false,
    closeLabel: "Close",
    // cssClass: ['custom-class-1', 'custom-class-2'],
    onOpen: function() {
        // console.log('modal open');
    },
    onClose: function() {
        // console.log('modal closed');
        resetModal();
    },
    beforeClose: function() {
        // here's goes some logic
        // e.g. save content before closing the modal
        return true; // close the modal
        // return false; // nothing happens
    }
});

function resetModal () {
    modal.destroy();

    modal = new tingle.modal({
        footer: false,
        stickyFooter: false,
        closeLabel: "Close",
        // cssClass: ['custom-class-1', 'custom-class-2'],
        onOpen: function() {
            // console.log('modal open');
        },
        onClose: function() {
            resetModal();
            // console.log('modal closed');
        },
        beforeClose: function() {
            // here's goes some logic
            // e.g. save content before closing the modal
            return true; // close the modal
            // return false; // nothing happens
        }
    });
}

function submitForm(token) {
    var form = document.querySelector("form");
    var spinner = new Spinner().spin(form);
    var data = new FormData(form);
    data.append('g-recaptcha-response', token);
    var request = new XMLHttpRequest();
    request.open('POST', 'https://api.richardjeffords.com/siteMailer.php', true);
    request.onload = function () {
        if (request.status >= 400) {
            // We reached our target server, but it returned an error
            ga('send', 'event', {
                'eventCategory': 'contactForm',
                'eventAction': 'submitErrorFromServer'
            });
            modal.setContent("<h2>Error</h2><p>" + request.responseText + "</p>");
        } else {
            // Success!
            // console.log(JSON.stringify(request, null, 4));
            ga('send', 'event', {
                'eventCategory': 'contactForm',
                'eventAction': 'submitSuccess'
            });
            modal.setContent("<h2>Success!</h2><p>" + request.responseText + "</p>");
            form.reset();
        }
        grecaptcha.reset();
        spinner.stop();
        modal.open();
    };
    request.onerror = function () {
        // There was a connection error of some sort
        ga('send', 'event', {
            'eventCategory': 'contactForm',
            'eventAction': 'submitConnectionError'
        });
        grecaptcha.reset();
        spinner.stop();
        modal.setContent("<h2>Error</h2><p>" + request.responseText + "</p>");
        modal.open();
    };
    request.send(data);
}

function cvClicked() {
    ga('send', 'event', {
        'eventCategory': 'cv',
        'eventAction': 'cvOpened'
    });
}

function cv() {
    ga('send', 'event', {
        'eventCategory': 'cv',
        'eventAction': 'modalOpened'
    });
    modal.setContent("<h2>It's Old!</h2><p>Although I am still proud of this CV, I want to note that it is rather outdated. <a href='/cv.pdf' target='_blank' onclick='cvClicked()'>Click here</a> to see it anyways.</p>");
    modal.open();
}

function checkScreen(id) {
    windowWidth = getWindowWidth();
    if (windowWidth > 769) unfixPageHeight();
    else fixPageHeight(id);
}

mySequence.nextPhaseStarted = function(id) {
    windowWidth = getWindowWidth();
    if (windowWidth > 769) unfixPageHeight();
    else fixPageHeight(id);
};

function fixPageHeight(id) {
    // console.log("fixPageHeight");
    try {
        featureHeight = document.getElementById("feature" + id).offsetHeight;
        contentHeight = document.getElementById("content" + id).offsetHeight;
        stepHeight = featureHeight + contentHeight;
        screenHeight = getWindowHeight();
        // console.log("stepHeight: " + stepHeight);
        // console.log("screenHeight: " + screenHeight);

        if (stepHeight > screenHeight) {
            // console.log("stepHeight > screenHeight (" + stepHeight + " > " + screenHeight + ")");
            document.getElementsByClassName("seq-canvas")[0].style.height = String(stepHeight) + "px";
            // console.log("changed height of step" + id + " to " + String(stepHeight) + "px");
        }

        else {
            document.getElementsByClassName("seq-canvas")[0].style.height = "100vh";
            // console.log("changed height of step" + id + " to " + "100vh");
        }
    }
    catch (err) {
        console.log(err);
    }
}

function unfixPageHeight() {
    // console.log("unfixPageHeight");
    document.getElementsByClassName("seq-canvas")[0].style.height = "100%";
}

function getWindowWidth() {
    return window.innerWidth || document.documentElement.clientWidth || document.body.clientWidth;
}

function getWindowHeight() {
    return window.innerHeight || document.documentElement.clientHeight || document.body.clientHeight;
}

// Determine Hammer directions required based on window width
// A window greater than 768 allows up/down/left/right swiping
// A window less than 769 allows left/right swiping
function enableSwiping() {

    if (mySequence.hammerTime === false) {
        return;
    }

    windowWidth = getWindowWidth();

    if (windowWidth > 769) {
        mySequence.hammerTime.get("swipe").set({direction: Hammer.DIRECTION_ALL});
    }
    else {
        mySequence.hammerTime.get("swipe").set({direction: Hammer.DIRECTION_HORIZONTAL});
    }

    return windowWidth;
}

mySequence.ready = function() {

    var windowWidth,
        lastAnimation = 0,
        delta,
        timeNow;

    // Get the windowWidth each time the window is resized
    windowWidth = enableSwiping();
    checkScreen(1);
    mySequence.throttledResize = function() {
        windowWidth = enableSwiping();
        checkScreen(mySequence.currentStepId);
    };

    function scroll(e) {

        // Only allow mousewheel navigation above 769px
        if (windowWidth < 769) {
            return;
        }

        e.preventDefault();

        delta = e.wheelDelta || -e.detail;

        deltaOfInterest = delta;
        timeNow = new Date().getTime();

        // Cancel scroll if currently animating or within quiet period
        if (timeNow - lastAnimation < mouseWheel.quietPeriod + mouseWheel.animationTime) {
            e.preventDefault();
            return;
        }

        if (deltaOfInterest < 0) {
            mySequence.next();
        }
        else {
            mySequence.prev();
        }

        lastAnimation = timeNow;
    }

    function upOne(e) {
        e.preventDefault();
        timeNow = new Date().getTime();

        // Cancel scroll if currently animating or within quiet period
        if (timeNow - lastAnimation < mouseWheel.quietPeriod + mouseWheel.animationTime) {
            return;
        }
        mySequence.prev();

        lastAnimation = timeNow;
    }

    // mySequence.utils.addEvent(document, "mousewheel", scroll);
    // mySequence.utils.addEvent(document, "DOMMouseScroll", scroll);
    mySequence.utils.addEvent(document.getElementById("contact-link"), "click", upOne);
    mySequence.utils.addEvent(document.forms.namedItem("contact-form"), "submit", submitForm);

    // Navigate between steps when certain buttons are pressed
    mySequence.utils.addEvent(document.body, "keyup", function(e) {

        switch(e.keyCode) {

            // If any of the following keys are pressed, go to the next slide:

            // space, right arrow
            // case 32:
            case 39:
            e.preventDefault();
            mySequence.next();
            break;

            // page down, down arrow (Large layout only)
            case 34:
            case 40:
                if (windowWidth > 768) {
                    e.preventDefault();
                    mySequence.next();
                }
                break;

            // If any of the following keys are pressed, go to the previous slide:

            // left arrow
            case 37:
            e.preventDefault();
            mySequence.prev();
            break;

            // page up, up arrow (Large layout only)
            case 33:
            case 38:
                if (windowWidth > 768) {
                    e.preventDefault();
                    mySequence.prev();
                }
                break;
        }
    });
};

window.onload = function () {
    if(window.location.hash === '#about')   mySequence.goTo(2);
    if(window.location.hash === '#contact') mySequence.goTo(3);
};
