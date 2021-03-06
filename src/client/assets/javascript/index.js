// PROVIDED CODE BELOW (LINES 1 - 80) DO NOT REMOVE

// The store will hold all information needed globally
var store = {
  track_id: undefined,
  player_id: undefined,
  race_id: undefined,
};

const racerName = {
  'Racer 1': 'Panellope Von Schweetz',
  'Racer 2': 'Taffyta Muttonfudge',
  'Racer 3': 'Candle Head',
  'Racer 4': 'Rancis Fluggerbutter',
  'Racer 5': 'King Candy',
};

const trackName = {
  'Track 1': 'Gumball Gorge',
  'Track 2': 'Cakeway',
  'Track 3': 'Soft Serve Speedway',
  'Track 4': 'Royal Raceway',
  'Track 5': 'Diet Cola Mountain',
  'Track 6': 'INTERLAGOS',
};

// We need our javascript to wait until the DOM is loaded
document.addEventListener('DOMContentLoaded', function () {
  onPageLoad();
  setupClickHandlers();
});

async function onPageLoad() {
  try {
    getTracks().then((tracks) => {
      const html = renderTrackCards(tracks);
      renderAt('#tracks', html);
    });

    getRacers().then((racers) => {
      const html = renderRacerCars(racers);
      renderAt('#racers', html);
    });
  } catch (error) {
    console.log('Problem getting tracks and racers ::', error.message);
    console.error(error);
  }
}

function setupClickHandlers() {
  document.addEventListener(
    'click',
    function (event) {
      const { target } = event;

      // Race track form field
      if (target.matches('.card.track')) {
        handleSelectTrack(target);
      }

      // Podracer form field
      if (target.matches('.card.podracer')) {
        handleSelectPodRacer(target);
      }

      // Submit create race form
      if (target.matches('#submit-create-race')) {
        event.preventDefault();

        // start race
        handleCreateRace();
      }

      // Handle acceleration click
      if (target.matches('#gas-peddle')) {
        handleAccelerate(target);
      }
    },
    false
  );
}

async function delay(ms) {
  try {
    return await new Promise((resolve) => setTimeout(resolve, ms));
  } catch (error) {
    console.log("an error shouldn't be possible here");
    console.log(error);
  }
}
// ^ PROVIDED CODE ^ DO NOT REMOVE

// This async function controls the flow of the race, add the logic and error handling
async function handleCreateRace() {
  
  // Get player_id and track_id from the store
  const { player_id, track_id } = store;

  try {
    // invoke the API call to create the race, then save the result
    const race = await createRace(player_id, track_id);
    const { Track } = race;
    // render starting UI
    renderAt('#race', renderRaceStartView(Track));
    // update the store with the race id
    store = { ...store, race_id: race.ID };
    // The race has been created, now start the countdown
    // call the async function runCountdown
    await runCountdown();
    // call the async function startRace
    await startRace(race.ID);
    // call the async function runRace
    await runRace(race.ID);
  } catch (err) {
 		console.log("Error in handleCreateRace()", err.message)
  }
}

function runRace(raceID) {
  	return new Promise(resolve => {
	// use Javascript's built in setInterval method to get race info every 500ms
		const id = setInterval(() => {
			getRace(raceID)
				.then(res => {
					if (res.status !== 'finished') {
						// if the race info status property is "in-progress", update the leaderboard by calling:
							renderAt('#leaderBoard', raceProgress(res.positions))
					} else {
						// if the race info status property is "finished", run the following:
						clearInterval(id) // to stop the interval from repeating
						renderAt('#race', resultsView(res.positions)) // to render the results view
						resolve(res) // resolve the promise
					}
				})
		}, 500)
	})
	.catch(err => console.log("Error with runRace()", err))
	// remember to add error handling for the Promise
}

async function runCountdown() {
  try {
    // wait for the DOM to load
    await delay(1000);
    let timer = 3;

    return new Promise((resolve) => {
      // use Javascript's built in setInterval method to count down once per second
      const interval = setInterval(async () => {
      	// run this DOM manipulation to decrement the countdown for the user
        document.getElementById('big-numbers').innerHTML = --timer;
        // if the countdown is done, clear the interval, resolve the promise, and return
        if (timer === 0) {
          clearInterval(interval);
 					document.getElementById('big-numbers').innerHTML = "GO!";
          resolve();
        }
      }, 1000);
    });
  } catch (error) {
  	 	console.log("Error in runCountdown()", err.message)
  }
}

function handleSelectPodRacer(target) {
  console.log('selected a pod', target.id);

  // remove class selected from all racer options
  const selected = document.querySelector('#racers .selected');
  if (selected) {
    selected.classList.remove('selected');
  }

  // add class selected to current target
  target.classList.add('selected');

  // save the selected racer to the store
  store = { ...store, player_id: parseInt(target.id) };
}

function handleSelectTrack(target) {
  console.log('selected a track', target.id);

  // remove class selected from all track options
  const selected = document.querySelector('#tracks .selected');
  if (selected) {
    selected.classList.remove('selected');
  }

  // add class selected to current target
  target.classList.add('selected');

  // save the selected track id to the store
  store = { ...store, track_id: parseInt(target.id) };
}

// Invoke the API call to accelerate
async function handleAccelerate() {
  const { race_id } = store;
  try {
    console.log("accelerate button clicked")
    accelerate(race_id);
  } catch (err) {
    console.log('Problem with accelerating the car:::', err);
  } 
}

// HTML VIEWS ------------------------------------------------
// Provided code - do not remove

function renderRacerCars(racers) {
  if (!racers.length) {
    return `
			<h4>Loading Racers...</4>
		`;
  }

  const results = racers.map(renderRacerCard).join('');

  return `
		<ul id="racers">
			${results}
		</ul>
	`;
}

function renderRacerCard(racer) {
  const { id, driver_name, top_speed, acceleration, handling } = racer;

  return `
		<li class="card podracer" id="${id}">
			<h3>${racerName[driver_name]}</h3>
			<p>${top_speed}</p>
			<p>${acceleration}</p>
			<p>${handling}</p>
		</li>
	`;
}

function renderTrackCards(tracks) {
  if (!tracks.length) {
    return `
			<h4>Loading Tracks...</4>
		`;
  }

  const results = tracks.map(renderTrackCard).join('');

  return `
		<ul id="tracks">
			${results}
		</ul>
	`;
}

function renderTrackCard(track) {
  const { id, name } = track;

  return `
		<li id="${id}" class="card track">
			<h3>${trackName[name]}</h3>
		</li>
	`;
}

function renderCountdown(count) {
  return `
		<h2>Race Starts In...</h2>
		<p id="big-numbers">${count}</p>
	`;
}

function renderRaceStartView(track) {
  return `
		<header>
			<h1>Race: ${track.name}</h1>
		</header>
		<main id="two-columns">
			<section id="leaderBoard">
				${renderCountdown(3)}
			</section>

			<section id="accelerate">
				<h2>Directions</h2>
				<p>Click the button as fast as you can to make your racer go faster!</p>
				<button id="gas-peddle">Click Me To Win!</button>
			</section>
		</main>
		<footer></footer>
	`;
}

function resultsView(positions) {
  positions.sort((a, b) => (a.final_position > b.final_position ? 1 : -1));

  return `
		<header>
			<h1>Race Results</h1>
		</header>
		<main>
			${raceProgress(positions)}
			<a href="/race">Start a new race</a>
		</main>
	`;
}

function raceProgress(positions) {
  let userPlayer = positions.find((e) => e.id === store.player_id);
  const name = `${racerName[userPlayer.driver_name]} (you)`;

  const newPositions = positions.sort((a, b) =>
    a.segment > b.segment ? -1 : 1
  );
  let count = 1;

  const results = newPositions.map((p) => {
    return `
			<tr>
				<td>
            <h3>${count++} - ${
      p.id === store.player_id ? name : racerName[p.driver_name]
    }</h3>
				</td>
			</tr>
		`;
  });

  return `
		<main>
			<h3>Leaderboard</h3>
			<section id="leaderBoard">
				${results}
			</section>
		</main>
	`;
}

function renderAt(element, html) {
  const node = document.querySelector(element);

  node.innerHTML = html;
}

// ^ Provided code ^ do not remove

// API CALLS ------------------------------------------------

const SERVER = 'http://localhost:8000';

function defaultFetchOpts() {
  return {
    mode: 'cors',
    headers: {
      'Content-Type': 'application/json',
      'Access-Control-Allow-Origin': SERVER,
    },
  };
}

// GET request to `${SERVER}/api/tracks`
async function getTracks() {
	try {
		return await fetch(`${SERVER}/api/tracks`, {
			method: 'GET',
			...defaultFetchOpts()
		})
			.then(res => res.json())
	} catch (err) {
		console.log("Problem with getTracks", err.message)
	}
}

// GET request to `${SERVER}/api/cars`
async function getRacers() {
	try {
		return await fetch(`${SERVER}/api/cars`, {
			method: 'GET',
			...defaultFetchOpts()
		})
			.then(res => res.json())
	} catch (err) {
		console.log("Problem with getRacers", err.message)
	}
}

function createRace(player_id, track_id) {
  player_id = parseInt(player_id);
  track_id = parseInt(track_id);
  const body = { player_id, track_id };

  return fetch(`${SERVER}/api/races`, {
    method: 'POST',
    ...defaultFetchOpts(),
    dataType: 'jsonp',
    body: JSON.stringify(body),
  })
    .then((res) => res.json())
    .catch((err) => console.log('Problem with createRace request::', err));
}

// GET request to `${SERVER}/api/races/${id}`
function getRace(id) {
  return fetch(`${SERVER}/api/races/${id - 1}`, {
    method: 'GET',
    ...defaultFetchOpts(),
  })
    .then((res) => res.json())
    .catch((err) => console.log('Problem with getRace request::', err));
}

function startRace(id) {
  return fetch(`${SERVER}/api/races/${id - 1}/start`, {
    method: 'POST',
    ...defaultFetchOpts(),
  }).catch((err) => console.log('Problem with startRace request::', err));
}

// POST request to `${SERVER}/api/races/${id}/accelerate`
// options parameter provided as defaultFetchOpts
// no body or datatype needed for this request
function accelerate(id) {
  return fetch(`${SERVER}/api/races/${id - 1}/accelerate`, {
    method: 'POST',
    ...defaultFetchOpts(),
  }).catch((err) => console.log('Problem with accelerating the car::', err));
}
