// @flow
import { buildReducer } from 'redux-keto'

import type { FixedIo } from '../io/fixIo.js'
import type { RootAction } from './actions.js'
import type { CurrencyState } from './currency/currency-reducer.js'
import currency from './currency/currency-reducer.js'
import exchangeCache from './exchange/reducer.js'
import type { LoginState } from './login/login-reducer.js'
import login from './login/login-reducer.js'
import storageWallets from './storage/reducer.js'

export interface RootState {
  currency: CurrencyState;
  io: FixedIo;
  login: LoginState;
}

function io (state = {}, action: RootAction) {
  return action.type === 'INIT' ? action.payload.io : state
}

function onError (state = () => {}, action: RootAction) {
  return action.type === 'INIT' ? action.payload.onError : state
}

export default buildReducer({
  currency,
  exchangeCache,
  io,
  login,
  onError,
  storageWallets
})
