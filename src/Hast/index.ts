import path from 'node:path'

import { fromHtml } from 'hast-util-from-html'
import {
  matches,
  select as hastSelect,
  selectAll as hastSelectAll,
} from 'hast-util-select'
import { classnames } from 'hast-util-classnames'
import { inspect } from 'unist-util-inspect'
// eslint-disable-next-line import/no-unresolved
import { Element, ElementContent, Root } from 'hast'
import { toString } from 'nlcst-to-string'
import { toMarkdown } from 'mdast-util-to-markdown'
import { remove as removeNodesOfType } from 'unist-util-remove'
import { toNlcst } from 'hast-util-to-nlcst'
import { VFile } from 'vfile'
import flatFilter from 'unist-util-flat-filter'
import { filter } from 'unist-util-filter'
import { recursiveReduce as recursiveReduceTree } from 'unist-util-reduce'
import { ParseEnglish } from 'parse-english'
import type { Paragraph, Root as NlcstRoot, Text } from 'nlcst'
import type { Node } from 'unist'

import { getTimestamp } from '../utils/getTimestamp.js'
import { getErrorLocation } from '../utils/getErrorLocation.js'

import NlcstParser, { TextStructure } from './nlcst/index.js'

export type ElementWithProperties = Element & {
  properties: { [key: string]: any }
}

export type LogOption =
  | 'defaultTree'
  | 'nlcstTree'
  | 'elementsWithClassNames'
  | 'elementsWithProperties'
  | 'textStructure'
  | 'nlcstTreeRaw'
  | 'defaultTreeRaw'
  | 'allDivs'
  | 'rawHtml'

type TagName = 'i' | 'div' | 'img' | 'a' | 'span'

type GetElementsWithProperties = TagName | TagName[] | null

class Hast {
  private tree: Root
  private inspect = inspect
  private classnames = classnames
  private matches = matches
  private _selectAll = hastSelectAll
  private _select = hastSelect
  static toString = toString
  static toMarkdown = toMarkdown
  static flatFilter = flatFilter
  rawHtml: string
  defaultTree: Root
  defaultTreeRaw: Root
  nlcstTree: NlcstRoot
  nlcstTreeRaw: NlcstRoot
  treeClassNames: Element[]
  treeProperties: ElementWithProperties[]
  textStructure: string | null = null

  constructor(html: string) {
    this.rawHtml = html
    this.tree = fromHtml(html)
    console.info("[🥽  PARSER]: 'fromHtml' parsed the HTML.")
    this.defaultTree = this.makeDefaultTree(this.tree, true)
    // console.info("[🥽  PARSER]: 'fromHtml' parsed the HTML.")
    this.defaultTreeRaw = this.makeDefaultTree(this.tree, false)
    // console.info("[🥽  PARSER]: 'makeDefaultTree' made the default tree raw.")
    this.nlcstTree = this.makeNlcstTree(this.tree, true)
    // console.info("[🥽  PARSER]: 'makeNlcstTree' made the nlcst tree.")
    this.nlcstTreeRaw = this.makeNlcstTree(this.tree, false)
    // console.info("[🥽  PARSER]: 'makeNlcstTree' made the nlcst tree raw.")
    this.treeProperties = this.extractElementsWithProperties(
      this.defaultTreeRaw
    )
    // console.info(
    // "[🥽  PARSER]: 'extractElementsWithProperties' extracted the elements with properties."
    // )
    this.treeClassNames = this.extractElementsWithClassNames(
      this.defaultTreeRaw
    )
    // console.info(
    //   "[🥽  PARSER]: 'extractElementsWithClassNames' extracted the elements with class names."
    // )
  }

  private createHastError = (error: {
    message: string
    stack: Error['stack']
    line: number
  }) => {
    const timestamp = getTimestamp()
    // fs.writeFileSync(`../debugOutput/debug.json`, this.inspect(this.tree))
    return new Error(
      `[🌳 HAST]: at line ${error.line}: ${error.message}, ${
        error.stack
      }, HAST TREE: ${this.inspect(this.tree)}`
    )
  }
  private utils = {
    select: (selector: string, node?: Element): Element => {
      const element = node
        ? this._select(selector, node)
        : this._select(selector, this.tree)

      if (!element) {
        throw this.createHastError({
          message: `No element found with selector: ${selector}`,
          stack: getErrorLocation().stack,
          line: getErrorLocation().line,
        })
      }
      return element
    },

    selectAll: (selector: string, root = this.tree) => {
      const elements = this._selectAll(selector, root)

      if (!elements) {
        throw this.createHastError({
          message: `No element found with selector: ${selector}`,
          stack: getErrorLocation().stack,
          line: getErrorLocation().line,
        })
      }

      return { length: elements.length, elements }
    },

    getClassNames: (node: Element) => {
      return JSON.parse(JSON.stringify(node?.properties?.className))
    },

    isAnchor: (node: ElementContent) => {
      return node?.type === 'element' && node.tagName === 'a'
    },

    isElement: (node: Node) => {
      return node?.type === 'element'
    },
    isText: (node: Node) => {
      return node.type === 'text'
    },
    isSpan: (node: Node) => {
      const isElement = node.type === 'element'
      if (!isElement) {
        return false
      }
      return (node as Element).tagName === 'span'
    },
    isImg: (node: Node) => {
      const isElement = node.type === 'element'
      if (!isElement) {
        return false
      }
      return (node as Element).tagName === 'img'
    },
  }

  private getParagraphNodes = () => {
    const paragraphNodes: Paragraph[] = []

    recursiveReduceTree(this.nlcstTree, (node) => {
      if (node.type === 'ParagraphNode') {
        paragraphNodes.push(node as Paragraph)
      }
      return node
    })
    if (!paragraphNodes.length) {
      throw new Error('No paragraph nodes found')
    }
    return paragraphNodes
  }

  getFullStructure = (): TextStructure => {
    if (this.textStructure) {
      return JSON.parse(this.textStructure)
    }
    const textStructure = this._getTextStructure()

    return textStructure
  }
  getTextStructure = (): TextStructure['structure'] => {
    if (this.textStructure) {
      return JSON.parse(this.textStructure)
        .structure as TextStructure['structure']
    }
    const textStructure = this._getTextStructure()

    return textStructure.structure
  }
  /* Pick<Type, Keys>

interface Todo {
  title: string;
  description: string;
  completed: boolean;
}

type TodoPreview = Pick<Todo, "title" | "completed">;

const todo: TodoPreview = {
  title: "Clean room",
  completed: false,
};

todo;

const todo: TodoPreview
*/
  private _getTextStructure = (): TextStructure => {
    if (this.textStructure) {
      return JSON.parse(this.textStructure)
    }
    const paragraphNodes = this.getParagraphNodes()
    const nlcstParser = new NlcstParser()

    const [paragraphs, sentences, words, texts] =
      nlcstParser.parse(paragraphNodes)
    const textStructure = {
      length: {
        paragraphs: paragraphs.length,
        sentences: sentences.length,
        words: words.length,
        texts: texts.length,
      },
      structure: {
        paragraphs,
        sentences,
        words,
        texts,
      },
    }

    this.textStructure = JSON.stringify(textStructure)

    return textStructure
  }

  private makeNlcstTree = (root: Root, noWhitespace: boolean): NlcstRoot => {
    const file = new VFile({
      path: path.join(`${process.cwd()}/src/debugOutput/nlcstTree.txt`),
      value: '',
    })
    const nlcstTree = toNlcst(root, file, ParseEnglish)
    if (noWhitespace) {
      const noWhitespaceTree = filter(nlcstTree, (node) => {
        return node.type !== 'WhiteSpaceNode' && node.type !== 'PunctuationNode'
      })
      if (!noWhitespaceTree) {
        throw new Error('Removing whitespace from tree went wrong!')
      }
      return noWhitespaceTree
    }

    return nlcstTree
  }
  private makeDefaultTree = (tree: Root, noWhitespace: boolean) => {
    if (noWhitespace) {
      let noWhitespaceTree: Root | null = recursiveReduceTree(tree, (node) => {
        if (node.type === 'text') {
          const text = node as Text
          text.value = text.value.replace(/\s/g, '')
        }
        return node
      })
      noWhitespaceTree = removeNodesOfType(noWhitespaceTree, (node) => {
        if (node.type === 'text') {
          const textNode = node as Text
          return textNode.value === ''
        }
        return false
      })
      if (!noWhitespaceTree) {
        throw new Error('Removing whitespace from tree went wrong!')
      }
      return noWhitespaceTree
    }

    return tree
  }

  private extractElementsWithClassNames = (tree: Root) => {
    const elementsWithClassNames: Element[] = []
    recursiveReduceTree(tree, (node) => {
      if (node.type === 'element') {
        const element = node as Element
        if (element.properties?.className) {
          const elementWithProperties = node as ElementWithProperties
          elementsWithClassNames.push(
            elementWithProperties.properties.className
          )
        }
      }
      return node
    })
    return elementsWithClassNames
  }
  private extractElementsWithProperties = (tree: Root) => {
    const elementsWithProperties: ElementWithProperties[] = []
    recursiveReduceTree(tree, (node) => {
      if (node.type === 'element') {
        const element = node as Element
        if (element.properties) {
          const elementWithProperties = node as ElementWithProperties
          elementsWithProperties.push(elementWithProperties)
        }
      }
      return node
    })
    return elementsWithProperties
  }
  public getElementsWithClassNames = (root = this.tree) => {
    return this.extractElementsWithClassNames(root)
  }
  getElementsWithProperties = (
    tagName: GetElementsWithProperties
  ): ElementWithProperties[] => {
    return this._getElementsWithProperties({ tagName, root: this.tree })
  }

  private _getElementsWithProperties = ({
    tagName,
    root = this.tree,
  }: {
    tagName?: GetElementsWithProperties
    root: Root
  }): ElementWithProperties[] => {
    const elementsWithProperties = this.extractElementsWithProperties(root)
    if (tagName) {
      const filteredElements = elementsWithProperties
        .filter((element) => {
          if (Array.isArray(tagName)) {
            return (tagName as string[]).includes(element?.tagName)
          } else if (tagName) {
            return element.tagName === tagName
          }
          return element.tagName === tagName
        })
        .map((element, index) => {
          return { index, ...element }
        })

      return filteredElements
    }
    return elementsWithProperties
  }
  private inspectTree = (root = this.tree, noWhitespace = false) => {
    return {
      rawHtml: () => {
        return console.log(this.rawHtml)
      },
      nlcst: () => {
        return inspect(this.nlcstTree)
      },
      nlcstRaw: () => {
        return inspect(this.nlcstTreeRaw)
      },
      defaultTree: () => {
        return inspect(this.defaultTree)
      },
      defaultTreeRaw: () => {
        return inspect(this.defaultTreeRaw)
      },
      elementsWithClassNames: () => {
        return this.getElementsWithClassNames(root)
      },
      elementsWithProperties: (tagName?: TagName | TagName[] | null) => {
        return this._getElementsWithProperties({ tagName, root })
      },
      textStructure: () => {
        const { length, structure } = this._getTextStructure()
        const { paragraphs, sentences, words, texts } = structure
        // const space = '\t'
        // const space = '__'
        const printStructure = (structure: any, name: string) => {
          console.log(`\n[ ${name.toUpperCase()}:START ]\n`)
          const replacer = (key: string, value: any) => {
            if (Array.isArray(value)) {
              return value
            }
            return value
          }

          const jsonString = JSON.stringify(structure, replacer, 2)
          const parsedJson = JSON.parse(jsonString)

          parsedJson.forEach((item: any, index: number) => {
            console.log(`${index}: ${typeof item}: ${item}`)
          })

          console.log(`\n[ ${name.toUpperCase()}:END ]\n`)
        }

        console.log(`\n[ LENGTH:START ]\n`)
        console.log(JSON.stringify(length, null, 2))
        console.log(`\n[ LENGTH:END ]\n`)
        printStructure(paragraphs, 'paragraphs')
        printStructure(sentences, 'sentences')
        printStructure(words, 'words')
        printStructure(texts, 'texts')
      },
      allDivs: () => {
        return this.utils.selectAll('div', root)
      },
    }
  }
  public print = (logOption: LogOption, args?: unknown) => {
    if (!this.tree) {
      throw new Error('No tree found')
    }

    switch (logOption) {
      case 'rawHtml':
        console.log(this.inspectTree().rawHtml)
        break
      case 'defaultTree':
        console.log(this.inspectTree().defaultTree)
        break
      case 'defaultTreeRaw':
        console.log(this.inspectTree().defaultTreeRaw)
        break
      case 'nlcstTree':
        console.log(this.inspectTree().nlcst)
        break
      case 'nlcstTreeRaw':
        console.log(this.inspectTree().nlcstRaw)
        break
      case 'elementsWithClassNames':
        console.log(this.inspectTree().elementsWithClassNames)
        break
      case 'elementsWithProperties':
        console.log(
          this.inspectTree().elementsWithProperties(
            args as GetElementsWithProperties
          )
        )
        break
      case 'textStructure':
        this.inspectTree().textStructure()
        break
      case 'allDivs':
        console.log(this.inspectTree().allDivs)
        break
      default:
        break
    }
  }
}

export default Hast
