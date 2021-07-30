/*
 * @Author: Cphayim
 * @Date: 2021-06-18 00:52:24
 * @Description: 日志
 */

import readline from 'readline'
import chalk from 'chalk'
import ora, { Ora } from 'ora'

import './type'
import { chalkTag, format, inspect } from './utils'

type LevelKey = typeof process.env.LOGGER_LEVEL
type LevelValue = number

const enum Label {
  verbose = ' VER ',
  debug = ' DEB ',
  info = ' INFO ',
  done = ' DONE ',
  warn = ' WARN ',
  error = ' ERR ',
}

export const levelMap: Record<LevelKey, LevelValue> = {
  verbose: 1,
  info: 10,
  notice: 100,
  warn: 1_000,
  error: 10_000,
  silent: 100_000,
}

const DEFAULT_LEVEL: LevelKey = 'info'

let levelValue: LevelValue
setLevel(process.env.LOGGER_LEVEL)

export function setLevel(level: LevelKey): void {
  levelValue = normalizeLevelValue(level)
}

function normalizeLevelValue(level: LevelKey) {
  return levelMap[level] ? levelMap[level] : levelMap[DEFAULT_LEVEL]
}

export function verbose(message: unknown, tag = ''): void {
  message = inspect(message)
  const label = chalk.bgWhite.black(Label.verbose) + chalkTag(tag)
  log(format(label, message), 'verbose')
}

export function debug(message: unknown, tag = ''): void {
  message = inspect(message)
  const label = chalk.bgMagenta.black(Label.debug) + chalkTag(tag)
  log(format(label, message), 'verbose')
}

export function info(message: unknown, tag = ''): void {
  message = inspect(message)
  const label = chalk.bgBlue.black(Label.info) + chalkTag(tag)
  log(format(label, message), 'info')
}

export function done(message: unknown, tag = '', plain = false): void {
  message = inspect(message)
  const label = chalk.bgGreen.black(Label.done) + chalkTag(tag)
  message = plain ? message : chalk.green(message)
  log(format(label, message), 'notice')
}

export function warn(message: unknown, tag = '', plain = false): void {
  message = inspect(message)
  const label = chalk.bgYellow.black(Label.warn) + chalkTag(tag)
  message = plain ? message : chalk.yellow(message)
  log(format(label, message), 'warn')
}

export function error(message: unknown, tag = '', plain = false): void {
  message = inspect(message)
  const label = chalk.bgRed.black(Label.error) + chalkTag(tag)
  message = plain ? message : chalk.red(message)
  log(format(label, message), 'error')
}

export function log(message: unknown, level: LevelKey = 'info'): void {
  // 防止干扰，输出其它 log 时停用全局的 loading
  stopLoading()
  // 低于 levelValue 级别的日志将不会打印
  if (normalizeLevelValue(level) < levelValue) return
  console.log(message)
}

// 全局 loading
let loading: ora.Ora | null = null
export function startLoading(options: string | ora.Options): ora.Ora {
  stopLoading()
  loading = ora(options).start()
  return loading
}
export function stopLoading(): void {
  if (loading) loading.stop()
}

export function clearConsole(title = ''): void {
  // 仅在 tty 终端下清屏 (macOS/linux)
  if (!process.stdout.isTTY) return
  const blank = '\n'.repeat(process.stdout.rows)
  console.log(blank)
  readline.cursorTo(process.stdout, 0, 0)
  readline.clearScreenDown(process.stdout)
  if (title) console.log(title)
}

export function createSpinner(message: string): Spinner {
  return new Spinner(message)
}

class Spinner {
  private s: Ora
  private state: 'pending' | 'done' | 'fail'
  constructor(message: string) {
    this.s = ora().start(message)
    this.state = 'pending'
  }
  done(message: string) {
    if (this.state !== 'pending') return
    this.stop()
    this.state = 'done'
    if (message) log(chalk.green(`✔ ${message}`))
  }

  fail(message: string) {
    if (this.state !== 'pending') return
    this.stop()
    this.state = 'fail'
    if (message) log(chalk.red(`✘ ${message}`))
  }

  stop() {
    this.s.stop()
  }
}
