const Interpolation = require('../../src/utils/interpolation')

describe('Interpolation.escape', () => {
  test('One simple unnamed interpolation', () => {
    expect(
      Interpolation.escape('Hello <x id="INTERPOLATION"/>')
    ).toStrictEqual({
      text:           "Hello {x0}",
      interpolations: ['<x id="INTERPOLATION"/>']
    })
  })

  test('Two simple unnamed interpolations', () => {
    expect(
      Interpolation.escape('Hello <x id="INTERPOLATION"/> and <x id="INTERPOLATION"/>')
    ).toStrictEqual({
      text:           "Hello {x0} and {x1}",
      interpolations: ['<x id="INTERPOLATION"/>', '<x id="INTERPOLATION"/>']
    })
  })
})

describe('Interpolation.unescape', () => {
  test('One simple unnamed interpolation', () => {
    expect(
      Interpolation.unescape('Hello {x0}', ['<x id="INTERPOLATION"/>'])
    ).toEqual('Hello <x id="INTERPOLATION"/>')
  })

  test('Two simple unnamed interpolations', () => {
    expect(
      Interpolation.unescape('Hello {x0} and {x1}', ['<x id="INTERPOLATION"/>', '<x id="INTERPOLATION"/>'])
    ).toEqual('Hello <x id="INTERPOLATION"/> and <x id="INTERPOLATION"/>')
  })
})
