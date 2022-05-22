import summary from "./summary.js";

summary.
  then( data => {
    let table = document.createElement("table");
    let caption = document.createElement("caption");
    caption.textContent = "Приблизительная продолжительность трендов криптовалютных пар"
    let row = document.createElement("tr");

    for (let header of ["Pair", "day", "week", "month", "price chart"]) {
      let column = document.createElement("th");
      column.textContent = header;
      row.append(column);
    }

    table.append(caption, row);

    let timeframes = Object.keys(data[0]);
    timeframes.shift();

    for (let item of data) {
      row = document.createElement("tr");
      let column = document.createElement("td");
      let fragment = document.createDocumentFragment();
      column.textContent = item.symbol.replace("USDT", "/USDT");
      fragment.append(column);

      for (let timeframe of timeframes) {
        column = document.createElement("td");

        if (item[timeframe].currentTrend === "Up") {
          column.style.color = "green";
        } else {
          column.style.color = "red";
        }

        column.textContent = item[timeframe].duration;
        fragment.append(column);
      }

      column = document.createElement("td");
      let link = document.createElement("a");
      link.href = "https://www.binance.com/ru/trade/" + item.symbol.replace("USDT", "_USDT");
      link.target = "_blank";
      link.textContent = "график";

      column.append(link);
      row.append(fragment, column);
      table.append(row);
    }

    document.body.children[0].append(table);

  });






