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
})
