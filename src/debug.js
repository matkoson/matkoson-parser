/* eslint-disable */

import Parser from "../dist/esm/index.js";
// @ts-ignore
import html from "../debug/html/validRow.json" assert { type: "json" };


const failures = [
  ["Charlie Kelman", "60"],
  ["Ross Tierney", "60"],
  // no price, "wrong piece of data interpreted as price"
  ["Yanic Wildschut", "65"]
  // no price, "wrong piece of data interpreted as price"
  ["Sirlord Conteh", "65"]
  // no price, "wrong piece of data interpreted as price"
  ["Alexis Sabella", "65"]
  // all null
  ["Nico Antonitsch", "65"]
  // all null, I have no way of handing three-part names
  ["Jin Ya Kim", "66"]
];

async function debug() {
  // const playerName = "Kylian Mbappé";
  // const rating = "97";
  const playerName = "Mehdi Taremi";
  const rating = "81";

  const futbinStatsParser = new Parser(
    html,
    playerName,
    rating
  );
  const logDebug = futbinStatsParser.logDebug;

  const futbinStats = futbinStatsParser.getStats();
  // futbinStatsParser.debug('textStructure')
  // logDebug('elementsWithProperties', [
  //   'a',
  //   'img',
  // ])
  logDebug("defaultTreeRaw");
  logDebug("rawHtml");
  logDebug("elementsWithProperties", ["a", "img"]);
  logDebug("textStructure");


  console.log(futbinStatsParser.lastLogMessage);
  console.log(JSON.stringify(futbinStats, null, 2));
}

debug();


