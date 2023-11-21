import * as fs from 'node:fs'

import Parser from '../dist/esm/index.js'

// eslint-disable-next-line id-length
const compareStrings = (a, b) => {
  const regex = /\D/

  // Check if either a or b contains a non-digit
  const aHasNonDigit = regex.test(a)
  const bHasNonDigit = regex.test(b)

  if (aHasNonDigit && !bHasNonDigit) {
    return -1
  } else if (!aHasNonDigit && bHasNonDigit) {
    return 1
  }
  return a.localeCompare(b)
}

const dir = process.cwd()
const twitterTrendsHtml = fs.readFileSync(
  `${dir}/cli/twitterTrends.html`,
  'utf8',
  (err, htmlContent) => {
    if (err) {
      console.error(err)
      return ''
    }
    return htmlContent
  }
)

// eslint-disable-next-line func-style
function parseHtml(html) {
  const htmlParser = new Parser(html)
  const { logDebug } = htmlParser
  // console.log('htmlParser', htmlParser)

  const fullStructure = htmlParser.getFullStructure()
  console.log('fullStructure', fullStructure)
  const { paragraphs } = fullStructure.structure
  console.log('paragraphs', paragraphs)
  const { sentences } = fullStructure.structure
  console.log('sentences', sentences)
  const { words } = fullStructure.structure
  console.log('words', words)

  const { texts } = fullStructure.structure

  const cleanUpTrendStructure = (paragraphsArray) => {
    const blackList = [
      ['Trends', 'for', 'you'],
      ['Show', 'more'],
    ]

    const meaningfulParagraphs = paragraphsArray.filter((paragraph) => {
      return !blackList.some((blacklistedParagraph) => {
        return (
          JSON.stringify(blacklistedParagraph) === JSON.stringify(paragraph)
        )
      })
    })

    return meaningfulParagraphs
  }

  const cleanParagraphs = cleanUpTrendStructure(paragraphs)
  console.log('cleanParagraphs', cleanParagraphs)

  const trendsWithCategories = []
  const extractTrendsInCategories = (paragraphsArray) => {
    let trend = { category: '', description: [], tweets: [] }
    const uselessWords = ['in']

    /* Add custom category for trends without specified one. */

    paragraphsArray.forEach((paragraph) => {
      paragraph = paragraph.filter((word) => {
        return !uselessWords.includes(word)
      })

      const isFirst = trend.category === ''
      if (isFirst) {
        trend.category = paragraph
        return
      }
      const hasTrading = paragraph.includes('Trending')

      if (hasTrading) {
        trendsWithCategories.push(trend)
        trend = { category: '', description: [] }

        const withoutSpecificCategory =
          JSON.stringify(paragraph) === JSON.stringify(['Trending'])

        if (withoutSpecificCategory) {
          paragraph = ['Phrase', 'Trending']
        }

        trend.category = paragraph.sort()
      } else if (paragraph.includes('Tweets')) {
        trend.tweets = paragraph
          .filter((word) => {
            return word !== 'Tweets'
          })
          // eslint-disable-next-line id-length
          .sort(compareStrings)
      } else {
        trend.description = [...trend.description, ...paragraph]
      }
    })
  }

  extractTrendsInCategories(cleanParagraphs)
  console.log('trendsWithCategories', trendsWithCategories)

  // const textStructure = htmlParser.getTextStructure()
  // console.log('textStructure', textStructure)

  // const futbinStats = htmlParser.getStats()
  // futbinStatsParser.debug('textStructure')
  // logDebug('elementsWithProperties', [
  //   'a',
  //   'img',
  // ])
  // logDebug('defaultTreeRaw')
  // logDebug('rawHtml')
  // logDebug('elementsWithProperties', ['a', 'img'])
  // logDebug('textStructure')
  //
  // console.log(JSON.stringify(futbinStats, null, 2))
}

if (!twitterTrendsHtml) {
  console.error('No html content received!')
  process.exit(1)
}

parseHtml(twitterTrendsHtml)
