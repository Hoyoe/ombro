import readline from 'readline'

describe('@ombro/logger -> logger.ts -> log', () => {
  const CONTENT = 'content'
  const TAG = 'tag'
  const OBJECT_CONTENT = {
    name: 'xxx',
    age: 100,
  }

  let logger: typeof import('../logger')

  beforeAll(async () => {
    jest.spyOn(console, 'log').mockImplementation(() => void 0)
    logger = await import('../logger')
  })

  afterEach(() => {
    jest.resetAllMocks()
  })

  afterAll(() => {
    jest.restoreAllMocks()
    jest.resetModules()
  })

  it('Have 6 log functions', () => {
    expect(logger).toBeDefined()
    expect(logger.verbose).toBeInstanceOf(Function)
    expect(logger.debug).toBeInstanceOf(Function)
    expect(logger.info).toBeInstanceOf(Function)
    expect(logger.done).toBeInstanceOf(Function)
    expect(logger.warn).toBeInstanceOf(Function)
    expect(logger.error).toBeInstanceOf(Function)
  })

  it('Default LOGGER_LEVEL will print info', () => {
    logger.info(CONTENT)
    logger.info(CONTENT, TAG)
    logger.info(OBJECT_CONTENT)
    logger.info(OBJECT_CONTENT, TAG)
    expect(console.log).toHaveBeenCalledTimes(4)
  })

  it('Default LOGGER_LEVEL will print done', () => {
    logger.done(CONTENT)
    expect(console.log).toHaveBeenCalledTimes(1)
    logger.done(CONTENT, '', true)
    expect(console.log).toHaveBeenCalledTimes(2)
  })

  it('Default LOGGER_LEVEL will print warn', () => {
    logger.warn(CONTENT)
    expect(console.log).toHaveBeenCalledTimes(1)
    logger.warn(CONTENT, '', true)
    expect(console.log).toHaveBeenCalledTimes(2)
  })

  it('Default LOGGER_LEVEL will print error', () => {
    logger.error(CONTENT)
    expect(console.log).toHaveBeenCalledTimes(1)
    logger.error(CONTENT, '', true)
    expect(console.log).toHaveBeenCalledTimes(2)
  })

  it('Default LOGGER_LEVEL will not print verbose', () => {
    logger.verbose(CONTENT)
    expect(console.log).not.toHaveBeenCalled()
  })

  it('Default LOGGER_LEVEL will not print debug', () => {
    logger.debug(CONTENT)
    expect(console.log).not.toHaveBeenCalled()
  })

  it('verbose LOGGER_LEVEL will not print verbose', () => {
    logger.setLevel('verbose')
    logger.verbose(CONTENT)
    expect(console.log).toHaveBeenCalled()
  })

  it('silent LOGGER_LEVEL will not print all', () => {
    logger.setLevel('silent')
    logger.verbose(CONTENT)
    logger.info(CONTENT)
    logger.done(CONTENT)
    logger.warn(CONTENT)
    logger.error(CONTENT)
    expect(console.log).not.toHaveBeenCalled()
  })
})

describe('@ombro/logger -> logger.ts -> clearConsole', () => {
  let logger: typeof import('../logger')
  const isTTY = process.stdout.isTTY

  beforeAll(async () => {
    jest.spyOn(console, 'log').mockImplementation(() => void 0)
    jest.spyOn(readline, 'cursorTo')
    jest.spyOn(readline, 'clearScreenDown')
    logger = await import('../logger')
  })

  afterEach(() => {
    jest.resetAllMocks()
    process.stdout.isTTY = isTTY
  })

  afterAll(() => {
    jest.restoreAllMocks()
    jest.resetModules()
  })

  it('Have clearConsole function', () => {
    expect(logger).toBeDefined()
    expect(logger.clearConsole).toBeInstanceOf(Function)
  })

  it('Non-tty terminal calls do not work', () => {
    process.stdout.isTTY = false
    logger.clearConsole()
    expect(console.log).not.toBeCalled()
    expect(readline.cursorTo).not.toBeCalled()
    expect(readline.clearScreenDown).not.toBeCalled()
  })

  it('call clearConsole will clear console', () => {
    process.stdout.isTTY = true
    logger.clearConsole()
    expect(console.log).toBeCalledTimes(1)
    expect(readline.cursorTo).toBeCalledTimes(1)
    expect(readline.clearScreenDown).toBeCalledTimes(1)
  })

  it('call clearConsole will clear console and print title', () => {
    process.stdout.isTTY = true
    logger.clearConsole('title')
    expect(console.log).toBeCalledTimes(2)
    expect(readline.cursorTo).toBeCalledTimes(1)
    expect(readline.clearScreenDown).toBeCalledTimes(1)
  })
})

describe('@ombro/logger -> logger.ts -> spinner', () => {
  let logger: typeof import('../logger')
  const start = jest.fn()
  const stop = jest.fn()
  const succeed = jest.fn()
  const warn = jest.fn()
  const fail = jest.fn()
  const fns = [start, stop, succeed, warn, fail]

  jest.mock('ora', () => {
    return () => ({ start, stop, succeed, warn, fail })
  })
  beforeAll(async () => {
    logger = await import('../logger')
  })

  afterEach(() => {
    logger.setLevel('info')
    fns.forEach((fn) => fn.mockReset())
  })

  afterAll(() => {
    fns.forEach((fn) => fn.mockRestore())
  })

  it('Global spinner start and stop', () => {
    logger.startLoading('title')
    expect(start).toBeCalled()
    logger.stopLoading()
    expect(stop).toBeCalled()
  })

  it('When Logger_LEVEL is silent, spinner will not be displayed either', () => {
    logger.setLevel('silent')
    logger.startLoading('title')
    expect(start).not.toBeCalled()
    logger.stopLoading()
    expect(stop).toBeCalled()
  })

  it('Global spinner start and stop, replace previous', () => {
    logger.startLoading('title')
    logger.startLoading('title2')
    expect(stop).toBeCalledTimes(1)
    expect(start).toBeCalledTimes(2)
    logger.stopLoading()
    expect(stop).toBeCalledTimes(2)
    logger.stopLoading()
    expect(stop).toBeCalledTimes(2)
  })

  it('Global spinner will be restored after other logs', () => {
    const logSpy = jest.spyOn(console, 'log').mockImplementationOnce(() => void 0)
    logger.startLoading('title')
    expect(start).toBeCalledTimes(1)
    logger.info('info')
    expect(logSpy).toBeCalledTimes(1)
    logSpy.mockRestore()
    expect(stop).toBeCalledTimes(1)
    expect(start).toBeCalledTimes(2)
  })

  it('Single spinner start and stop', () => {
    const spinner = logger.createSpinner('title')
    expect(start).toBeCalledTimes(1)
    spinner.stop()
    expect(stop).toBeCalledTimes(1)
    spinner.start()
    expect(start).toBeCalledTimes(2)
    spinner.stop()
    expect(stop).toBeCalledTimes(2)
  })

  it('Single spinner start and success', () => {
    const spinner = logger.createSpinner('title')
    spinner.success('success')
    expect(succeed).toBeCalledTimes(1)
  })

  it('Single spinner start and warn', () => {
    const spinner = logger.createSpinner('title')
    spinner.warn('warnning')
    expect(warn).toBeCalledTimes(1)
  })

  it('Single spinner start and fail', () => {
    const spinner = logger.createSpinner('title')
    spinner.fail('fail')
    expect(fail).toBeCalledTimes(1)
  })
})
