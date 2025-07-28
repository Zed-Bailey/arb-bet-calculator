function calculateData(e) {
  const form = document.getElementById("calculateForm");
  const data = Object.fromEntries(new FormData(form));

  const stake = Number.parseFloat(data["stake"]);
  // commission should be converted to a float
  const commission = Number.parseFloat(data["betfair_commission"]) / 100;
  const layOdds = Number.parseFloat(data["betfair_lay_odds"]);
  const backOdds = Number.parseFloat(data["bookmaker_back_odds"]);

  const layStake = (backOdds * stake) / (layOdds - commission);

  const layLiability = layStake * (layOdds - 1);
  const backProfit = backOdds * stake - stake - layLiability;
  const layProfit = layStake - layStake * commission - stake;

  const roiBackWin = (backProfit / stake) * 100;
  const roiLayWin = (layProfit / stake) * 100;
  const roiMin = Math.min(roiBackWin, roiLayWin);
  const roiAvg = (roiBackWin + roiLayWin) / 2;
  const totalInvestment = stake + layLiability;

  window.localStorage.setItem(
    "lastCalculation",
    JSON.stringify({
      stake,
      commission,
      layOdds,
      backOdds,
      layStake,
      layLiability,
      backProfit,
      layProfit,
      roiBackWin,
      roiLayWin,
      roiAvg,
      totalInvestment,
    })
  );

  updateElementById("profit", `$${backProfit.toFixed(2)}`);
  updateElementById("lay_stake", `$${layStake.toFixed(2)}`);
  updateElementById("lay_liability", `$${layLiability.toFixed(2)}`);
  updateElementById("roi", `${roiMin.toFixed(2)}%`);
  updateElementById("total_investment", `$${totalInvestment.toFixed(2)}`);

  return false;
}

function renderSavedBetList() {
  const savedBets = JSON.parse(
    window.localStorage.getItem("savedBets") ?? "[]"
  );
  const savedBetsList = document.getElementById("savedBets");
  savedBetsList.innerHTML = "";
  for (let i = 0; i < savedBets.length; i++) {
    savedBetsList.innerHTML += savedBetListItemComponent(savedBets[i], i);
  }
}

function addAndTrackBet() {
  const lastCalculationJson = window.localStorage.getItem("lastCalculation");
  if (!lastCalculationJson) return;

  const lastCalculation = JSON.parse(lastCalculationJson);
  const savedBets = JSON.parse(
    window.localStorage.getItem("savedBets") ?? "[]"
  );
  savedBets.push(lastCalculation);
  window.localStorage.setItem("savedBets", JSON.stringify(savedBets));

  renderSavedBetList();
}

function removeBet(betIndex) {
  const savedBets = JSON.parse(
    window.localStorage.getItem("savedBets") ?? "[]"
  );

  const filtered = savedBets.filter((v, index) => {
    return index !== betIndex;
  });
  window.localStorage.setItem("savedBets", JSON.stringify(filtered));
  renderSavedBetList();
}

function savedBetListItemComponent(lastCalculation, index) {
  const {
    stake,
    commission,
    layOdds,
    backOdds,
    layStake,
    layLiability,
    backProfit,
    layProfit,
    roiBackWin,
    roiLayWin,
    roiAvg,
    totalInvestment,
  } = lastCalculation;

  return `
    <li>
      <div>
        <p>lay @ ${layOdds} | back @ ${backOdds}</p>
        <p>profit: $${backProfit}</p>
      </div>
      <button onclick="removeBet(${index})">remove</button>
    </li>
  `;
}

function updateElementById(name, value) {
  const ele = document.getElementById(name);
  if (ele) {
    ele.innerHTML = value;
  }
}

window.onload = () => {
  const form = document.getElementById("calculateForm");
  form.onsubmit = calculateData;
  renderSavedBetList();
};
