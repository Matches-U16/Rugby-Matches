let startTimestamp = null;
let elapsedSeconds = 0;
let timerInterval = null;
let matchFinished = false;

let homeScore = 0;
let awayScore = 0;

const timeDisplay = document.getElementById("time-display");
const homeScoreEl = document.getElementById("home-score");
const awayScoreEl = document.getElementById("away-score");
const eventsList = document.getElementById("events-list");

let homeTeam = prompt("Nome squadra di casa") || "Casa";
let awayTeam = prompt("Nome squadra ospite") || "Ospiti";

document.querySelectorAll(".team h3")[0].textContent = homeTeam;
document.querySelectorAll(".team h3")[1].textContent = awayTeam;

function updateTimerDisplay() {
    const m = Math.floor(elapsedSeconds / 60).toString().padStart(2, "0");
    const s = (elapsedSeconds % 60).toString().padStart(2, "0");
    timeDisplay.textContent = `${m}:${s}`;
}

function startTimer() {
    if (timerInterval) return;
    startTimestamp = Date.now() - elapsedSeconds * 1000;

    timerInterval = setInterval(() => {
        elapsedSeconds = Math.floor((Date.now() - startTimestamp) / 1000);
        if (elapsedSeconds >= 80 * 60) elapsedSeconds = 80 * 60;
        updateTimerDisplay();
        saveMatch();
    }, 1000);
}

function pauseTimer() {
    clearInterval(timerInterval);
    timerInterval = null;
}

function resetTimer() {
    if (!confirm("Resettare partita?")) return;
    pauseTimer();
    elapsedSeconds = 0;
    homeScore = awayScore = 0;
    homeScoreEl.textContent = awayScoreEl.textContent = "0";
    eventsList.innerHTML = "";
    updateTimerDisplay();
    saveMatch();
}

function startSecondHalf() {
    if (!confirm("Avviare il secondo tempo da 35:00?")) return;

    pauseTimer();
    elapsedSeconds = 35 * 60;
    updateTimerDisplay();
    startTimer();
    saveMatch();
}

document.getElementById("start-timer").onclick = startTimer;
document.getElementById("pause-timer").onclick = pauseTimer;
document.getElementById("reset-timer").onclick = resetTimer;
document.getElementById("second-half").onclick = startSecondHalf;
document.getElementById("end-match").onclick = endMatch;

function getStatus() {
    if (matchFinished) return "FINITA";
    if (elapsedSeconds < 35 * 60) return "PRIMO TEMPO";
    if (elapsedSeconds < 80 * 60) return "SECONDO TEMPO";
    return "FINITA";
}


function logEvent(text) {
    const e = `[${timeDisplay.textContent}] ${text} | ${homeScore} – ${awayScore}`;
    const li = document.createElement("li");
    li.textContent = e;
    eventsList.prepend(li);
}

function updateScore(team, pts, label) {
    if (matchFinished) {
        alert("La partita è terminata");
        return;
    }
    const player = prompt("Numero giocatore") || "N/D";
    if (team === "home") homeScore += pts;
    else awayScore += pts;

    homeScoreEl.textContent = homeScore;
    awayScoreEl.textContent = awayScore;

    logEvent(`${label} ${team === "home" ? homeTeam : awayTeam} #${player}`);
    saveMatch();
}

function endMatch() {
    if (matchFinished) return;

    if (!confirm("Confermi la fine della partita?")) return;

    pauseTimer();
    matchFinished = true;

    logEvent("FINE PARTITA");
    saveMatch();
}

function addButtons(team, container) {
    const actions = [
        ["Meta", 5],
        ["Trasformazione", 2],
        ["Punizione/Drop", 3],
        ["-1", -1],
        ["Giallo", 0]
    ];

    actions.forEach(([label, pts]) => {
        const b = document.createElement("button");
        b.textContent = label;
        if (label === "Giallo") b.classList.add("yellow-card");
        b.onclick = () => updateScore(team, pts, label);
        container.appendChild(b);
    });
}

addButtons("home", document.querySelectorAll(".team")[0]);
addButtons("away", document.querySelectorAll(".team")[1]);

document.getElementById("save-events").onclick = () => {
    let txt = "";
    [...eventsList.children].reverse().forEach(li => txt += li.textContent + "\n");
    const blob = new Blob([txt], { type: "text/plain" });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = "eventi.txt";
    a.click();
};

function saveMatch() {
    firebase.database().ref(MATCH_ID).set({
        homeTeam,
        awayTeam,
        homeScore,
        awayScore,
        status: getStatus(),
        finished: matchFinished,
        updatedAt: Date.now()
    });
}

updateTimerDisplay();
saveMatch();
