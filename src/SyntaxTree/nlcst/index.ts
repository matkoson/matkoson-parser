import type { Sentence, Paragraph, Text, Word } from 'nlcst'

export type TextStructure = {
  length: {
    paragraphs: number
    sentences: number
    words: number
    texts: number
  }
  structure: {
    paragraphs: string[][]
    sentences: string[][]
    words: string[][]
    texts: string[]
  }
}

export type Structures = [
  paragraphs: string[][],
  sentences: string[][],
  words: string[][],
  texts: string[]
]

class NlcstParser {
  private getParagraphs = (paragraphNodes: Paragraph[]) => {
    /*
     * > SentenceNode[]
     * >> WordNode[]
     * >>> TextNode[]
     * >>>> string[]
     * */
    /* ParagraphNode.children => { type: 'SentenceNode' }[].forEach(sentenceNode => parseSentenceNode(sentenceNode)) */
    const paragraphs = paragraphNodes.map((paragraphNode) => {
      const paragraphTexts: string[] = []
      paragraphNode.children.forEach((paragraphContentNode) => {
        if (paragraphContentNode.type === 'SentenceNode') {
          const sentenceNode = paragraphContentNode
          sentenceNode.children.forEach((sentenceContentNode) => {
            if (sentenceContentNode.type === 'WordNode') {
              const wordNode = sentenceContentNode
              wordNode.children.forEach((wordContentNode) => {
                if (wordContentNode.type === 'TextNode') {
                  const textNode = wordContentNode
                  paragraphTexts.push(textNode.value)
                }
              })
            }
          })
        }
      })
      return paragraphTexts
    })

    return paragraphs
  }
  private getSentences = (sentenceNodes: Sentence[]) => {
    /*
     * >> WordNode[]
     * >>> TextNode[]
     * >>>> string[]
     * */
    /* SentenceNode.children => { type: 'WordNode' }[].forEach(wordNode => parseWordNode(wordNode)) */
    const sentences = sentenceNodes.map((sentenceNode) => {
      const sentenceTexts: string[] = []
      sentenceNode.children.forEach((sentenceContentNode) => {
        if (sentenceContentNode.type === 'WordNode') {
          const wordNode = sentenceContentNode
          wordNode.children.forEach((wordContentNode) => {
            if (wordContentNode.type === 'TextNode') {
              const textNode = wordContentNode
              sentenceTexts.push(textNode.value)
            }
          })
        }
      })
      return sentenceTexts
    })

    return sentences
  }
  private getWords = (wordNodes: Word[]) => {
    /*
     * >>> TextNode[]
     * >>>> string[]
     * */
    /* WordNode.children => { type: 'TextNode' }[].forEach(textNode => parseTextNode(textNode)) */
    const words = wordNodes.map((wordNode) => {
      const wordTexts: string[] = []
      wordNode.children.forEach((wordContentNode) => {
        if (wordContentNode.type === 'TextNode') {
          const textNode = wordContentNode
          wordTexts.push(textNode.value)
        }
      })
      return wordTexts
    })

    return words
  }
  private getTexts = (textNodes: Text[]) => {
    /*
     * >>>> string[]
     * */
    /* TextNode => textNode.value */
    const texts = textNodes.map((textNode) => {
      return textNode.value
    })

    return texts
  }
  private extractSentenceNodes = (paragraphNodes: Paragraph[]): Sentence[] => {
    const sentenceNodes: Sentence[] = []
    paragraphNodes.forEach((paragraphNode) => {
      paragraphNode.children.forEach((childNode) => {
        if (childNode.type === 'SentenceNode') {
          sentenceNodes.push(childNode)
        }
      })
    })
    if (!sentenceNodes.length) {
      throw new Error()
    }
    return sentenceNodes
  }
  private extractWordNodes = (sentenceNodes: Sentence[]): Word[] => {
    const wordNodes: Word[] = []
    sentenceNodes.forEach((sentenceNode) => {
      sentenceNode.children.forEach((childNode) => {
        if (childNode.type === 'WordNode') {
          wordNodes.push(childNode)
        }
      })
    })
    if (!wordNodes.length) {
      throw new Error()
    }
    return wordNodes
  }
  private extractTextNodes = (wordNodes: Word[]): Text[] => {
    const textNodes: Text[] = []
    wordNodes.forEach((wordNode) => {
      wordNode.children.forEach((childNode) => {
        if (childNode.type === 'TextNode') {
          textNodes.push(childNode)
        }
      })
    })
    if (!textNodes.length) {
      throw new Error()
    }
    return textNodes
  }

  parse = (
    paragraphNodes: Paragraph[]
  ): [
    paragraphs: string[][],
    sentences: string[][],
    words: string[][],
    texts: string[]
  ] => {
    /*
     * > SentenceNode[]
     * >> WordNode[]
     * >>> TextNode[]
     * >>>> string[]
     * */
    /* ParagraphNode.children => { type: 'SentenceNode' }[].forEach(sentenceNode => parseSentenceNode(sentenceNode)) */
    const sentenceNodes: Sentence[] = this.extractSentenceNodes(paragraphNodes)
    if (!sentenceNodes.length) {
      throw new Error()
    }
    const wordNodes: Word[] = this.extractWordNodes(sentenceNodes)
    if (!wordNodes.length) {
      throw new Error()
    }
    const textNodes: Text[] = this.extractTextNodes(wordNodes)
    if (!textNodes.length) {
      throw new Error()
    }

    const paragraphs: string[][] = this.getParagraphs(paragraphNodes)
    const sentences: string[][] = this.getSentences(sentenceNodes)
    const words: string[][] = this.getWords(wordNodes)
    const texts: string[] = this.getTexts(textNodes)

    const structures: Structures = [paragraphs, sentences, words, texts]

    return structures
  }
}

export default NlcstParser
