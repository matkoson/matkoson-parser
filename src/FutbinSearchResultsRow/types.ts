export type FutbinSearchResultsRowStats = {
  playerFutbinUrl: string | null
  playerFutbinId: string | null
  firstName: string | null
  lastName: string | null
  clubName: string | null
  nationName: string | null
  leagueName: string | null
  rating: string | null
  preferredPosition: string | null
  alternativePositions: string[] | null
  revision: string | null
  accelerationType: string | null
  price: string | null
  skillMovesLevel: string | null
  weakFootLevel: string | null
  workRates: {
    attacking: string | null
    defensive: string | null
  } | null
  pace: string | null
  shooting: string | null
  passing: string | null
  dribbling: string | null
  defending: string | null
  physicality: string | null
  height: string | null
  bodyType: string | null
  weight: string | null
}

export type ValidFutbinSearchResultsRowStats = {
  playerFutbinUrl: string
  playerFutbinId: string
  firstName: string
  lastName: string
  clubName: string
  nationName: string
  leagueName: string
  rating: string
  preferredPosition: string
  alternativePositions: string[]
  revision: string
  accelerationType: string
  price: string
  skillMovesLevel: string
  weakFootLevel: string
  workRates: {
    attacking: string
    defensive: string
  }
  pace: string
  shooting: string
  passing: string
  dribbling: string
  defending: string
  physicality: string
  height: string
  bodyType: string
  weight: string
}
