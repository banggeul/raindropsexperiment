import store from './utils/storage.js'
//get the current data stored
const {
  data
} = store.getState();
//create an empty object to store the new experiment data
let experiment = {};
//create an empty array to store the user's choices
let dots = [];

const $getUserContext = document.querySelector('#collectUserContext');
const $welcomeScreen = document.querySelector('#user-context')
const $game = document.querySelector('#content');
$getUserContext.addEventListener('click', getUserContext);

function getUserContext() {
  const userID = document.querySelector('#name').value;
  const timestamp = Date.now();
  experiment.userID = userID;
  experiment.timestamp = timestamp;
  $game.style.display = "none";
  $game.style.opacity = 0;
  setUpGame();
  //fade out the welcome screen and fade in the game screen
  fadeOut($welcomeScreen, true);
  fadeIn($game);
}

function setUpGame() {
  console.log("set up the game here");
  $game.innerHTML = `<div>
      <div id="gameView" class="gameView">
        <div class="video-container">
          <video playsinline autoplay muted >
            <source src="trees1.mp4" type="video/mp4" poster="trees.png">
            Your browser does not support HTML5 video.
          </video>
        </div>
        <div id="game-ui" class="game-ui">
          <h1 class="title"> Rain Drops </h1>
          <p class="instruction"> Click to create rain drops.</p>
          <a class="cta" href="#" id="startBtn"> Start </a>
        </div>
        <div class="thanks">
          <h1> Thanks for your participation! </h1>
          <!-- <span class="sun"></span> -->
        </div>
        <div id="buttons">
          <a class="cta disabled" href="#" id="submit"> Finish </a>
          <a class="cta disabled" href="#/game" id="playback"> Play back </a>
        </div>
      </div>
    </div>`;

  var clickEvent = new MouseEvent("click", {
    "view": window,
    "bubbles": true,
    "cancelable": false
  });

  let timeID;
  let isGameOn = false;
  const $startBtn = document.querySelector('#startBtn');
  const $gameView = document.querySelector('#gameView');
  const $submitButton = document.querySelector('#submit');
  const $playButton = document.querySelector('#playback');
  // const $appHeader = document.querySelector('#app-header');
  const $gameUI = document.querySelector('#game-ui');
  const $thanks = document.querySelector('.thanks');
  // const $sun = document.querySelector('.sun');
  const time = 20000;

  var video = document.querySelector("video");
  if (video) {
    video.pause();
  }
  // $appHeader.style.display = "none";
  $thanks.style.display = "none";
  $thanks.style.opacity = 0;
  $gameView.style.height = window.innerHeight + "px";

  //startbutton
  $startBtn.addEventListener('click', function(e) {
    e.preventDefault();

    if (video) {
      if (video.paused) {
        video.play();
      }
    }
    fadeOut($gameUI, true);
    $gameUI.style.pointerEvents = "none";
    setTimeout(function() {
      isGameOn = true;
      if (!timeID) {
        timeID = setTimeout(function() {
          console.log("timeout");
          // $submitButton.dispatchEvent(clickEvent);
          finishGame();
        }, time);
      }
    }, 2000);
  })
  //gameview clicks
  $gameView.addEventListener('click', function(e) {
    // const target = e.target.closest('.gameView');
    if (isGameOn) {
      let currentTime = new Date().getTime();
      const data = {
        position: {
          x: e.offsetX,
          y: e.offsetY
        },
        time: currentTime
      }

      dots = [...dots, data];
      createDot(data.position, this);

      if (dots.length > 0 && $submitButton.classList.contains('disabled')) {
        $submitButton.classList.remove('disabled');
      }
    }
  })

  $submitButton.addEventListener('click', function(e) {
    e.preventDefault();
    finishGame();
  })

  $playButton.addEventListener('click', function(e) {
    e.preventDefault();
    $submitButton.classList.add('disabled');
    let {
      data
    } = store.getState();
    let arrayData = data[data.length - 1];
    // console.log(arrayData);
    replay(arrayData, $gameView);
    this.classList.add('disabled');
  })

  function finishGame() {
    // if(this.innerHTML==="Reset"){
    //   dots=[];
    //   [...$gameView.children].forEach((dot)=>{
    //     dot.remove();
    //   });
    //   this.innerHTML = "Finish";
    //   this.classList.add('disabled');
    //   $playButton.classList.add('disabled');
    //   $gameView.style.pointerEvents = "unset";
    //   return;
    // }
    isGameOn = false;
    experiment.dots = dots;
    store.dispatch({
      type: dots.length > 0 ? "ADD_DATA" : "REMOVE_DATA",
      payload: {
        data: experiment
      }
    });

    dots = [];
    console.log("data logged");
    fadeIn($thanks);
    // gsap.from('.sun', {y:200, duration:2.5, ease:"elastic.out(1, 0.3)", delay:1})
    // gsap.to('.sun',{filter:"blur(0px)", scale:1.2, repeat:-1, yoyo:true, duration:1});
    // gsap.from($gameUI, {opacity:0, duration:1});
  }
}

function timeout(ms) {
  return new Promise(res => setTimeout(res, ms));
}

async function replay(data, $gameView) {
  $gameView.style.pointerEvents = "none";
  // console.log(data);
  let dTime = 0;
  [...$gameView.children].forEach((dot) => {
    dot.style.display = "none";
    dot.style.opacity = 0;
    dot.remove();
  });

  await timeout(500);

  data.forEach(d => {
    const playback = setTimeout(function() {
      createDot(d.position, $gameView, false, false);
    }, d.time - data[0].time);
    dTime = d.time - data[0].time;
  })

  const done = setTimeout(function() {

    [...$gameView.children].forEach((dot) => {
      dot.style.display = "unset";
      dot.style.opacity = .9;
    });

    document.querySelector('#playback').classList.remove('disabled');
    document.querySelector('#submit').innerHTML = "Reset";
    document.querySelector('#submit').classList.remove('disabled');

  }, dTime + 500);

}


function createDot(options, $gameView, fadeOut = true, remove = true) {
  const dot = document.createElement('div');
  dot.classList.add('rainDrop');
  dot.style.pointerEvents = "none";
  $gameView.append(dot);
  dot.style.top = options.y + "px";
  dot.style.left = options.x + "px";
  dot.style.opacity = 0.6;
  dot.style.transform = "scale(0.6,0.6)"
  // fadeIn(dot);
  gsap.to(dot, {
    duration: .3,
    ease: "power4.out",
    transform: "scale(1,1)",
    opacity: 1,
    onComplete: fadeOut ? fade : null
  });

  function fade() {
    gsap.to(dot, {
      duration: 1,
      ease: "power4.in",
      opacity: 0,
      onComplete: remove ? removeDot : null
    });
  }

  function removeDot() {
    dot.remove();
  }

  // if(fadeOut){
  //   fade(dot, remove);
  // }
}

function fadeIn(elem) {
  elem.style.display = "block";
  elem.style.opacity = 0;
  gsap.to(elem, {
    duration: 1,
    ease: "power1.inOut",
    opacity: 1
  });
}

function fadeOut(elem, hide) {
  gsap.to(elem, {
    duration: .5,
    ease: "power1.inOut",
    opacity: 0,
    onComplete: hide ? hideElem : null,
    onCompleteParams: [elem]
  });
}

function hideElem(elem) {
  elem.style.display = "none";
}
