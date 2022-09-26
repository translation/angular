const Interpolation = require('../../src/utils/interpolation')

/* Utils methods to more readable specs when HTML tags are used */

function escape(text) {
  return text.replace(/&/g, '&amp;')
             .replace(/>/g, '&gt;')
             .replace(/</g, '&lt;')
             .replace(/'/g, '&apos;')
             .replace(/"/g, '&quot;')
}

function escapeKeys(hash) {
  Object.keys(hash).forEach((key) => {
    hash[escape(key)] = hash[key]
    delete hash[key]
  })

  return hash
}

/* Specs */

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
      text: "Hello {x} and {x}",
      interpolations: {
        '{x}': '<x id="INTERPOLATION"/>'
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

  test('Two identical named interpolations with different spacing (keep only second one, not an issue!)', () => {
    expect(
      Interpolation.extract('Hello <x id="INTERPOLATION" equiv-text="{{name}}"/> and <x id="INTERPOLATION" equiv-text="{{  name  }}"/>')
    ).toStrictEqual({
      text: 'Hello {name} and {name}',
      interpolations: {
        '{name}': '<x id="INTERPOLATION" equiv-text="{{  name  }}"/>'
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

  test('One ICU with multiple different unnamed interpolations (was generated directly in XLF to combine with the original ICU that has named variables)', () => {
    expect(
      Interpolation.extract('{VAR_PLURAL, plural, =0 {just now by <x id="INTERPOLATION"/>} =1 {one second ago by <x id="INTERPOLATION"/>} other {<x id="INTERPOLATION_1"/> seconds ago by <x id="INTERPOLATION"/>}}')
    ).toStrictEqual({
      text: '{VAR_PLURAL, plural, =0 {just now by {x1}} =1 {one second ago by {x1}} other {{x2} seconds ago by {x1}}}',
      interpolations: {
        '{x1}': '<x id="INTERPOLATION"/>',
        '{x2}': '<x id="INTERPOLATION_1"/>'
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
        Updated {name} and {x} {icu}
        with {x} and {stuff}
      `,
      interpolations: {
        '{icu}':   `<x id="ICU" equiv-text="{minutes, plural,
          =0 {just now}
          =1 {one minute ago}
          other {{{minutes}} minutes ago by {gender, select, male {male} female {female} other {other}}}}" xid="6988904457887003660"/>`,
        '{name}':  '<x id="INTERPOLATION" equiv-text="{{name}}"/>',
        '{stuff}': '<x id="INTERPOLATION" equiv-text="{{   stuff }}"/>',
        '{x}':     '<x id="INTERPOLATION"/>',
      }
    })
  })

  test('A simple interpolation of "em" and "br" HTML tags', () => {
    expect(
      Interpolation.extract(`A sentence with an <x id="START_EMPHASISED_TEXT" ctype="x-em" equiv-text="&lt;em&gt;"/>emphasized part<x id="CLOSE_EMPHASISED_TEXT" ctype="x-em" equiv-text="&lt;/em&gt;"/> in the middle.<x id="LINE_BREAK" ctype="lb" equiv-text="&lt;br/&gt;"/>And a line break.`)
    ).toStrictEqual({
      text: escape('A sentence with an <1>emphasized part</1> in the middle.<2/>And a line break.'),
      interpolations: escapeKeys({
        '<1>':  '<x id="START_EMPHASISED_TEXT" ctype="x-em" equiv-text="&lt;em&gt;"/>',
        '</1>': '<x id="CLOSE_EMPHASISED_TEXT" ctype="x-em" equiv-text="&lt;/em&gt;"/>',
        '<2/>': '<x id="LINE_BREAK" ctype="lb" equiv-text="&lt;br/&gt;"/>'
      })
    })
  })

  test('A simple interpolation of link ("a") HTML tags', () => {
    expect(
      Interpolation.extract(`A sentence with a <x id="START_LINK" ctype="x-a" equiv-text="&lt;a href=&quot;http://www.google.com&gt;&quot; target=&quot;_blank&quot;&gt;"/>first link<x id="CLOSE_LINK" ctype="x-a" equiv-text="&lt;/a&gt;"/> and a <x id="START_LINK_1" equiv-text="&lt;a href=&quot;https://translation.io/angular&quot; i18n-title title=&quot;Check out Translation.io&quot;&gt;"/>second link<x id="CLOSE_LINK" ctype="x-a" equiv-text="&lt;/a&gt;"/> in the middle.`)
    ).toStrictEqual({
      text: escape('A sentence with a <1>first link</1> and a <2>second link</2> in the middle.'),
      interpolations: escapeKeys({
        '<1>':  '<x id="START_LINK" ctype="x-a" equiv-text="&lt;a href=&quot;http://www.google.com&gt;&quot; target=&quot;_blank&quot;&gt;"/>',
        '</1>': '<x id="CLOSE_LINK" ctype="x-a" equiv-text="&lt;/a&gt;"/>',
        '<2>':  '<x id="START_LINK_1" equiv-text="&lt;a href=&quot;https://translation.io/angular&quot; i18n-title title=&quot;Check out Translation.io&quot;&gt;"/>',
        '</2>': '<x id="CLOSE_LINK" ctype="x-a" equiv-text="&lt;/a&gt;"/>'
      })
    })
  })

  test('A simple interpolation of self-closing or self-contained tags (<input/> and <img>)', () => {
    expect(
      Interpolation.extract(`This is an input <x id="TAG_INPUT" ctype="x-input" equiv-text="&lt;input name=&quot;name&quot;/&gt;"/> and an image <x id="TAG_IMG" ctype="image" equiv-text="&lt;img src=&quot;image-source&quot; alt=&quot;text&quot;&gt;"/>`)
    ).toStrictEqual({
      text: escape('This is an input <1/> and an image <2>'),
      interpolations: escapeKeys({
        "<1/>": "<x id=\"TAG_INPUT\" ctype=\"x-input\" equiv-text=\"&lt;input name=&quot;name&quot;/&gt;\"/>",
        "<2>":  "<x id=\"TAG_IMG\" ctype=\"image\" equiv-text=\"&lt;img src=&quot;image-source&quot; alt=&quot;text&quot;&gt;\"/>",
      })
    })
  })

  test('A more complex interpolation with repetitive and similar tags', () => {
    expect(
      Interpolation.extract(`A sentence with <x id="START_EMPHASISED_TEXT" ctype="x-em" equiv-text="&lt;em&gt;"/>repetitive<x id="CLOSE_EMPHASISED_TEXT" ctype="x-em" equiv-text="&lt;/em&gt;"/> tags, with a <x id="START_EMPHASISED_TEXT_1" equiv-text="&lt;em style=&quot;color:red&quot;&gt;"/>twist<x id="CLOSE_EMPHASISED_TEXT" ctype="x-em" equiv-text="&lt;/em&gt;"/>, and<x id="LINE_BREAK" ctype="lb" equiv-text="&lt;br /&gt;"/>a line break,<x id="LINE_BREAK" ctype="lb" equiv-text="&lt;br /&gt;"/>and another line break,<x id="LINE_BREAK" ctype="lb" equiv-text="&lt;br /&gt;"/>and yet another one.`)
    ).toStrictEqual({
      text: escape('A sentence with <1>repetitive</1> tags, with a <2>twist</2>, and<3/>a line break,<4/>and another line break,<5/>and yet another one.'),
      interpolations: escapeKeys({
        '<1>':  '<x id="START_EMPHASISED_TEXT" ctype="x-em" equiv-text="&lt;em&gt;"/>',
        '</1>': '<x id="CLOSE_EMPHASISED_TEXT" ctype="x-em" equiv-text="&lt;/em&gt;"/>',
        '<2>':  '<x id="START_EMPHASISED_TEXT_1" equiv-text="&lt;em style=&quot;color:red&quot;&gt;"/>',
        '</2>': '<x id="CLOSE_EMPHASISED_TEXT" ctype="x-em" equiv-text="&lt;/em&gt;"/>',
        '<3/>': '<x id="LINE_BREAK" ctype="lb" equiv-text="&lt;br /&gt;"/>',
        '<4/>': '<x id="LINE_BREAK" ctype="lb" equiv-text="&lt;br /&gt;"/>',
        '<5/>': '<x id="LINE_BREAK" ctype="lb" equiv-text="&lt;br /&gt;"/>'
      })
    })
  })

  test('A more complex interpolation with nested "strong" and "em" HTML tags', () => {
    expect(
      Interpolation.extract(`A sentence with <x id="START_TAG_STRONG" ctype="x-strong" equiv-text="&lt;strong&gt;"/>nested <x id="START_EMPHASISED_TEXT" ctype="x-em" equiv-text="&lt;em&gt;"/>interpolated<x id="CLOSE_EMPHASISED_TEXT" ctype="x-em" equiv-text="&lt;/em&gt;"/> tags<x id="CLOSE_TAG_STRONG" ctype="x-strong" equiv-text="&lt;/strong&gt;"/> in the middle.`)
    ).toStrictEqual({
      text: escape('A sentence with <1>nested <2>interpolated</2> tags</1> in the middle.'),
      interpolations: escapeKeys({
        '<1>':  '<x id="START_TAG_STRONG" ctype="x-strong" equiv-text="&lt;strong&gt;"/>',
        '<2>':  '<x id="START_EMPHASISED_TEXT" ctype="x-em" equiv-text="&lt;em&gt;"/>',
        '</2>': '<x id="CLOSE_EMPHASISED_TEXT" ctype="x-em" equiv-text="&lt;/em&gt;"/>',
        '</1>': '<x id="CLOSE_TAG_STRONG" ctype="x-strong" equiv-text="&lt;/strong&gt;"/>'
      })
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
      Interpolation.recompose('Hello {x} and {x}', {
        '{x}': '<x id="INTERPOLATION"/>'
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

  test('Two identical named interpolations', () => {
    expect(
      Interpolation.recompose('Hello {name} and {name}', {
        '{name}': '<x id="INTERPOLATION" equiv-text="{{name}}"/>'
      })
    ).toEqual('Hello <x id="INTERPOLATION" equiv-text="{{name}}"/> and <x id="INTERPOLATION" equiv-text="{{name}}"/>')
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

  test('One ICU with multiple different unnamed interpolations (was generated directly in XLF to combine with the original ICU that has named variables)', () => {
    expect(
      Interpolation.recompose('{VAR_PLURAL, plural, =0 {just now by {x1}} =1 {one second ago by {x1}} other {{x2} seconds ago by {x1}}}', {
        '{x1}': '<x id="INTERPOLATION"/>',
        '{x2}': '<x id="INTERPOLATION_1"/>'
      })
    ).toEqual('{VAR_PLURAL, plural, =0 {just now by <x id="INTERPOLATION"/>} =1 {one second ago by <x id="INTERPOLATION"/>} other {<x id="INTERPOLATION_1"/> seconds ago by <x id="INTERPOLATION"/>}}')
  })

  test('A very complex sentence with multiple interpolations of different kinds and some new lines', () => {
    expect(
      Interpolation.recompose(`
        Updated {name} and {x} {icu}
        with {x} and {stuff}
      `,
      {
        '{icu}':   `<x id="ICU" equiv-text="{minutes, plural,
          =0 {just now}
          =1 {one minute ago}
          other {{{minutes}} minutes ago by {gender, select, male {male} female {female} other {other}}}}" xid="6988904457887003660"/>`,
        '{name}':  '<x id="INTERPOLATION" equiv-text="{{name}}"/>',
        '{stuff}': '<x id="INTERPOLATION" equiv-text="{{   stuff }}"/>',
        '{x}':     '<x id="INTERPOLATION"/>'
      })
    ).toEqual(`
        Updated <x id="INTERPOLATION" equiv-text="{{name}}"/> and <x id="INTERPOLATION"/> <x id="ICU" equiv-text="{minutes, plural,
          =0 {just now}
          =1 {one minute ago}
          other {{{minutes}} minutes ago by {gender, select, male {male} female {female} other {other}}}}" xid="6988904457887003660"/>
        with <x id="INTERPOLATION"/> and <x id="INTERPOLATION" equiv-text="{{   stuff }}"/>
      `)
  })

  test('A simple interpolation of "em" and "br" HTML tags', () => {
    expect(
      Interpolation.recompose(
        escape('A sentence with an <1>emphasized part</1> in the middle.<2/>And a line break.'),
        escapeKeys({
          '<1>':  '<x id="START_EMPHASISED_TEXT" ctype="x-em" equiv-text="&lt;em&gt;"/>',
          '</1>': '<x id="CLOSE_EMPHASISED_TEXT" ctype="x-em" equiv-text="&lt;/em&gt;"/>',
          '<2/>': '<x id="LINE_BREAK" ctype="lb" equiv-text="&lt;br/&gt;"/>'
        })
      )
    ).toEqual(`A sentence with an <x id="START_EMPHASISED_TEXT" ctype="x-em" equiv-text="&lt;em&gt;"/>emphasized part<x id="CLOSE_EMPHASISED_TEXT" ctype="x-em" equiv-text="&lt;/em&gt;"/> in the middle.<x id="LINE_BREAK" ctype="lb" equiv-text="&lt;br/&gt;"/>And a line break.`)
  })

  test('A simple interpolation of link ("a") HTML tags', () => {
    expect(
      Interpolation.recompose(
        escape('A sentence with a <1>first link</1> and a <2>second link</2> in the middle.'),
        escapeKeys({
          '<1>':  '<x id="START_LINK" ctype="x-a" equiv-text="&lt;a href=&quot;http://www.google.com&gt;&quot; target=&quot;_blank&quot;&gt;"/>',
          '</1>': '<x id="CLOSE_LINK" ctype="x-a" equiv-text="&lt;/a&gt;"/>',
          '<2>':  '<x id="START_LINK_1" equiv-text="&lt;a href=&quot;https://translation.io/angular&quot; i18n-title title=&quot;Check out Translation.io&quot;&gt;"/>',
          '</2>': '<x id="CLOSE_LINK" ctype="x-a" equiv-text="&lt;/a&gt;"/>'
        })
      )
    ).toEqual(`A sentence with a <x id="START_LINK" ctype="x-a" equiv-text="&lt;a href=&quot;http://www.google.com&gt;&quot; target=&quot;_blank&quot;&gt;"/>first link<x id="CLOSE_LINK" ctype="x-a" equiv-text="&lt;/a&gt;"/> and a <x id="START_LINK_1" equiv-text="&lt;a href=&quot;https://translation.io/angular&quot; i18n-title title=&quot;Check out Translation.io&quot;&gt;"/>second link<x id="CLOSE_LINK" ctype="x-a" equiv-text="&lt;/a&gt;"/> in the middle.`)
  })

  test('A more complex interpolation with repetitive and similar tags', () => {
    expect(
      Interpolation.recompose(
        escape('A sentence with <1>repetitive</1> tags, with a <2>twist</2>, and<3/>a line break,<4/>and another line break,<5/>and yet another one.'),
        escapeKeys({
          '<1>':  '<x id="START_EMPHASISED_TEXT" ctype="x-em" equiv-text="&lt;em&gt;"/>',
          '</1>': '<x id="CLOSE_EMPHASISED_TEXT" ctype="x-em" equiv-text="&lt;/em&gt;"/>',
          '<2>':  '<x id="START_EMPHASISED_TEXT_1" equiv-text="&lt;em style=&quot;color:red&quot;&gt;"/>',
          '</2>': '<x id="CLOSE_EMPHASISED_TEXT" ctype="x-em" equiv-text="&lt;/em&gt;"/>',
          '<3/>': '<x id="LINE_BREAK" ctype="lb" equiv-text="&lt;br /&gt;"/>',
          '<4/>': '<x id="LINE_BREAK" ctype="lb" equiv-text="&lt;br /&gt;"/>',
          '<5/>': '<x id="LINE_BREAK" ctype="lb" equiv-text="&lt;br /&gt;"/>'
        })
      )
    ).toEqual(`A sentence with <x id="START_EMPHASISED_TEXT" ctype="x-em" equiv-text="&lt;em&gt;"/>repetitive<x id="CLOSE_EMPHASISED_TEXT" ctype="x-em" equiv-text="&lt;/em&gt;"/> tags, with a <x id="START_EMPHASISED_TEXT_1" equiv-text="&lt;em style=&quot;color:red&quot;&gt;"/>twist<x id="CLOSE_EMPHASISED_TEXT" ctype="x-em" equiv-text="&lt;/em&gt;"/>, and<x id="LINE_BREAK" ctype="lb" equiv-text="&lt;br /&gt;"/>a line break,<x id="LINE_BREAK" ctype="lb" equiv-text="&lt;br /&gt;"/>and another line break,<x id="LINE_BREAK" ctype="lb" equiv-text="&lt;br /&gt;"/>and yet another one.`)
  })

  test('A more complex interpolation with nested "strong" and "em" HTML tags', () => {
    expect(
      Interpolation.recompose(
        escape('A sentence with <1>nested <2>interpolated</2> tags</1> in the middle.'),
        escapeKeys({
          '<1>':  '<x id="START_TAG_STRONG" ctype="x-strong" equiv-text="&lt;strong&gt;"/>',
          '<2>':  '<x id="START_EMPHASISED_TEXT" ctype="x-em" equiv-text="&lt;em&gt;"/>',
          '</2>': '<x id="CLOSE_EMPHASISED_TEXT" ctype="x-em" equiv-text="&lt;/em&gt;"/>',
          '</1>': '<x id="CLOSE_TAG_STRONG" ctype="x-strong" equiv-text="&lt;/strong&gt;"/>'
        })
      )
    ).toEqual(`A sentence with <x id="START_TAG_STRONG" ctype="x-strong" equiv-text="&lt;strong&gt;"/>nested <x id="START_EMPHASISED_TEXT" ctype="x-em" equiv-text="&lt;em&gt;"/>interpolated<x id="CLOSE_EMPHASISED_TEXT" ctype="x-em" equiv-text="&lt;/em&gt;"/> tags<x id="CLOSE_TAG_STRONG" ctype="x-strong" equiv-text="&lt;/strong&gt;"/> in the middle.`)
  })

  // fixed bug: {autres} was replaced with undefined
  test('A "select" ICU string managed as text should not try to replace ICU parts looking like variables (like {autres})', () => {
    expect(
      Interpolation.recompose('{VAR_SELECT, select, male {un homme} female {une femme} other {autre} }', {
        // nothing to substitute
      })
    ).toEqual('{VAR_SELECT, select, male {un homme} female {une femme} other {autre} }')
  })
})

describe('Interpolation.substitution', () => {
  test('Simple example with basic substitution', () => {
    expect(
      Interpolation.substitution(
        '<x id="INTERPOLATION"/>',
        []
      )
    ).toEqual('{x1}')
  })

  test('Simple example with indexed basic substitutions', () => {
    expect(
      Interpolation.substitution(
        '<x id="INTERPOLATION_1"/>',
        ['{x1}']
      )
    ).toEqual('{x2}')
  })

  test('Simple example with ICU substitution', () => {
    expect(
      Interpolation.substitution(
        '<x id="ICU" equiv-text="{minutes, plural, one {cat} other {cats}}" xid="1887283401472369100"/>',
        []
      )
    ).toEqual('{icu1}')
  })

  test('Simple example with indexed ICU substitutions', () => {
    expect(
      Interpolation.substitution(
        '<x id="ICU" equiv-text="{minutes, plural, one {cat} other {cats}}" xid="1887283401472369100"/>',
        ['{icu1}', '{icu2}']
      )
    ).toEqual('{icu3}')
  })

  test('Simple example with named substitutions', () => {
    expect(
      Interpolation.substitution(
        '<x id="INTERPOLATION" equiv-text="{{name}}"/>',
        []
      )
    ).toEqual('{name}')
  })

  test('Simple example with named substitutions (no need to index exact variable names)', () => {
    expect(
      Interpolation.substitution(
        '<x id="INTERPOLATION" equiv-text="{{name}}"/>',
        ['{name}']
      )
    ).toEqual('{name}')
  })
})
