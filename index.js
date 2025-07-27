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

  updateElementById("profit", `$${backProfit.toFixed(2)}`);
  updateElementById("lay_stake", `$${layStake.toFixed(2)}`);
  updateElementById("lay_liability", `$${layLiability.toFixed(2)}`);
  updateElementById("roi", `${roiMin.toFixed(2)}%`);
  updateElementById("total_investment", `$${totalInvestment.toFixed(2)}`);

  return false;
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
};
