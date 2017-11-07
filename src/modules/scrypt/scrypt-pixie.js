// @flow
import type { PixieInput } from 'redux-pixies'
import { combinePixies, stopUpdates } from 'redux-pixies'

import { serialize } from '../../util/decorators.js'
import { base16 } from '../../util/encoding.js'
import type { RootProps } from '../root.js'

export type JsonSnrp = {
  salt_hex: string,
  n: number,
  r: number,
  p: number
}

export interface ScryptOutput {
  makeSnrp(targetMs: number): Promise<JsonSnrp>;
  timeScrypt(
    data: Uint8Array,
    snrp: JsonSnrp,
    dklen?: number
  ): Promise<{ hash: Uint8Array, time: number }>;
}

export function calcSnrpForTarget (
  salt: Uint8Array,
  benchMs: number,
  targetMs: number
): JsonSnrp {
  const snrp = {
    salt_hex: base16.stringify(salt),
    n: 16384,
    r: 1,
    p: 1
  }

  if (benchMs === 0) {
    snrp.n = 131072
    snrp.r = 8
    snrp.p = 64
    return snrp
  }

  let estTargetTimeElapsed = benchMs
  let nUnPowered = 0
  const r = targetMs / estTargetTimeElapsed
  if (r > 8) {
    snrp.r = 8

    estTargetTimeElapsed *= 8
    const n = targetMs / estTargetTimeElapsed

    if (n > 4) {
      nUnPowered = 4

      estTargetTimeElapsed *= 4
      const p = targetMs / estTargetTimeElapsed
      snrp.p = Math.floor(p)
    } else {
      nUnPowered = Math.floor(n)
    }
  } else {
    snrp.r = r > 4 ? Math.floor(r) : 4
  }
  nUnPowered = nUnPowered >= 1 ? nUnPowered : 1
  snrp.n = Math.pow(2, nUnPowered + 13)

  return snrp
}

export default combinePixies({
  makeSnrp: (input: PixieInput<RootProps>) => () => {
    const { io } = input.props
    let benchmark: Promise<number>

    function makeSnrp (targetMs: number) {
      // Run the benchmark if needed:
      if (benchmark == null) {
        benchmark = input.props.output.scrypt
          .timeScrypt(new Uint8Array(0), {
            salt_hex: '00000000000000000000000000000000',
            n: 16384,
            r: 1,
            p: 1
          })
          .then(result => result.time)
      }

      // Calculate an SNRP value:
      return benchmark.then(benchMs => {
        const snrp = calcSnrpForTarget(io.random(32), benchMs, targetMs)
        io.console.info(
          `snrp: ${snrp.n} ${snrp.r} ${snrp.p} based on ${benchMs}ms benchmark`
        )
        return snrp
      })
    }

    input.onOutput(makeSnrp)
    return stopUpdates
  },

  timeScrypt: (input: PixieInput<RootProps>) => () => {
    const { io } = input.props

    // Find the best timer on this plaform:
    const getTime =
      typeof window !== 'undefined' &&
      window.performance &&
      typeof window.performance.now === 'function'
        ? () => window.performance.now()
        : () => Date.now()

    // Performs an scrypt calculation, recording the elapsed time:
    function timeScrypt (
      data: Uint8Array,
      snrp: JsonSnrp,
      dklen: number = 32
    ): Promise<{ hash: Uint8Array, time: number }> {
      const salt = base16.parse(snrp.salt_hex)
      const startTime = getTime()
      console.info('starting scrypt')
      return io.scrypt(data, salt, snrp.n, snrp.r, snrp.p, dklen).then(hash => {
        const time = getTime() - startTime
        console.info(`finished scrypt in ${time}ms`)
        return { hash, time }
      })
    }

    // We only allow one scrypt calculation to occur at once:
    input.onOutput(serialize(timeScrypt))
    return stopUpdates
  }
})
