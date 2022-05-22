import start from "./functions.js";


const allPairsUrl = " https://api.binance.com/api/v1/ticker/24hr";
const currency = "USDT";


let summary = start(allPairsUrl, currency, ["1d", "1w", "1M"], [5, 10, 20]);

export default summary;