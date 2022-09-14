const Interpolation = require('../../src/utils/interpolation')

describe('Interpolation.extract', () => {
  test('One simple unnamed interpolation', () => {
    expect(
      Interpolation.extract('Hello <x id="INTERPOLATION"/>')
    ).toStrictEqual({
      text: "Hello {x}",
      interpolations: {
        '{x}': '<x id="INTERPOLATION"/>'
      }
    })
  })

  test('Two simple unnamed interpolations', () => {
    expect(
      Interpolation.extract('Hello <x id="INTERPOLATION"/> and <x id="INTERPOLATION"/>')
    ).toStrictEqual({
      text: "Hello {x1} and {x2}",
      interpolations: {
        '{x1}': '<x id="INTERPOLATION"/>',
        '{x2}': '<x id="INTERPOLATION"/>'
      }
    })
  })

  test('Two simple named interpolations with different formatting: {{name}} and {{ otherName }}', () => {
    expect(
      Interpolation.extract('Hello <x id="INTERPOLATION" equiv-text="{{name}}"/> and <x id="INTERPOLATION_1" equiv-text="{{ otherName }}"/>')
    ).toStrictEqual({
      text: "Hello {name} and {otherName}",
      interpolations: {
        '{name}':      '<x id="INTERPOLATION" equiv-text="{{name}}"/>',
        '{otherName}': '<x id="INTERPOLATION_1" equiv-text="{{ otherName }}"/>'
      }
    })
  })

  test('A simple ICU interpolation', () => {
    expect(
      Interpolation.extract('This <x id="ICU" equiv-text="{minutes, plural, =0 {just now} =1 {one minute ago} other {{{minutes}} minutes ago}}" xid="1887283401472369100"/> is nice')
    ).toStrictEqual({
      text: 'This {icu} is nice',
      interpolations: {
        '{icu}': '<x id="ICU" equiv-text="{minutes, plural, =0 {just now} =1 {one minute ago} other {{{minutes}} minutes ago}}" xid="1887283401472369100"/>'
      }
    })
  })

  test('Two simple ICU interpolations', () => {
    expect(
      Interpolation.extract('These <x id="ICU" equiv-text="{minutes, plural, =0 {just now} =1 {one minute ago} other {{{minutes}} minutes ago}}" xid="1887283401472369100"/> and <x id="ICU" equiv-text="{minutes, plural, one {cat} other {cats}}" xid="1887283401472369100"/> are nice')
    ).toStrictEqual({
      text: 'These {icu1} and {icu2} are nice',
      interpolations: {
        '{icu1}': '<x id="ICU" equiv-text="{minutes, plural, =0 {just now} =1 {one minute ago} other {{{minutes}} minutes ago}}" xid="1887283401472369100"/>',
        '{icu2}': '<x id="ICU" equiv-text="{minutes, plural, one {cat} other {cats}}" xid="1887283401472369100"/>'
       }
    })
  })

  test('Two identical ICU interpolations', () => {
    expect(
      Interpolation.extract('Hello <x id="INTERPOLATION" equiv-text="{{name}}"/> and <x id="INTERPOLATION" equiv-text="{{  name  }}"/>')
    ).toStrictEqual({
      text: 'Hello {name} and {name}',
      interpolations: {
        '{name}': '<x id="INTERPOLATION" equiv-text="{{  name  }}"/>'
       }
    })
  })

  test('A very complex sentence with multiple interpolations of different kinds and some new lines', () => {
    expect(
      Interpolation.extract(`
        Updated <x id="INTERPOLATION" equiv-text="{{name}}"/> and <x id="INTERPOLATION"/> <x id="ICU" equiv-text="{minutes, plural,
          =0 {just now}
          =1 {one minute ago}
          other {{{minutes}} minutes ago by {gender, select, male {male} female {female} other {other}}}}" xid="6988904457887003660"/>
        with <x id="INTERPOLATION"/> and <x id="INTERPOLATION" equiv-text="{{   stuff }}"/>
      `)
    ).toStrictEqual({
      text: `
        Updated {name} and {x1} {icu}
        with {x2} and {stuff}
      `,
      interpolations: {
        '{icu}':   `<x id="ICU" equiv-text="{minutes, plural,
          =0 {just now}
          =1 {one minute ago}
          other {{{minutes}} minutes ago by {gender, select, male {male} female {female} other {other}}}}" xid="6988904457887003660"/>`,
        '{name}':  '<x id="INTERPOLATION" equiv-text="{{name}}"/>',
        '{stuff}': '<x id="INTERPOLATION" equiv-text="{{   stuff }}"/>',
        '{x1}':    '<x id="INTERPOLATION"/>',
        '{x2}':    '<x id="INTERPOLATION"/>',
      }
    })
  })
})

describe('Interpolation.recompose', () => {
  test('One simple unnamed interpolation', () => {
    expect(
      Interpolation.recompose('Hello {x}', {
        '{x}': '<x id="INTERPOLATION"/>'
      })
    ).toEqual('Hello <x id="INTERPOLATION"/>')
  })

  test('Two simple unnamed interpolations', () => {
    expect(
      Interpolation.recompose('Hello {x1} and {x2}', {
        '{x1}': '<x id="INTERPOLATION"/>',
        '{x2}': '<x id="INTERPOLATION"/>'
      })
    ).toEqual('Hello <x id="INTERPOLATION"/> and <x id="INTERPOLATION"/>')
  })

  test('Two simple named interpolations with different formatting: {{name}} and {{ otherName }}', () => {
    expect(
      Interpolation.recompose("Hello {name} and {otherName}", {
        '{name}':      '<x id="INTERPOLATION" equiv-text="{{name}}"/>',
        '{otherName}': '<x id="INTERPOLATION_1" equiv-text="{{ otherName }}"/>'
      })
    ).toEqual('Hello <x id="INTERPOLATION" equiv-text="{{name}}"/> and <x id="INTERPOLATION_1" equiv-text="{{ otherName }}"/>')
  })

  test('A simple ICU interpolation', () => {
    expect(
      Interpolation.recompose('This {icu} is nice', {
        '{icu}': '<x id="ICU" equiv-text="{minutes, plural, =0 {just now} =1 {one minute ago} other {{{minutes}} minutes ago}}" xid="1887283401472369100"/>'
      })
    ).toEqual('This <x id="ICU" equiv-text="{minutes, plural, =0 {just now} =1 {one minute ago} other {{{minutes}} minutes ago}}" xid="1887283401472369100"/> is nice')
  })

  test('Two simple ICU interpolations', () => {
    expect(
      Interpolation.recompose('These {icu1} and {icu2} are nice', {
        '{icu1}': '<x id="ICU" equiv-text="{minutes, plural, =0 {just now} =1 {one minute ago} other {{{minutes}} minutes ago}}" xid="1887283401472369100"/>',
        '{icu2}': '<x id="ICU" equiv-text="{minutes, plural, one {cat} other {cats}}" xid="1887283401472369100"/>'
      })
    ).toEqual('These <x id="ICU" equiv-text="{minutes, plural, =0 {just now} =1 {one minute ago} other {{{minutes}} minutes ago}}" xid="1887283401472369100"/> and <x id="ICU" equiv-text="{minutes, plural, one {cat} other {cats}}" xid="1887283401472369100"/> are nice')
  })

  test('Two identical ICU interpolations', () => {
    expect(
      Interpolation.recompose('Hello {name} and {name}', {
        '{name}': '<x id="INTERPOLATION" equiv-text="{{name}}"/>'
      })
    ).toEqual('Hello <x id="INTERPOLATION" equiv-text="{{name}}"/> and <x id="INTERPOLATION" equiv-text="{{name}}"/>')
  })

  test('A very complex sentence with multiple interpolations of different kinds and some new lines', () => {
    expect(
      Interpolation.recompose(`
        Updated {name} and {x1} {icu}
        with {x2} and {stuff}
      `,
      {
        '{icu}':   `<x id="ICU" equiv-text="{minutes, plural,
          =0 {just now}
          =1 {one minute ago}
          other {{{minutes}} minutes ago by {gender, select, male {male} female {female} other {other}}}}" xid="6988904457887003660"/>`,
        '{name}':  '<x id="INTERPOLATION" equiv-text="{{name}}"/>',
        '{stuff}': '<x id="INTERPOLATION" equiv-text="{{   stuff }}"/>',
        '{x1}':    '<x id="INTERPOLATION"/>',
        '{x2}':    '<x id="INTERPOLATION"/>',
      })
    ).toEqual(`
        Updated <x id="INTERPOLATION" equiv-text="{{name}}"/> and <x id="INTERPOLATION"/> <x id="ICU" equiv-text="{minutes, plural,
          =0 {just now}
          =1 {one minute ago}
          other {{{minutes}} minutes ago by {gender, select, male {male} female {female} other {other}}}}" xid="6988904457887003660"/>
        with <x id="INTERPOLATION"/> and <x id="INTERPOLATION" equiv-text="{{   stuff }}"/>
      `)
  })
})

describe('Interpolation.substitution', () => {
  test('Simple example with basic substitution', () => {
    expect(
      Interpolation.substitution('<x id="INTERPOLATION"/>', [])
    ).toEqual('{x1}')
  })

  test('Simple example with indexed basic substitutions', () => {
    expect(
      Interpolation.substitution('<x id="INTERPOLATION"/>', ['{x1}', '{x2}'])
    ).toEqual('{x3}')
  })

  test('Simple example with ICU substitution', () => {
    expect(
      Interpolation.substitution('<x id="ICU" equiv-text="{minutes, plural, one {cat} other {cats}}" xid="1887283401472369100"/>', [])
    ).toEqual('{icu1}')
  })

  test('Simple example with indexed ICU substitutions', () => {
    expect(
      Interpolation.substitution('<x id="ICU" equiv-text="{minutes, plural, one {cat} other {cats}}" xid="1887283401472369100"/>', ['{icu1}', '{icu2}'])
    ).toEqual('{icu3}')
  })

  test('Simple example with named substitutions', () => {
    expect(
      Interpolation.substitution('<x id="INTERPOLATION" equiv-text="{{name}}"/>', [])
    ).toEqual('{name}')
  })

  test('Simple example with named substitutions (no need to index exact variable names)', () => {
    expect(
      Interpolation.substitution('<x id="INTERPOLATION" equiv-text="{{name}}"/>', ['{name}'])
    ).toEqual('{name}')
  })
})
