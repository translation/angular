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

  test('A simple interpolation of "em" and "br" HTML tags', () => {
    expect(
      Interpolation.extract(`
        A sentence with an<x id="START_EMPHASISED_TEXT" ctype="x-em" equiv-text="&lt;em&gt;"/>emphasized part<x id="CLOSE_EMPHASISED_TEXT" ctype="x-em" equiv-text="&lt;/em&gt;"/> in the middle.<x id="LINE_BREAK" ctype="lb" equiv-text="&lt;br/&gt;"/> And a line break.
      `)
    ).toStrictEqual({
      text: `
        A sentence with an<1>emphasized part</1> in the middle.<2/> And a line break.
      `,
      interpolations: {
        '<1>':  '<x id="START_EMPHASISED_TEXT" ctype="x-em" equiv-text="&lt;em&gt;"/>',
        '</1>': '<x id="CLOSE_EMPHASISED_TEXT" ctype="x-em" equiv-text="&lt;/em&gt;"/>',
        '<2/>': '<x id="LINE_BREAK" ctype="lb" equiv-text="&lt;br/&gt;"/>'
      }
    })
  })

  test('A simple interpolation of link ("a") HTML tags', () => {
    expect(
      Interpolation.extract(`
        A sentence with a <x id="START_LINK" ctype="x-a" equiv-text="&lt;a href=&quot;http://www.google.com&gt;&quot; target=&quot;_blank&quot;&gt;"/>first link<x id="CLOSE_LINK" ctype="x-a" equiv-text="&lt;/a&gt;"/> and a <x id="START_LINK_1" equiv-text="&lt;a href=&quot;https://translation.io/angular&quot; i18n-title title=&quot;Check out Translation.io&quot;&gt;"/>second link<x id="CLOSE_LINK" ctype="x-a" equiv-text="&lt;/a&gt;"/> in the middle.
      `)
    ).toStrictEqual({
      text: `
        A sentence with a <1>first link</1> and a <2>second link</2> in the middle.
      `,
      interpolations: {
        '<1>':  '<x id="START_LINK" ctype="x-a" equiv-text="&lt;a href=&quot;http://www.google.com&gt;&quot; target=&quot;_blank&quot;&gt;"/>',
        '</1>': '<x id="CLOSE_LINK" ctype="x-a" equiv-text="&lt;/a&gt;"/>',
        '<2>':  '<x id="START_LINK_1" equiv-text="&lt;a href=&quot;https://translation.io/angular&quot; i18n-title title=&quot;Check out Translation.io&quot;&gt;"/>',
        '</2>': '<x id="CLOSE_LINK" ctype="x-a" equiv-text="&lt;/a&gt;"/>'
      }
    })
  })

  test('A more complex interpolation with repetitive and similar tags', () => {
    expect(
      Interpolation.extract(`
        A sentence with <x id="START_EMPHASISED_TEXT" ctype="x-em" equiv-text="&lt;em&gt;"/>repetitive<x id="CLOSE_EMPHASISED_TEXT" ctype="x-em" equiv-text="&lt;/em&gt;"/> tags, with a <x id="START_EMPHASISED_TEXT_1" equiv-text="&lt;em style=&quot;color:red&quot;&gt;"/>twist<x id="CLOSE_EMPHASISED_TEXT" ctype="x-em" equiv-text="&lt;/em&gt;"/>, and<x id="LINE_BREAK" ctype="lb" equiv-text="&lt;br /&gt;"/> a line break,<x id="LINE_BREAK" ctype="lb" equiv-text="&lt;br /&gt;"/> and another line break,<x id="LINE_BREAK" ctype="lb" equiv-text="&lt;br /&gt;"/> and yet another one.
      `)
    ).toStrictEqual({
      text:`
        A sentence with <1>repetitive</1> tags, with a <2>twist</2>, and<3/> a line break,<4/> and another line break,<5/> and yet another one.
      `,
      interpolations: {
        '<1>':  '<x id="START_EMPHASISED_TEXT" ctype="x-em" equiv-text="&lt;em&gt;"/>',
        '</1>': '<x id="CLOSE_EMPHASISED_TEXT" ctype="x-em" equiv-text="&lt;/em&gt;"/>',
        '<2>':  '<x id="START_EMPHASISED_TEXT_1" equiv-text="&lt;em style=&quot;color:red&quot;&gt;"/>',
        '</2>': '<x id="CLOSE_EMPHASISED_TEXT" ctype="x-em" equiv-text="&lt;/em&gt;"/>',
        '<3/>': '<x id="LINE_BREAK" ctype="lb" equiv-text="&lt;br /&gt;"/>',
        '<4/>': '<x id="LINE_BREAK" ctype="lb" equiv-text="&lt;br /&gt;"/>',
        '<5/>': '<x id="LINE_BREAK" ctype="lb" equiv-text="&lt;br /&gt;"/>'
      }
    })
  })

  test('A more complex interpolation with nested "strong" and "em" HTML tags', () => {
    expect(
      Interpolation.extract(`
        A sentence with <x id="START_TAG_STRONG" ctype="x-strong" equiv-text="&lt;strong&gt;"/>nested <x id="START_EMPHASISED_TEXT" ctype="x-em" equiv-text="&lt;em&gt;"/>interpolated<x id="CLOSE_EMPHASISED_TEXT" ctype="x-em" equiv-text="&lt;/em&gt;"/> tags<x id="CLOSE_TAG_STRONG" ctype="x-strong" equiv-text="&lt;/strong&gt;"/> in the middle.
      `)
    ).toStrictEqual({
      text:`
        A sentence with <1>nested <2>interpolated</2> tags</1> in the middle.
      `,
      interpolations: {
        '<1>':  '<x id="START_TAG_STRONG" ctype="x-strong" equiv-text="&lt;strong&gt;"/>',
        '<2>':  '<x id="START_EMPHASISED_TEXT" ctype="x-em" equiv-text="&lt;em&gt;"/>',
        '</2>': '<x id="CLOSE_EMPHASISED_TEXT" ctype="x-em" equiv-text="&lt;/em&gt;"/>',
        '</1>': '<x id="CLOSE_TAG_STRONG" ctype="x-strong" equiv-text="&lt;/strong&gt;"/>'
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

  // fixed bug: {autres} was replaced with undefined
  test('A "select" ICU string managed as text should not try to replace ICU parts looking like variables (like {autres})', () => {
    expect(
      Interpolation.recompose('{VAR_SELECT, select, male {un homme} female {une femme} other {autre} }', {
        // nothing to substitute
      })
    ).toEqual('{VAR_SELECT, select, male {un homme} female {une femme} other {autre} }')
  })

  test('A simple interpolation of "em" and "br" HTML tags', () => {
    expect(
      Interpolation.recompose(`
        A sentence with an&lt;1&gt;emphasized part&lt;/1&gt; in the middle.&lt;2/&gt; And a line break.
      `,
      {
        '<1>':  '<x id="START_EMPHASISED_TEXT" ctype="x-em" equiv-text="&lt;em&gt;"/>',
        '</1>': '<x id="CLOSE_EMPHASISED_TEXT" ctype="x-em" equiv-text="&lt;/em&gt;"/>',
        '<2/>': '<x id="LINE_BREAK" ctype="lb" equiv-text="&lt;br/&gt;"/>'
      })
    ).toEqual(`
        A sentence with an<x id="START_EMPHASISED_TEXT" ctype="x-em" equiv-text="&lt;em&gt;"/>emphasized part<x id="CLOSE_EMPHASISED_TEXT" ctype="x-em" equiv-text="&lt;/em&gt;"/> in the middle.<x id="LINE_BREAK" ctype="lb" equiv-text="&lt;br/&gt;"/> And a line break.
      `)
  })

  test('A simple interpolation of link ("a") HTML tags', () => {
    expect(
      Interpolation.recompose(`
        A sentence with a &lt;1&gt;first link&lt;/1&gt; and a &lt;2&gt;second link&lt;/2&gt; in the middle.
      `,
      {
        '<1>':  '<x id="START_LINK" ctype="x-a" equiv-text="&lt;a href=&quot;http://www.google.com&gt;&quot; target=&quot;_blank&quot;&gt;"/>',
        '</1>': '<x id="CLOSE_LINK" ctype="x-a" equiv-text="&lt;/a&gt;"/>',
        '<2>':  '<x id="START_LINK_1" equiv-text="&lt;a href=&quot;https://translation.io/angular&quot; i18n-title title=&quot;Check out Translation.io&quot;&gt;"/>',
        '</2>': '<x id="CLOSE_LINK" ctype="x-a" equiv-text="&lt;/a&gt;"/>'
      })
    ).toEqual(`
        A sentence with a <x id="START_LINK" ctype="x-a" equiv-text="&lt;a href=&quot;http://www.google.com&gt;&quot; target=&quot;_blank&quot;&gt;"/>first link<x id="CLOSE_LINK" ctype="x-a" equiv-text="&lt;/a&gt;"/> and a <x id="START_LINK_1" equiv-text="&lt;a href=&quot;https://translation.io/angular&quot; i18n-title title=&quot;Check out Translation.io&quot;&gt;"/>second link<x id="CLOSE_LINK" ctype="x-a" equiv-text="&lt;/a&gt;"/> in the middle.
      `)
  })

  test('A more complex interpolation with repetitive and similar tags', () => {
    expect(
      Interpolation.recompose(`
        A sentence with &lt;1&gt;repetitive&lt;/1&gt; tags, with a &lt;2&gt;twist&lt;/2&gt;, and&lt;3/&gt; a line break,&lt;4/&gt; and another line break,&lt;5/&gt; and yet another one.
      `,
      {
        '<1>':  '<x id="START_EMPHASISED_TEXT" ctype="x-em" equiv-text="&lt;em&gt;"/>',
        '</1>': '<x id="CLOSE_EMPHASISED_TEXT" ctype="x-em" equiv-text="&lt;/em&gt;"/>',
        '<2>':  '<x id="START_EMPHASISED_TEXT_1" equiv-text="&lt;em style=&quot;color:red&quot;&gt;"/>',
        '</2>': '<x id="CLOSE_EMPHASISED_TEXT" ctype="x-em" equiv-text="&lt;/em&gt;"/>',
        '<3/>': '<x id="LINE_BREAK" ctype="lb" equiv-text="&lt;br /&gt;"/>',
        '<4/>': '<x id="LINE_BREAK" ctype="lb" equiv-text="&lt;br /&gt;"/>',
        '<5/>': '<x id="LINE_BREAK" ctype="lb" equiv-text="&lt;br /&gt;"/>'
      })
    ).toEqual(`
        A sentence with <x id="START_EMPHASISED_TEXT" ctype="x-em" equiv-text="&lt;em&gt;"/>repetitive<x id="CLOSE_EMPHASISED_TEXT" ctype="x-em" equiv-text="&lt;/em&gt;"/> tags, with a <x id="START_EMPHASISED_TEXT_1" equiv-text="&lt;em style=&quot;color:red&quot;&gt;"/>twist<x id="CLOSE_EMPHASISED_TEXT" ctype="x-em" equiv-text="&lt;/em&gt;"/>, and<x id="LINE_BREAK" ctype="lb" equiv-text="&lt;br /&gt;"/> a line break,<x id="LINE_BREAK" ctype="lb" equiv-text="&lt;br /&gt;"/> and another line break,<x id="LINE_BREAK" ctype="lb" equiv-text="&lt;br /&gt;"/> and yet another one.
      `)
  })

  test('A more complex interpolation with nested "strong" and "em" HTML tags', () => {
    expect(
      Interpolation.recompose(`
        A sentence with &lt;1&gt;nested &lt;2&gt;interpolated&lt;/2&gt; tags&lt;/1&gt; in the middle.
      `,
      {
        '<1>':  '<x id="START_TAG_STRONG" ctype="x-strong" equiv-text="&lt;strong&gt;"/>',
        '<2>':  '<x id="START_EMPHASISED_TEXT" ctype="x-em" equiv-text="&lt;em&gt;"/>',
        '</2>': '<x id="CLOSE_EMPHASISED_TEXT" ctype="x-em" equiv-text="&lt;/em&gt;"/>',
        '</1>': '<x id="CLOSE_TAG_STRONG" ctype="x-strong" equiv-text="&lt;/strong&gt;"/>'
      })
    ).toEqual(`
        A sentence with <x id="START_TAG_STRONG" ctype="x-strong" equiv-text="&lt;strong&gt;"/>nested <x id="START_EMPHASISED_TEXT" ctype="x-em" equiv-text="&lt;em&gt;"/>interpolated<x id="CLOSE_EMPHASISED_TEXT" ctype="x-em" equiv-text="&lt;/em&gt;"/> tags<x id="CLOSE_TAG_STRONG" ctype="x-strong" equiv-text="&lt;/strong&gt;"/> in the middle.
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
