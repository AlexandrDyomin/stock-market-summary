"use strict";

class Pair {
  symbol;
  interval;
  minPeriod;
  averagePeriod;
  maxPeriod;
  minPeriodMultiplier;
  averagePeriodMultiplier;
  maxPeriodMultiplier;
  limit;
  url;
  coin = 0;

  constructor(props) {
    this.symbol = props.symbol;
    this.interval = props.interval;
    this.minPeriod = props.minPeriod;
    this.averagePeriod = props.averagePeriod;
    this.maxPeriod = props.maxPeriod;
    this.minPeriodMultiplier = 2 / (props.minPeriod + 1);
    this.averagePeriodMultiplier = 2 / (props.averagePeriod + 1);
    this.maxPeriodMultiplier = 2 / (props.maxPeriod + 1);
    this.limit = props.maxPeriod;
    this.url = `https://api.binance.com/api/v1/klines?symbol=${props.symbol}&interval=${props.interval}&limit=${this.limit}`;
  }
}

export default Pair;
