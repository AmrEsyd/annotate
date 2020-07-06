import prettyMilliseconds from 'pretty-ms'

const prettyMillisecondsOptions: prettyMilliseconds.Options = {
  compact: true,
  secondsDecimalDigits: 0,
}

export const getTimeFromNow = (ms?: number | null) => {
  return ms
    ? prettyMilliseconds(Date.now() - ms, prettyMillisecondsOptions) + ' ago'
    : null
}
