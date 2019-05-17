$(document).ready(function() {
  // Variables holding the required DOM elements
  var pianoArea = $("#piano-box");
  var scoreDiv = $("#score");
  var startChallButton = $("#start-challenge-button");
  var startDemoButton = $("#start-demo-button");
  var whiteKeys = $("div.piano-key");
  var blackKeys = $("div.piano-key-black");

  // These two arrays map the keyboard keys to the columns in the css grid
  var keyCodeArray = ["81", "87", "69", "82", "84", "89", "85", "73", "79",
    "80", "219", "221", "220", "222", "50", "51", "53", "54", "55", "57",
    "48", "61", "8", "59"];
  var columnKeyArray = ["1/4", "4/7", "7/10", "10/13", "13/16", "16/19", 
    "19/22", "22/25", "25/28", "28/31", "31/34", "34/37", "37/40", "40/43",
    "3/5", "6/8", "12/14", "15/17", "18/20", "24/26", "27/29", "33/35",
    "36/38", "39/41"];
  
  // Creating variables used in logic
  var currColumn = 1;
  var topPosition = 0;
  var demoFlag = false;
  var challengeFlag = false;
  var totalScore;
  var missedCount;

  // Mutation Observer to check when elements are being removed from the DOM
  // Used for reference: https://stackoverflow.com/questions/20156453/how-to-detect-element-being-added-removed-from-dom-element
  var pianoBoxMutObs = new MutationObserver(function (mutationList) {
    if (mutationList[0].removedNodes.length === 1) {
      var lastKeyAttr = $(mutationList[0].removedNodes[0])
        .attr("data-last-key");
      if (lastKeyAttr === "true") {
        if (demoFlag) {
          demoFlag = false;
          whiteKeys.click(whiteKeyClick);
          blackKeys.click(blackKeyClick);
          whiteKeys.keypress(checkForEnter);
          blackKeys.keypress(checkForEnter);
        }
        challengeEnd();
      }
    }
  });

  // When a white piano key is clicked play the press animation and run the 
  // function that plays the sound file
  function whiteKeyClick() {
    $(this).addClass("white-key-pressed");
    setTimeout(classRemover, 200, this, "white-key-pressed");
    playPianoNote($(this).attr("data-keycode"));
  }

  // When a black piano key is clicked play the press animation and run the 
  // function that plays the sound file
  function blackKeyClick() {
    $(this).addClass("black-key-pressed");
    setTimeout(classRemover, 200, this, "black-key-pressed");
    playPianoNote($(this).attr("data-keycode"));
  }

  // Function that removes the the class 'classToRemove' from the element
  // 'elementToRemove'
  function classRemover(elementToRemove, classToRemove) {
    $(elementToRemove).removeClass(classToRemove);
  }

  // Function that runs when a button on the keyboard is pressed. If the button
  // is attached to a piano key ovveride the default shortcut and call the
  // click function for that piano key 
  function pianoKeyPressed(e){
    eKeyCode = e.keyCode;
    
    var keyDivElement = $("div[data-keycode=\"" + eKeyCode + "\"]");

    if(keyDivElement.length === 0) {
      return;
    }

    e.preventDefault();
    keyDivElement.click();
  }

  // Plays the sound associated to the key specified by keyCode
  // If a challenge is happening then calculate scores as well and
  // compare timing of the press with the nearest challenge key.
  // If a demo is running then we do not calculate scores or compare timing.
  function playPianoNote(keyCode) {
    var keyAudioFile = $("audio[data-keycode=\"" + keyCode + "\"]");

    keyAudioFile[0].currentTime = 0;
    keyAudioFile[0].play();

    if (challengeFlag === true){
      var challengeKey = $("div.challenge-note")[0];
      if (demoFlag) {
        totalScore = "N/A";
        missedCount = "N/A";
        $(challengeKey).addClass("demo");
        setTimeout(removeChallengeKey, 250, challengeKey);
      }
      else if ($(challengeKey).position().top - topPosition >= 
          whiteKeys.position().top - 25
        && $(challengeKey).attr("data-keycode") === keyCode) {
        totalScore += 100;
        $(challengeKey).addClass("succeed");
        setTimeout(removeChallengeKey, 250, challengeKey);
      }
      else {
        totalScore -= 100;
        missedCount += 1;
        $(challengeKey).addClass("failed");
        setTimeout(removeChallengeKey, 250, challengeKey);
      }
      scoreDiv[0].innerHTML = "Score: " + totalScore + 
        " Missed: " + missedCount;
    }
  }

  // Function to remove a challengeKey from the DOM
  function removeChallengeKey(challengeKey) {
    pianoArea[0].removeChild(challengeKey);
  }

  // Function that runs when the start challenge button is clicked
  function startChallenge() {
    challengeFlag = true;
    // Disable the buttons from being clicked
    startChallButton.off("click");
    startChallButton.addClass("disabled");
    startDemoButton.off("click");
    startDemoButton.addClass("disabled");
    totalScore = 0;
    missedCount = 0;
    scoreDiv[0].innerHTML = "Score: " + totalScore + " Missed: " + missedCount;
    // Key sequence according to challenge song represented by their keyboard
    // codes. Song used for reference: https://www.youtube.com/watch?v=h7bAQufT_Mg
    var challengeArray = ["87", "69", "82", "89", "84", "89", "81", "87",
      "69", "82", "69", "84", "89", "84", "82", "82", "82", "82", "89",
      "89", "84", "82", "89", "89", "89", "84", "89", "84", "82", "82",
      "82", "82", "89", "89", "84", "82", "89", "89", "89", "57", "57",
      "57", "82", "82", "82", "89", "89", "84", "82", "55", "55", "55",
      "84", "73", "89", "57", "79"];
    var delayAmount = 1000;
    var delayIncrement;

    // If demo is happening, the keys cannot be pressed
    if (demoFlag) {
      whiteKeys.off("click");
      blackKeys.off("click");
    }
    // Piano area will expand to give room for challenge keys
    else {
      pianoArea.addClass("challenge");
      whiteKeys.addClass("challenge");
      blackKeys.addClass("challenge");
    }
    window.location.hash = "#piano-box";

    // Calculate the appropriate delay for the notes in the challenge song
    for (let i = 0; i < challengeArray.length; i++){
      if (i === challengeArray.length - 1) {
        setTimeout(createChallengeKey, delayAmount, challengeArray[i], true);
      }
      else {
        setTimeout(createChallengeKey, delayAmount, challengeArray[i], false);
      }
      if (i === 2 || i === 6 || i === 14 || i === 21 || i === 28 || 
        i === 35 || i === 38 || i === 41 || i === 48 || i >= 52) {
        delayIncrement = 1000;
      }
      else if (i < 15) {
        delayIncrement = 700;
      }
      else {
        delayIncrement = 500;
      }
      delayAmount += delayIncrement;
    }
  }

  // Function for creating a challenge key at the location specified by
  // the keyboard shortcut keyCode
  function createChallengeKey(keyCode, endChallengeFlag) {
    var challengeNote = document.createElement("div");
    $(challengeNote).addClass("challenge-note");

    arrayIndex = keyCodeArray.indexOf(keyCode);
    $(challengeNote).css("grid-column", columnKeyArray[arrayIndex]);
    $(challengeNote).attr("data-keycode", keyCode);
    pianoArea[0].appendChild(challengeNote);
    $(challengeNote).addClass("slide-down");
    topPosition = $(challengeNote).position().top;
    if (endChallengeFlag) {
      $(challengeNote).attr("data-last-key", "true");
    }

    if (demoFlag) {
      challengeNote.addEventListener("animationend", 
        playPianoNote(keyCode));
    }
    else {
      challengeNote.addEventListener("animationend", noteEnd);
    }
  }

  // Function that runs when the challenge key expires, user failed to hit
  // the key in time
  function noteEnd() {
    totalScore -= 100;
    missedCount++;
    scoreDiv[0].innerHTML = "Score: " + totalScore + " Missed: " + missedCount;
    $(this).addClass("failed");
    setTimeout(removeChallengeKey, 250, this);
  }

  // Function that runs when the challenge is over, re-enable buttons and
  // return the piano area to normal size
  function challengeEnd() {
    $(pianoArea).removeClass("challenge");
    $(whiteKeys).removeClass("challenge");
    $(blackKeys).removeClass("challenge");
    startChallButton.click(startChallenge);
    startChallButton.removeClass("disabled");
    startDemoButton.click(startDemo);
    startDemoButton.removeClass("disabled");
  }

  // Function that runs when the start demo button is clicked
  function startDemo() {
    demoFlag = true;
    startChallenge();
  }

  // Function that checks if the enter key is being pressed on a focused element
  function checkForEnter(event) {
    if(event.keyCode === 13) {
      this.click();
    }
  }

  // Initialize the white piano keys in the appropriate location of the
  // css-grid
  for(let i = 0; i < whiteKeys.length; i++){
    $(whiteKeys[i]).css("grid-column", currColumn + "/" + (currColumn + 3));
    currColumn += 3;
  }
  whiteKeys.click(whiteKeyClick);
  whiteKeys.keypress(checkForEnter);

  currColumn = 3;

  // Initialize the black piano keys in the appropriate location of the
  // css-grid
  for(let i = 0; i < blackKeys.length; i++){
    if(currColumn === 9 || currColumn === 21 || currColumn === 30) {
      currColumn += 3;
    }

    $(blackKeys[i]).css("grid-column", currColumn + "/" + (currColumn + 2));
    currColumn += 3;
  }
  blackKeys.click(blackKeyClick);
  blackKeys.keypress(checkForEnter);

  pianoBoxMutObs.observe(pianoArea[0], {childList:true})

  // Adding hover listeners to the buttons to play animations only when the 
  // button is enabled
  startChallButton.click(startChallenge);
  startChallButton.hover(
      function () {$(this).addClass("animate-button")},
      function () {$(this).removeClass("animate-button")}
  );
  startDemoButton.click(startDemo);
  startDemoButton.hover(
      function () {$(this).addClass("animate-button")},
      function () {$(this).removeClass("animate-button")}
  );

  window.addEventListener("keydown", pianoKeyPressed);
});