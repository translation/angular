const Base = require('../../src/calls/base')

let base;

describe('convertXmlUnitToSegment', () => {
  beforeEach(() => {
    base = new Base()
  });

  test('Convert simple with generic (ignored) key', () => {
    const xmlUnit = base.xmlParser().parse(`
      <trans-unit id="7670372064920373295" datatype="html">
        <source>Source Text</source>
      </trans-unit>
    `)['trans-unit']

    expect(
      base.convertXmlUnitToSegment(xmlUnit)
    ).toStrictEqual({
       "type":   "source",
       "source": "Source Text",
       "target": "",
    })
  })

  test('Ignore extra spaces at start and end of source/target', () => {
    const xmlUnit = base.xmlParser().parse(`
      <trans-unit id="7670372064920373295" datatype="html">
        <source>
       Source Text   </source>
        <target>

        Target     Text

        </target>
      </trans-unit>
    `)['trans-unit']

    expect(
      base.convertXmlUnitToSegment(xmlUnit)
    ).toStrictEqual({
       "type":   "source",
       "source": "Source Text",
       "target": "Target     Text",
    })
  })

  test('Convert simple with custom key', () => {
    const xmlUnit = base.xmlParser().parse(`
      <trans-unit id="customKey" datatype="html">
        <source>Source Text</source>
      </trans-unit>
    `)['trans-unit']

    expect(
      base.convertXmlUnitToSegment(xmlUnit)
    ).toStrictEqual({
       "type":    "source",
       "context": "customKey",
       "source":  "Source Text",
       "target":  "",
    })
  })
})

describe('recomposeTarget', () => {
  beforeEach(() => {
    base = new Base()
  });

  // fixed bug: {autres} was replaced with undefined
  test('Generate correct XLF using target from Translation.io API', () => {
    const segment = {
      // We can ignore other fields here
      "target": "{VAR_SELECT, select, male {un homme} female {une femme} other {autre} }",
    }

    const xmlUnit = base.xmlParser().parse(`
      <trans-unit id="7670372064920373295" datatype="html">
        <source>Source Text</source>
      </trans-unit>
    `)['trans-unit']

    xmlUnit.target = base.recomposeTarget(xmlUnit, segment)

    expect(base.xmlBuilder().build(xmlUnit)).toEqual(
      [
        '<source>Source Text</source>',
        '<target>{VAR_SELECT, select, male {un homme} female {une femme} other {autre} }</target>',
        ''
      ].join("\n")
    )
  })

  // fixed bug: 2 x single-quotes ('') should be replaced by a single one (&apos; after escape) if they are inside ICU strings
  // T.io uses two single-quotes by default when recomposing ICU strings (it's totally valid!),
  // but Angular only accepts one and ignores the other syntax, so we need to adapt ouselves here (too specific to do on the backend!)
  test('Generate correct XLF even when words with quotes inside ICU strings', () => {
    const segment = {
      // We can ignore other fields here
      "target": "{VAR_PLURAL, plural, one {l''homme et l''animal} other {d''autres hommes et des animaux}}",
    }

    const xmlUnit = base.xmlParser().parse(`
      <trans-unit id="7670372064920373295" datatype="html">
        <source>Source Text</source>
      </trans-unit>
    `)['trans-unit']

    xmlUnit.target = base.recomposeTarget(xmlUnit, segment)

    expect(base.xmlBuilder().build(xmlUnit)).toEqual(
      [
        '<source>Source Text</source>',
        "<target>{VAR_PLURAL, plural, one {l&apos;homme et l&apos;animal} other {d&apos;autres hommes et des animaux}}</target>",
        ''
      ].join("\n")
    )
  })
})
