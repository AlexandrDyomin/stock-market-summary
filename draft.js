
const fetch = require('node-fetch');
const Pair = require("./Pair");
const allPairsUrl = "https://api.binance.com/api/v1/ticker/24hr";

let gmtUsdt = new Pair({
  symbol: "GMTUSDT",
  interval: "5m",
  minPeriod: 5,
  averagePeriod: 10,
  maxPeriod: 20
});

let btcUsdt = new Pair({
  symbol: "BTCUSDT",
  interval: "5m",
  minPeriod: 5,
  averagePeriod: 10,
  maxPeriod: 20
});

let ethUsdt = new Pair({
  symbol: "ETHUSDT",
  interval: "5m",
  minPeriod: 5,
  averagePeriod: 10,
  maxPeriod: 20
});

let solUsdt = new Pair({
  symbol: "SOLUSDT",
  interval: "5m",
  minPeriod: 5,
  averagePeriod: 10,
  maxPeriod: 20
});

let dogeUsdt = new Pair({
  symbol: "DOGEUSDT",
  interval: "5m",
  minPeriod: 5,
  averagePeriod: 10,
  maxPeriod: 20
});

let ltcUsdt = new Pair({
  symbol: "LTCUSDT",
  interval: "5m",
  minPeriod: 5,
  averagePeriod: 10,
  maxPeriod: 20
});

let nearUsdt = new Pair({
  symbol: "NEARUSDT",
  interval: "5m",
  minPeriod: 5,
  averagePeriod: 10,
  maxPeriod: 20
});

let astrUsdt = new Pair({
  symbol: "ASTRUSDT",
  interval: "5m",
  minPeriod: 5,
  averagePeriod: 10,
  maxPeriod: 20
});

let drepUsdt = new Pair({
  symbol: "DREPUSDT",
  interval: "5m",
  minPeriod: 5,
  averagePeriod: 10,
  maxPeriod: 20
});

let balUsdt = new Pair({
  symbol: "BALUSDT",
  interval: "5m",
  minPeriod: 5,
  averagePeriod: 10,
  maxPeriod: 20
});
////////////////////////////////////////////////////////////////////////


console.log(new Date() );
let usdt = 100;

monitorTrend(gmtUsdt);
// monitorTrend(btcUsdt);
// monitorTrend(ethUsdt);
// monitorTrend(solUsdt);
// monitorTrend(dogeUsdt);
// monitorTrend(ltcUsdt);
// monitorTrend(nearUsdt);
// monitorTrend(astrUsdt);
// monitorTrend(drepUsdt);
// monitorTrend(balUsdt);




async function monitorTrend(props, trend = true) {
  try {
    let data = await requestData(props.url);
    let prices = calcEmaPrices(data, props);
    let newTrend = analizeEMA(prices);

    ///////////////////////////////////////
    let message;
    if (newTrend && newTrend !== trend) {
      if (usdt >= 10 && props.coin === 0) {
        props.coin = 10 / getCurrentPrice(data);
        usdt = usdt - 10 - 0.075;
        message = `${ getTime() } ${ props.symbol }: Возможен растущий тренд. Покупка по цене ${ getCurrentPrice(data) }. Доступно usdt = ${ usdt }`;
        console.log(message);
        console.log(prices);
        console.log("*****************************************************");
      }

    }

    if (newTrend === false && newTrend !== trend) {
      if (props.coin) {
        usdt = usdt + props.coin * getCurrentPrice(data) - 0.075;
        props.coin = 0;
        let percent = usdt / 100 - 1;
        message = `${ getTime() } ${ props.symbol }: Возможен падающий тренд. Продажа по цене ${ getCurrentPrice(data) }. Доступно usdt = ${ usdt }. ${ percent }`;
        console.log(message);
        console.log(prices);
        console.log("*****************************************************");
      }
    }

    setTimeout(monitorTrend, 2000, props, newTrend);
  } catch(e) {
    setTimeout(monitorTrend, 60000, props);
    console.error(e);
  }
}


async function requestData(url) {
  let res = await fetch(url).catch(e => { throw e });

  try {
    res = checkStatus(res);
    return await res.json();
  } catch(e) {
    throw e;
  }
}


function calcEmaPrices(data, props) {
  let maxPeriodSum = 0;
  let averagePeriodSum = 0;
  let minPeriodSum = 0;
  let currentPrice = getCurrentPrice(data);

  data.forEach( (item, i) => {
    maxPeriodSum += +item[4];

    if(i >= props.maxPeriod - props.averagePeriod ) {
      averagePeriodSum += +item[4];
    }

    if(i >= props.maxPeriod - props.minPeriod ) {
      minPeriodSum += +item[4];
    }
  });

  let minPeriodSMA = minPeriodSum / props.minPeriod;
  let averagePeriodSMA = averagePeriodSum / props.averagePeriod;
  let maxPeriodSMA = maxPeriodSum / props.maxPeriod;

  return {
    minPeriodPrice:
      (currentPrice - minPeriodSMA) * props.minPeriodMultiplier + minPeriodSMA,
    averagePeriodPrice:
      (currentPrice - averagePeriodSMA) * props.averagePeriodMultiplier + averagePeriodSMA,
    maxPeriodPrice:
      (currentPrice - maxPeriodSMA) * props.maxPeriodMultiplier + maxPeriodSMA
  };
}


function getCurrentPrice(data) {
  return data[data.length - 1][4];
}


function checkStatus(res) {
  if (res.ok) {
    return res;
  } else {
    throw new Error(`HTTP Error Response: ${res.status} ${res.statusText}`);
  }
}


function getTime(date = new Date() ) {
  return `${ date.getDate() }.${ date.getMonth() + 1 }.${ date.getFullYear() } - ${date.getHours() }:${ date.getMinutes() }:${ date.getSeconds() }`;
}


function analizeEMA(prices) {
  let minEMAMore = prices.minPeriodPrice > prices.averagePeriodPrice;
  let averageEMAMore = prices.averagePeriodPrice > prices.maxPeriodPrice;

  if (minEMAMore && averageEMAMore && prices.minPeriodPrice / prices.averagePeriodPrice >= 1.00015) {
    return true // Рост
  }

  if (!minEMAMore && prices.averagePeriodPrice / prices.minPeriodPrice >= 1.00015) {
    return false; // Снижение
  }

  return undefined; // тренд сохраняется
}







// может понадабиться в будущем
// async function ATime() {
//   url = "https://api.binance.com/api/v1/time";
//   let res = await fetch(url);
//   let data = await res.json();
//   let time = await data.serverTime;

//   return time;
// }