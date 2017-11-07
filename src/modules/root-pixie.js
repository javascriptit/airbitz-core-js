// @flow
import type { AbcContext } from 'airbitz-core-types'
import { combinePixies, filterPixie } from 'redux-pixies'

import { contextApiPixie } from './context/context-api-pixie.js'
import type { CurrencyOutput } from './currency/currency-pixie.js'
import currency from './currency/currency-pixie.js'
import type { ExchangeOutput } from './exchange/exchange-pixie.js'
import exchange from './exchange/exchange-pixie.js'
import { makeApiProps } from './root.js'
import type { ScryptOutput } from './scrypt/scrypt-pixie.js'
import scrypt from './scrypt/scrypt-pixie.js'

// The top-level pixie output structure:
export interface RootOutput {
  contextApi: AbcContext;
  currency: CurrencyOutput;
  exchange: ExchangeOutput;
  scrypt: ScryptOutput;
}

export const rootPixie = combinePixies({
  contextApi: filterPixie(contextApiPixie, makeApiProps),
  currency,
  exchange,
  scrypt
})
