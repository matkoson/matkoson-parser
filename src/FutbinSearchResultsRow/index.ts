/* Uses hast, to perform specific business logic, i.e. Futbin stats analysis. */

import Hast, { ElementWithProperties, LogOption } from '../Hast/index.js'

import { FutbinSearchResultsRowStats } from './types.js'
import { defaultFutbinSearchResultsRowStats } from './default.js'

class FutbinSearchResultsRowStatsParser {
  private hast: Hast
  private playerName: string
  private isNameGlued = false
  private rating: string
  private futbinStats: FutbinSearchResultsRowStats =
    defaultFutbinSearchResultsRowStats
  lastLogMessage = ''

  constructor(html: string, playerName: string, rating: string) {
    this.hast = new Hast(html)
    this.playerName = playerName
    this.rating = rating
  }

  getNameAndRating = (element: ElementWithProperties[]) => {
    const [firstName, lastName, rating] = (
      element[0]?.properties.alt as string
    ).split(' ')

    this.futbinStats.firstName = firstName
    this.futbinStats.lastName = lastName
    this.futbinStats.rating = rating
  }

  getPlayerUrl = (element: ElementWithProperties[]) => {
    this.futbinStats.playerFutbinUrl = element[1].properties?.href || null
  }

  getTeamName = (element: ElementWithProperties[]) => {
    const teamName = element[3].properties?.dataOriginalTitle || null

    this.futbinStats.clubName = teamName
  }
  getLeagueName = (elements: ElementWithProperties[]) => {
    const leagueName = elements[7].properties?.dataOriginalTitle || null

    this.futbinStats.leagueName = leagueName
  }
  getNationName = (elements: ElementWithProperties[]) => {
    const nationName = elements[5].properties?.dataOriginalTitle || null

    this.futbinStats.nationName = nationName
  }
  getPlayerFutbinId = (elements: ElementWithProperties[]) => {
    const playerFutbinId = elements[1].properties?.dataSiteId || null

    this.futbinStats.playerFutbinId = playerFutbinId
  }

  getHeight = (words: string[][]) => {
    const regex = /(\d+)/
    const rawHeight = words[19].join()
    const match = rawHeight.match(regex)

    if (match && match.length > 1) {
      const number = parseInt(match[1], 10)
      this.futbinStats.height = String(number)
      return
    }
    console.error('Could not extract height from: ', rawHeight)
    this.futbinStats.height = null
  }
  getWeight = (words: string[][]) => {
    const regex = /(\d+)/
    const rawHeight = words[19].join()
    const match = rawHeight.match(regex)

    if (match && match.length > 1) {
      const number = parseInt(match[1], 10)
      this.futbinStats.weight = String(number)
      return
    }
    console.error('Could not extract weight from: ', rawHeight)
    this.futbinStats.weight = null
  }

  logResult = () => {
    let logMessage = ''
    const notScrapped: string[] = []
    const playerIdentifiers = `${this.playerName} ${this.rating}`

    if (!Object.values(this.futbinStats).filter(Boolean).length) {
      logMessage = `[🔴 PARSER FINISHED]: ${playerIdentifiers}: Futbin stats are empty. Scrapping failed.`
      console.error(logMessage)
    } else if (
      Object.values(this.futbinStats).filter((futbinValue, index) => {
        if (!futbinValue) {
          notScrapped.push(Object.keys(this.futbinStats)[index])
          return false
        }
        return true
      }).length !== Object.values(this.futbinStats).length
    ) {
      logMessage = `[🟡 PARSER FINISHED]: ${playerIdentifiers}: Futbin stats are incomplete. Something went wrong.`
      const secondPart = `[🟡 NOT SCRAPPED]: ${JSON.stringify(
        notScrapped,
        null,
        2
      )}`
      console.warn(`${logMessage}\n${secondPart}`)
    } else if (
      Object.values(this.futbinStats).filter(Boolean).length ===
      Object.values(this.futbinStats).length
    ) {
      logMessage = `[🟢 PARSER FINISHED]: ${playerIdentifiers}: Futbin stats are complete. Scrapping succeeded! 🎉🎉🎉`
      console.log(logMessage)
    }

    this.lastLogMessage = logMessage
  }

  public getDebugTextStructure = (): string | null => {
    if (!this.hast) {
      console.error(
        '[🔴 PARSER]: Hast is not initialized. Cant get text structure.'
      )
      return null
    }
    console.log('[🟦 DEBUG]: PARSER: returning text structure.')
    return JSON.stringify(this.hast.getFullStructure(), null, 2)
  }

  public logDebug = (logOption: LogOption, args?: unknown) => {
    if (!this.hast) {
      console.error('[🔴 PARSER]: Hast is not initialized. Cant debug.')
    }
    this.hast.print(logOption, args)
  }

  /* TODO:
   * - 1. extract player image url
   * - 2. extract nationality image url
   * - 3. extract club image url
   * */
  public getStats = (): FutbinSearchResultsRowStats => {
    const anchorsImagesWithProperties = this.hast.getElementsWithProperties([
      'a',
      'img',
    ])
    const { texts, paragraphs, sentences, words } = this.hast.getTextStructure()

    this.isNameGlued =
      sentences[0][0].length > 10 &&
      words[0][0].length > 10 &&
      texts[0].length > 10

    this.getPlayerUrl(anchorsImagesWithProperties)
    this.getNameAndRating(anchorsImagesWithProperties)
    if (this.isNameGlued) {
      this.futbinStats.rating = texts[1]
    }
    this.getTeamName(anchorsImagesWithProperties)
    this.getLeagueName(anchorsImagesWithProperties)
    this.getNationName(anchorsImagesWithProperties)
    this.getPlayerFutbinId(anchorsImagesWithProperties)

    this.futbinStats.preferredPosition = paragraphs[2]?.join() || null
    this.futbinStats.alternativePositions = paragraphs[3]
    this.futbinStats.revision = texts[5]
    this.futbinStats.accelerationType = texts[6]
    if (this.isNameGlued) {
      this.futbinStats.accelerationType = sentences[4].join()
    }
    this.futbinStats.price = paragraphs[6]?.join() || null
    if (this.isNameGlued) {
      this.futbinStats.price = sentences[5].join()
    }
    if (
      this.futbinStats?.price?.length &&
      this.futbinStats?.price?.length > 6
    ) {
      console.error(
        `[🔴 PARSER ERROR]: ${this.playerName}: WRONG PIECE OF DATA INTERPRETED AS PRICE!`
      )
      this.futbinStats.price = null
    }
    this.futbinStats.skillMovesLevel = words[9]?.join() || null
    this.futbinStats.weakFootLevel = words[10]?.join() || null
    this.futbinStats.workRates = {
      attacking: words[11]?.join() || null,
      defensive: words[12]?.join() || null,
    }
    this.futbinStats.pace = words[13]?.join() || null
    this.futbinStats.shooting = words[14]?.join() || null
    this.futbinStats.passing = words[15]?.join() || null
    this.futbinStats.dribbling = words[16]?.join() || null
    this.futbinStats.defending = words[17]?.join() || null
    this.futbinStats.physicality = words[18]?.join() || null
    this.getHeight(words)
    this.futbinStats.bodyType = words[21]?.join() || null
    this.getWeight(words)
    this.logResult()

    return this.futbinStats
  }
}

export default FutbinSearchResultsRowStatsParser
