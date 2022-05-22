async function start(url, currency, timeframes, periodsEma) {
  let start = Date.now()

  let pairs;

  if(localStorage.getItem("pairs") === null) {
    console.log("Загрузка списка торгуемых пар...");

    pairs = await getTraidingPairs(url, currency);
    localStorage.setItem("pairs", JSON.stringify(pairs));
  } else {
    pairs = localStorage.getItem("pairs");
  pairs = JSON.parse(pairs);
  }
  // pairs.length = 15;
  let summary = await getSummary(pairs, timeframes, periodsEma);
  summary = await stay(summary);


  let props = Object.keys(summary[0]);
  props.splice(props.findIndex( prop => prop === "symbol"), 1);

  summary = await mySort(summary, props);

  // console.log(summary);
  // console.log("Всего записей " + summary.length);
  // console.log(`Затрачено ${ ( (Date.now() - start) / 1000 / 60).toFixed(2) } мин.`);

  return summary;
}


 async function mySort(array, timeframes) {
  console.log("Сортировка результата...");

  let tmp = array.map( (pair, i) => {
    let weight = 0;

    timeframes.forEach(timeframe => {
      if (pair[timeframe].currentTrend === "Up") weight += 1;
      else weight -= 1;
    });

    return {index: i, weight};
  });

  tmp.sort( (a, b) => b.weight - a.weight);

  return tmp.map(item => array[item.index]);
}


async function stay(data) {
  console.log("Обработка полученных данных...");

  let timeframes = Object.keys(data[0]);
  timeframes.splice(timeframes.findIndex( prop => prop === "symbol"), 1);

  for (let pair of data) {
    for (let timeframe of timeframes) {
      for (let item of ["currentTrend", "duration"])
        pair[timeframe][item] = await pair[timeframe][item];
    }
  }

  return data;
}


// возвращает все торгуемые монеты за переданую валюту
async function getTraidingPairs(url, currency) {
  let data = await requestData(url);
  let traidingPairs = [];

  for (let item of data) {
    if (item.symbol.endsWith(currency) ) {
      traidingPairs.push(item.symbol);
    }
  }

  return traidingPairs;
}


// возвращает список цен ema за период
async function calcEma(data, period) {
  data = await data;
  if (data.length < period) return [];

  let ema = [];
  let i = 0;
  let sum = 0;
  let price;
  let multiplyingFactor = 2 / (period + 1);

  for (i; i < period; i++) {
    sum += +data[i][4];
  }

  i--;
  let sma = sum / period;
  price = (+data[i][4] - sma) * multiplyingFactor + sma;
  ema.push(price);

  i++;
  for (i; i < data.length; i++) {
    price = (+data[i][4] - ema[ema.length - 1]) * multiplyingFactor + ema[ema.length - 1];
    ema.push(price);
  }

  return ema;
}


// возвращает текущий тренд
async function getCurrentTrend(emaArray) {
  let trend;
  let [shortTermEma, midTermEma, longTermEma ] = emaArray;
  shortTermEma = await shortTermEma;
  midTermEma = await midTermEma;
  longTermEma = await longTermEma;

  if (shortTermEma[shortTermEma.length - 1] > midTermEma[midTermEma.length - 1] && midTermEma[midTermEma.length - 1] > longTermEma[longTermEma.length - 1]) {
    trend = "Up";
  } else {
    trend = "Down"
  }

  return trend;
}


// возвращает продолжительность текущего тренда
async function caclCurrentTrendDuration(currentTrend, emaArray) {
  currentTrend = await currentTrend;

  let [shortTermEma, midTermEma, longTermEma] = emaArray;
  shortTermEma = await shortTermEma;
  midTermEma = await midTermEma;
  longTermEma = await longTermEma;

  if (midTermEma.length === 0) return "--";

  let shortI = shortTermEma.length - 1;
  let midI = midTermEma.length - 1;
  let longI = longTermEma.length - 1;
  let duration = 0;

  if (currentTrend === "Up") {
    for (shortI, midI, longI; midI >= 0; shortI--, midI--, longI--) {
      if (longI >= 0) {
        if (shortTermEma[shortI] < midTermEma[midI] && midTermEma[midI] < longTermEma[longI]) {
          break;
        }

        duration++;
      } else {
        if (shortTermEma[shortI] < midTermEma[midI])  break;
        duration++;
      }
    }
  } else {
    for (shortI, midI, longI; midI >= 0; shortI--, midI--, longI--) {
      if (longI >= 0) {
        if (shortTermEma[shortI] > midTermEma[midI] && midTermEma[midI] > longTermEma[longI]) {
          break;
        }

        duration++;

      } else {
        if (shortTermEma[shortI] > midTermEma[midI]) {
          break;
        }

        duration++;
      }
    }
  }

  return duration;
}


function checkStatus(res) {
  if (res.ok) {
    return res;
  } else {
    throw new Error(`HTTP Error Response: ${res.status} ${res.statusText}`);
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


// возвращает сводку по трендам
async function getSummary(traidingPairs, timeframes, periodsEma) {
  let data;
  let emaArray = [];
  let pair;
  let timeframe;
  let url;
  let period;
  let currentTrend;
  let duration;
  let summary = [];
  let infoAboutPair = {};

  console.log("Загрузка данных по торгуемым парам...");
  for (pair of traidingPairs) {
    infoAboutPair.symbol = pair;
    for (timeframe of timeframes) {
      url = `https://api.binance.com/api/v1/klines?symbol=${ pair }&interval=${ timeframe }&limit=50`;

      try {
        data = requestData(url);
      } catch(e) {
        console.error(e);
      }
      for (period of periodsEma) {
        emaArray.push(calcEma(data, period) );
      }

      currentTrend = getCurrentTrend(emaArray);

      duration = caclCurrentTrendDuration(currentTrend, emaArray);
      emaArray = [];

      infoAboutPair["timeframe_" + timeframe] = {
        currentTrend,
        duration
      };
    }

    summary.push(infoAboutPair);
    infoAboutPair = {};
  }

  return summary;
}


export default start;
