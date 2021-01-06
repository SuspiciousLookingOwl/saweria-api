# Changelog
All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [1.2.5] - 2021-01-07
### Changed
- Use Node.js built-in EventEmitter

## [1.2.4] - 2020-11-09
### Changed
- `donation` event renamed to `donations`

## [1.2.3] - 2020-11-09
### Fixed
- `donation` event now emits array of donations

## [1.2.2] - 2020-10-23
### Fixed
- Changed README only 

## [1.2.1] - 2020-10-23
### Added
- Add `getUser()`

### Changed
- `setJWT()` is changed to `login()` by passing only one parameter instead of two or three.


## [1.2.0] - 2020-10-21
### Added
- Add `sendFakeDonation()`
- Add `setStreamKey()`

### Changed
- `otp` on login is now optional
- Donation amount type is now number instead of string
- Eventsource now closed when calling `logout()`

## [1.1.0] - 2020-09-29
### Added
- Add support for login with otp
- Add event listener using `.on()`

## [1.0.0] - 2020-09-16
### Added
- Add `getLeaderboard()`
- Add `getMilestoneProgress()`

### Changed
- Changed `setJwt()` to `setJWT()`