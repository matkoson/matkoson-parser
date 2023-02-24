import { Element } from 'hast'

export type ElementWithProperties = Element & {
  properties: { [key: string]: any }
}

export type LogOptions =
  | 'defaultTree'
  | 'nlcstTree'
  | 'elementsWithClassNames'
  | 'elementsWithProperties'
  | 'textStructure'
  | 'nlcstTreeRaw'
  | 'defaultTreeRaw'
  | 'allDivs'
  | 'rawHtml'

export type TagNameOptions = 'i' | 'div' | 'img' | 'a' | 'span'

export type GetElementsWithProperties = TagNameOptions | TagNameOptions[] | null
