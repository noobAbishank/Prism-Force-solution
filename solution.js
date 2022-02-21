const fs = require("fs");

// function for reading the json file
function jsonReader(filePath, cb) {
  fs.readFile(filePath, "utf-8", (err, fileData) => {
    if (err) {
      return cb && cb(err);
    }
    try {
      const object = JSON.parse(fileData);

      return cb && cb(null, object);
    } catch (err) {
      return cb && cb(err);
    }
  });
}

const tempMap = new Map();

// calculating the balance and mapping it with timestamp
function loadDateIntoMaster(data) {
  for (let i = 0; i < data.expenseData.length; i++) {
    var temp = 0;
    if (tempMap.has(data.expenseData[i].startDate)) {
      temp = tempMap.get(data.expenseData[i].startDate);
    }
    tempMap.set(
      data.expenseData[i].startDate,
      temp - data.expenseData[i].amount
    );
  }
  for (let i = 0; i < data.revenueData.length; i++) {
    var temp = 0;
    if (tempMap.has(data.revenueData[i].startDate)) {
      temp = tempMap.get(data.revenueData[i].startDate);
    }
    tempMap.set(
      data.revenueData[i].startDate,
      temp + data.revenueData[i].amount
    );
  }
}

// Formating the string into date
function dateFormate(tempDate) {
  return (
    "" +
    tempDate.toLocaleDateString("en-US", { year: "numeric" }) +
    "-" +
    tempDate.toLocaleDateString("en-US", { month: "2-digit" }) +
    "-01T00:00:00.000Z"
  );
}

// creating the final balancesheet
function createOutput() {
  let minDate = null;
  let maxDate = null;

  tempMap.forEach(function (value, key) {
    if (minDate === null || minDate > key) {
      minDate = key;
    }

    if (maxDate === null || maxDate < key) {
      maxDate = key;
    }
  });

  const mnd = new Date(minDate);
  const mxd = new Date(maxDate);
  let cnd = mnd;

  const balance = new Array();

  let i = 0;

  while (cnd <= mxd) {
    var outputAmount = 0;
    if (tempMap.has(dateFormate(cnd))) {
      outputAmount = tempMap.get(dateFormate(cnd));
    }

    balance.push({ amount: outputAmount, startDate: dateFormate(cnd) });

    i += 1;

    cnd.setMonth(cnd.getMonth() + 1);
  }

  const balanceSheet = JSON.stringify({ balance });

  console.log(balanceSheet);
}

// Read Json file
jsonReader("./3-input.json", (err, data) => {
  if (err) {
    console.log(err);
  } else {
    loadDateIntoMaster(data);
    createOutput();
  }
});
