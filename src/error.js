/*
 * These are errors the core knows about.
 *
 * The GUI should handle these errors in an "intelligent" way, such as by
 * displaying a localized error message or asking the user for more info.
 * All these errors have a `type` field, which the GUI can use to select
 * the appropriate response.
 *
 * Other errors are possible, of course, since the Javascript language
 * itself can generate exceptions. Those errors won't have a `type` field,
 * and the GUI should just show them with a stack trace & generic message,
 * since the program has basically crashed at that point.
 */

/**
 * Could not reach the server at all.
 */
export function NetworkError (message) {
  const e = new Error(message || 'Cannot reach the network')
  e.name = e.type = NetworkError.name
  return e
}
NetworkError.type = NetworkError.name

/**
 * The endpoint on the server is obsolete, and the app needs to be upgraded.
 */
export function ObsoleteApiError (message) {
  const e = new Error(message || 'The application is too old. Please upgrade.')
  e.name = e.type = ObsoleteApiError.name
  return e
}
ObsoleteApiError.type = ObsoleteApiError.name

/**
 * Cannot find a login with that id.
 *
 * Reasons could include:
 * - Password login: wrong username
 * - PIN login: wrong PIN key
 * - Recovery login: wrong username, or wrong recovery key
 */
export function UsernameError (message) {
  const e = new Error(message || 'Invalid username')
  e.name = e.type = UsernameError.name
  return e
}
UsernameError.type = UsernameError.name

/**
 * The provided authentication is incorrect.
 *
 * Reasons could include:
 * - Password login: wrong password
 * - PIN login: wrong PIN
 * - Recovery login: wrong answers
 *
 * The error object may include a `wait` member,
 * which is the number of seconds the user must wait before trying again.
 */
export function PasswordError (resultsJson = {}, message) {
  const e = new Error(message || 'Invalid password')
  e.name = e.type = PasswordError.name
  e.wait = resultsJson.wait_seconds
  return e
}
PasswordError.type = PasswordError.name

/**
 * The OTP token was missing / incorrect.
 *
 * The error object should include a `resetToken` member,
 * which can be used to reset OTP protection on the account.
 *
 * The error object may include a `resetDate` member,
 * which indicates that an OTP reset is already pending,
 * and when it will complete.
 */
export function OtpError (resultsJson = {}, message) {
  const e = new Error(message || 'Invalid OTP token')
  e.name = e.type = OtpError.name
  e.resetToken = resultsJson.otp_reset_auth
  if (resultsJson.otp_timeout_date != null) {
    e.resetDate = new Date(1000 * resultsJson.otp_timeout_date)
  }
  return e
}
OtpError.type = OtpError.name
