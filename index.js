const express = require("express");
const fs = require("fs");
const database = require("./database.json");
const app = express();
app.use(express.json());
app.use(express.static("client"));

app.post("/rfid", (req, res) => {
  let { EPC, RSSI, Antenna, Timestamp } = req.body;
  let data = {
    epc: EPC,
    antenna: Antenna,
    rssi: RSSI,
    timestampreader: Timestamp,
    timestamprecv: new Date().getTime(),
  };
  let last = getLastAntennaEPC(database, EPC, Antenna);
  if (!last || last.timestamprecv + 10000 < data.timestamprecv) {//Так що якщо той самий EPC, на одній антені є отриманий менш ніж через 10 секунд після попереднього, його слід ігнорувати.
    database.push(data);
    fs.writeFileSync("database.json", JSON.stringify(database, null, " "));// місце де ми записуємо файл. Ми беремо дату робимо пуш нового пінга і записуємо файл 
    res.sendStatus(200);
  } else {
    console.log("skipped");
  }
});

function getLastAntennaEPC(database, epc, antenna) {
  return database
    .reverse()
    .find((item) => item.epc === epc && item.antenna === antenna);// взяти останню антену з комбінацією еpc.щоб інгнорувати якщо вони були однакові
}

app.listen(3333, () => console.log("server is working"));
