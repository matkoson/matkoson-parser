/* eslint-disable */

import FutbinStatsParser from "./dist/esm/index.js";
// @ts-ignore
import html from "./html/validRow.json" assert { type: "json" };


async function dp() {
  // const playerName = "Kylian Mbappé";
  // const rating = "97";
  const playerName = "Nicolo Barella";
  const rating = "97";

  const futbinStatsParser = new FutbinStatsParser(
    html,
    playerName,
    rating
  );

  const futbinStats = await futbinStatsParser.getStats();
  // futbinStatsParser.debug('textStructure')
  futbinStatsParser.logDebug('elementsWithProperties', [
    'a',
    'img',
  ])


  console.log(futbinStatsParser.lastLogMessage)
  console.log(JSON.stringify(futbinStats, null, 2))
}

dp();


