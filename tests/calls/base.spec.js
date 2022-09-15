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
  // T.io uses two single-quotes by default when recomposing ICU plural strings (it's totally valid!),
  // but Angular only accepts one and ignores the other syntax, so we need to adapt ouselves here (too specific to do on the backend!)
  test('Generate correct XLF even when words with quotes inside ICU plural strings', () => {
    const segment = {
      // We can ignore other fields here
      "source": "{VAR_PLURAL, plural, one {the man and the animal} other {other men and animals}}",
      "target": "{VAR_PLURAL, plural, one {l''homme et l''animal} other {d''autres hommes et des animaux}}",
    }

    const xmlUnit = base.xmlParser().parse(`
      <trans-unit id="7670372064920373295" datatype="html">
        <source>{VAR_PLURAL, plural, one {the man and the animal} other {other men and animals}}</source>
      </trans-unit>
    `)['trans-unit']

    xmlUnit.target = base.recomposeTarget(xmlUnit, segment)

    expect(base.xmlBuilder().build(xmlUnit)).toEqual(
      [
        '<source>{VAR_PLURAL, plural, one {the man and the animal} other {other men and animals}}</source>',
        "<target>{VAR_PLURAL, plural, one {l&apos;homme et l&apos;animal} other {d&apos;autres hommes et des animaux}}</target>",
        ''
      ].join("\n")
    )
  })

  test('Generate correct XLF even when words with quotes inside ICU plural strings - works with multiline', () => {
    const segment = {
      // We can ignore other fields here
      "source": `{VAR_PLURAL, plural,
          one {the man and the animal}
          other {other men and animals}}`,
      "target": `{VAR_PLURAL, plural,
          one {l''homme et l''animal}
          other {d''autres hommes et des animaux}}`,
    }

    const xmlUnit = base.xmlParser().parse(`
      <trans-unit id="7670372064920373295" datatype="html">
        <source>{VAR_PLURAL, plural,
          one {the man and the animal}
          other {other men and animals}}</source>
      </trans-unit>
    `)['trans-unit']

    xmlUnit.target = base.recomposeTarget(xmlUnit, segment)

    expect(base.xmlBuilder().build(xmlUnit)).toEqual(
      [
        `<source>{VAR_PLURAL, plural,
          one {the man and the animal}
          other {other men and animals}}</source>`,
        `<target>{VAR_PLURAL, plural,
          one {l&apos;homme et l&apos;animal}
          other {d&apos;autres hommes et des animaux}}</target>`,
        ''
      ].join("\n")
    )
  })

  // fixed bug: Angular < 9 doesn't support extra space in "{ VAR_PLURAL" at ICU start of target
  // We need to remove it (it doesn't really matter for us)
  test('Remove extra space at the start of ICU (compatibility with Angular < 9)', () => {
    const segment = {
      // We can ignore other fields here
      "source": "{VAR_PLURAL, plural, =0 {just now} =1 {one minute ago} other {{minutes} minutes ago} }",
      "target": "{ VAR_PLURAL, plural, =0 {à l''instant} =1 {il y a une minute} one {il y a {minutes} minute} other {il y a {minutes} minutes} }",
    }

    const xmlUnit = base.xmlParser().parse(`
      <trans-unit id="7670372064920373295" datatype="html">
        <source>{VAR_PLURAL, plural, =0 {just now} =1 {one minute ago} other {{minutes} minutes ago} }</source>
      </trans-unit>
    `)['trans-unit']

    xmlUnit.target = base.recomposeTarget(xmlUnit, segment)

    expect(base.xmlBuilder().build(xmlUnit)).toEqual(
      [
        '<source>{VAR_PLURAL, plural, =0 {just now} =1 {one minute ago} other {{minutes} minutes ago} }</source>',
        "<target>{VAR_PLURAL, plural, =0 {à l&apos;instant} =1 {il y a une minute} one {il y a {minutes} minute} other {il y a {minutes} minutes} }</target>",
        ''
      ].join("\n")
    )
  })
})

describe('isIcuPluralString', () => {
  beforeEach(() => {
    base = new Base()
  });

  test('Test on simple cases', () => {
    // Classic tests
    expect(base.isIcuPluralString("Hello world")).toEqual(false)

    // is_icu_plural_string.call("Bonjour l'espace"                          ).should == false
    // is_icu_plural_string.call("{ count, plural, one {cat} other {cats} }" ).should == true
    // is_icu_plural_string.call("{ count, plural2, one {cat} other {cats} }").should == false
    // is_icu_plural_string.call("{ count plural, one {cat} other {cats} }"  ).should == false
    // is_icu_plural_string.call("{ count, plural, one {cat} other {cats}"   ).should == false
    // is_icu_plural_string.call("{ count, plural, something {hey}}"         ).should == false
    // is_icu_plural_string.call("{ count, plural, hey}"                     ).should == false

    // // With interpolations
    // is_icu_plural_string.call("{ count, plural, one {Hello # cat} other {Hello # cats} }"            ).should == true
    // is_icu_plural_string.call("{ count, plural, one {Hello {count} cat} other {Hello {count} cats} }").should == true
    // is_icu_plural_string.call("{ count, plural, one {Hello {count} cat} two {Hello {count} cats} other {Hello {count} cats} }").should == true

    // // 'other' plural form is mandatory in many implementations
    // is_icu_plural_string.call("{ count, plural, one {cat} }").should == false

    // // Extra spaces between cases shouldn't matter
    // is_icu_plural_string.call("{count,      plural,      one    {cat} other {cats}       } ").should == true

    // // 'several' is a case that doesn't exist (but accepted anyway in both parsing libraries? Weird!)
    // is_icu_plural_string.call("{ count, plural, several {cat} other {cats} }").should == true
  })
})
