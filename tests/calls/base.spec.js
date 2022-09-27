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
       type:   "source",
       source: "Source Text",
       target: "",
    })
  })


  test('Convert simple translated with generic (ignored) key', () => {
    const xmlUnit = base.xmlParser().parse(`
      <trans-unit id="7670372064920373295" datatype="html">
        <source>Source Text</source>
        <target>Target Text</target>
      </trans-unit>
    `)['trans-unit']

    expect(
      base.convertXmlUnitToSegment(xmlUnit)
    ).toStrictEqual({
       type:   "source",
       source: "Source Text",
       target: "Target Text",
    })
  })

  test('Convert simple translated with generic (ignored) old-format key', () => {
    const xmlUnit = base.xmlParser().parse(`
      <trans-unit id="7ad2c4ad8cd2978acd5e642c3825530e7ee7b7d7" datatype="html">
        <source>Source Text</source>
        <target>Target Text</target>
      </trans-unit>
    `)['trans-unit']

    expect(
      base.convertXmlUnitToSegment(xmlUnit)
    ).toStrictEqual({
       type:   "source",
       source: "Source Text",
       target: "Target Text",
    })
  })

  test('Convert simple with custom key (converted as context)', () => {
    const xmlUnit = base.xmlParser().parse(`
      <trans-unit id="customKey" datatype="html">
        <source>Source Text</source>
      </trans-unit>
    `)['trans-unit']

    expect(
      base.convertXmlUnitToSegment(xmlUnit)
    ).toStrictEqual({
       type:    "source",
       context: "customKey",
       source:  "Source Text",
       target:  "",
    })
  })

  test('Convert simple with meaning (converted as context)', () => {
    const xmlUnit = base.xmlParser().parse(`
      <trans-unit id="7670372064920373295" datatype="html">
        <source>Date</source>
        <target>Rendez-vous romantique</target>
        <note priority="1" from="meaning">As in a rendez-vous</note>
      </trans-unit>
    `)['trans-unit']

    expect(
      base.convertXmlUnitToSegment(xmlUnit)
    ).toStrictEqual({
       type:    "source",
       context: "As in a rendez-vous",
       source:  "Date",
       target:  "Rendez-vous romantique",
    })
  })

  test('Convert simple with description (converted as comment)', () => {
    const xmlUnit = base.xmlParser().parse(`
      <trans-unit id="7670372064920373295" datatype="html">
        <source>Usage</source>
        <target>Instructions</target>
        <note priority="1" from="description">In the top menu, on the frontpage</note>
      </trans-unit>
    `)['trans-unit']

    expect(
      base.convertXmlUnitToSegment(xmlUnit)
    ).toStrictEqual({
       type:    "source",
       comment: "In the top menu, on the frontpage",
       source:  "Usage",
       target:  "Instructions"
    })
  })

  test('Convert simple with one location (converted as references)', () => {
    const xmlUnit = base.xmlParser().parse(`
      <trans-unit id="2002272803511843863" datatype="html">
        <source>Source Text</source>
        <target>Target Text</target>
        <context-group purpose="location">
          <context context-type="sourcefile">src/app/app.component.html</context>
          <context context-type="linenumber">18,21</context>
        </context-group>
      </trans-unit>
    `)['trans-unit']

    expect(
      base.convertXmlUnitToSegment(xmlUnit)
    ).toStrictEqual({
       type:    "source",
       source:  "Source Text",
       target:  "Target Text",
       references: ["src/app/app.component.html:18,21"]
    })
  })

  test('Convert simple with many locations (converted as references)', () => {
    const xmlUnit = base.xmlParser().parse(`
      <trans-unit id="2002272803511843863" datatype="html">
        <source>Source Text</source>
        <target>Target Text</target>
        <context-group purpose="location">
            <context context-type="sourcefile">src/app/app.component.html</context>
            <context context-type="linenumber">12</context>
          </context-group>
        <context-group purpose="location">
          <context context-type="sourcefile">src/app/app.component.html</context>
          <context context-type="linenumber">18,21</context>
        </context-group>
      </trans-unit>
    `)['trans-unit']

    expect(
      base.convertXmlUnitToSegment(xmlUnit)
    ).toStrictEqual({
       type:    "source",
       source:  "Source Text",
       target:  "Target Text",
       references: [
         "src/app/app.component.html:12",
         "src/app/app.component.html:18,21"
       ]
    })
  })

  test('Convert simple custom key and meaning (both converted to context)', () => {
    const xmlUnit = base.xmlParser().parse(`
      <trans-unit id="customKey" datatype="html">
        <source>Date</source>
        <target>Rendez-vous romantique</target>
        <note priority="1" from="meaning">As in a rendez-vous</note>
      </trans-unit>
    `)['trans-unit']

    expect(
      base.convertXmlUnitToSegment(xmlUnit)
    ).toStrictEqual({
       type:    "source",
       context: "customKey | As in a rendez-vous",
       source:  "Date",
       target:  "Rendez-vous romantique",
    })
  })

  test('Convert complex with all existing fields', () => {
    const xmlUnit = base.xmlParser().parse(`
      <trans-unit id="DateButton" datatype="html">
        <source>Date</source>
        <target>Rendez-vous romantique</target>
        <note priority="1" from="description">On our page about meeting new people</note>
        <note priority="1" from="meaning">As in a rendez-vous</note>
        <context-group purpose="location">
          <context context-type="sourcefile">src/app/app.date.html</context>
          <context context-type="linenumber">12</context>
        </context-group>
        <context-group purpose="location">
          <context context-type="sourcefile">src/app/app.date.html</context>
          <context context-type="linenumber">18,21</context>
        </context-group>
      </trans-unit>
    `)['trans-unit']

    expect(
      base.convertXmlUnitToSegment(xmlUnit)
    ).toStrictEqual({
       type:    "source",
       source:  "Date",
       target:  "Rendez-vous romantique",
       comment: "On our page about meeting new people",
       context: "DateButton | As in a rendez-vous",
       references: [
         "src/app/app.date.html:12",
         "src/app/app.date.html:18,21",
       ]
    })
  })

  test('Convert complex with all existing fields and weird chars', () => {
    const xmlUnit = base.xmlParser().parse(`
      <trans-unit id="DateButton &amp; &lt;DateCTA&gt;" datatype="html">
        <source>&quot;Date&quot;</source>
        <target>Rendez-vous romantique &amp; l&apos;espoir</target>
        <note priority="1" from="description">On our &lt;page&gt; about meeting &quot;new&quot; people</note>
        <note priority="1" from="meaning">As in a &quot;rendez-vous&quot;</note>
        <context-group purpose="location">
          <context context-type="sourcefile">src/app/app.date.html</context>
          <context context-type="linenumber">12</context>
        </context-group>
        <context-group purpose="location">
          <context context-type="sourcefile">src/app/app.date.html</context>
          <context context-type="linenumber">18,21</context>
        </context-group>
      </trans-unit>
    `)['trans-unit']

    expect(
      base.convertXmlUnitToSegment(xmlUnit)
    ).toStrictEqual({
       type:    "source",
       source:  '"Date"',
       target:  "Rendez-vous romantique & l'espoir",
       comment: 'On our <page> about meeting "new" people',
       context: 'DateButton & <DateCTA> | As in a "rendez-vous"',
       references: [
         "src/app/app.date.html:12",
         "src/app/app.date.html:18,21",
       ]
    })
  })

  test('Convert named ({variable}), unnamed ({x}), icu ({icu}) and HTML interpolations (low-level tests in interpolation.spec.js)', () => {
    const xmlUnit = base.xmlParser().parse(`
      <trans-unit id="2002272803511843863" datatype="html">
        <source>
          <x id="START_EMPHASISED_TEXT" ctype="x-em" equiv-text="&lt;em&gt;"/>Updated:<x id="CLOSE_EMPHASISED_TEXT" ctype="x-em" equiv-text="&lt;/em&gt;"/>
          <x id="INTERPOLATION" equiv-text="{{name}}"/> and <x id="INTERPOLATION"/> <x id="ICU" equiv-text="{minutes, plural,
            =0 {just now}
            =1 {one minute ago}
            other {{{minutes}} minutes ago by {gender, select, male {male} female {female} other {other}}}}" xid="6988904457887003660"/>
          with <x id="INTERPOLATION"/>, <x id="INTERPOLATION" equiv-text="{{   stuff }}"/> and <x id="INTERPOLATION_1"/>
        </source>
        <target><x id="INTERPOLATION" equiv-text="{{name}}"/></target>
      </trans-unit>
    `)['trans-unit']

    expect(
      base.convertXmlUnitToSegment(xmlUnit)
    ).toStrictEqual({
       type:   "source",
       source: `<1>Updated:</1>
          {name} and {x1} {icu}
          with {x1}, {stuff} and {x2}`,
       target: '{name}'
    })
  })

  test('Convert source and target, and check that tag and interpolation order from target matches the source', () => {
    const xmlUnit = base.xmlParser().parse(`
      <trans-unit id="2002272803511843863" datatype="html">
        <source>
          A series of <x id="START_EMPHASISED_TEXT" ctype="x-em" equiv-text="&lt;em&gt;"/>non-nested<x id="CLOSE_EMPHASISED_TEXT" ctype="x-em" equiv-text="&lt;/em&gt;"/> tag <x id="START_TAG_STRONG" ctype="x-strong" equiv-text="&lt;strong&gt;"/>interpolations<x id="CLOSE_TAG_STRONG" ctype="x-strong" equiv-text="&lt;/strong&gt;"/>.
        </source>
        <target>
          Une série <x id="START_TAG_STRONG" ctype="x-strong" equiv-text="&lt;strong&gt;"/>d&apos;interpolations<x id="CLOSE_TAG_STRONG" ctype="x-strong" equiv-text="&lt;/strong&gt;"/> de balises <x id="START_EMPHASISED_TEXT" ctype="x-em" equiv-text="&lt;em&gt;"/>non-imbriquées<x id="CLOSE_EMPHASISED_TEXT" ctype="x-em" equiv-text="&lt;/em&gt;"/>.
        </target>
      </trans-unit>
    `)['trans-unit']

    expect(
      base.convertXmlUnitToSegment(xmlUnit)
    ).toStrictEqual({
       type:   "source",
       source: "A series of <1>non-nested</1> tag <2>interpolations</2>.",
       target: "Une série <2>d'interpolations</2> de balises <1>non-imbriquées</1>."
    })
  })

  test('Convert source and target, and check that tag and interpolation order from target matches the source, even with multiple similar closing tags', () => {
    const xmlUnit = base.xmlParser().parse(`
      <trans-unit id="5333372789835402443" datatype="html">
        <source>A series of <x id="START_EMPHASISED_TEXT_1" equiv-text="&lt;em style=&quot;color:green&quot;&gt;"/>nested <x id="START_TAG_STRONG" ctype="x-strong" equiv-text="&lt;strong data-id=&quot;42&quot;&gt;"/>tag<x id="CLOSE_TAG_STRONG" ctype="x-strong" equiv-text="&lt;/strong&gt;"/> interpolations <x id="START_EMPHASISED_TEXT" ctype="x-em" equiv-text="&lt;em style=&quot;color:red&quot;&gt;"/>with<x id="CLOSE_EMPHASISED_TEXT" ctype="x-em" equiv-text="&lt;/em&gt;"/> attributes<x id="CLOSE_EMPHASISED_TEXT" ctype="x-em" equiv-text="&lt;/em&gt;"/>.</source>
        <target>Une série <x id="START_EMPHASISED_TEXT_1" equiv-text="&lt;em style=&quot;color:green&quot;&gt;"/>d&apos;interpolations de <x id="START_TAG_STRONG" ctype="x-strong" equiv-text="&lt;strong data-id=&quot;42&quot;&gt;"/>balises<x id="CLOSE_TAG_STRONG" ctype="x-strong" equiv-text="&lt;/strong&gt;"/> imbriquées <x id="START_EMPHASISED_TEXT" ctype="x-em" equiv-text="&lt;em style=&quot;color:red&quot;&gt;"/>avec<x id="CLOSE_EMPHASISED_TEXT" ctype="x-em" equiv-text="&lt;/em&gt;"/> des attributs<x id="CLOSE_EMPHASISED_TEXT" ctype="x-em" equiv-text="&lt;/em&gt;"/>.</target>
      </trans-unit>
    `)['trans-unit']

    expect(
      base.convertXmlUnitToSegment(xmlUnit)
    ).toStrictEqual({
       type:   "source",
       source: "A series of <1>nested <2>tag</2> interpolations <3>with</3> attributes</1>.",
       target: "Une série <1>d'interpolations de <2>balises</2> imbriquées <3>avec</3> des attributs</1>."
    })
  })

  test('Convert source and target from ICU plural, and check that variable of both plural forms is replaced correctly', () => {
    const xmlUnit = base.xmlParser().parse(`
      <trans-unit id="2002272803511843863" datatype="html">
        <source>{VAR_PLURAL, plural, =0 {just now} =1 {one minute ago} other {<x id="INTERPOLATION"/> minutes ago}}</source>
        <target>{VAR_PLURAL, plural, =0 {à l&apos;instant} =1 {il y a une minute} one {il y a <x id="INTERPOLATION"/> minute} other {Il y a <x id="INTERPOLATION"/> minutes} }</target>
      </trans-unit>
    `)['trans-unit']

    expect(
      base.convertXmlUnitToSegment(xmlUnit)
    ).toStrictEqual({
       type:   "source",
       source: "{VAR_PLURAL, plural, =0 {just now} =1 {one minute ago} other {{x} minutes ago}}",
       target: "{VAR_PLURAL, plural, =0 {à l'instant} =1 {il y a une minute} one {il y a {x} minute} other {Il y a {x} minutes} }"
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
       type:   "source",
       source: "Source Text",
       target: "Target     Text",
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
      target: "{VAR_SELECT, select, male {un homme} female {une femme} other {autre} }",
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
      source: "{VAR_PLURAL, plural, one {the man and the animal} other {other men and animals}}",
      target: "{VAR_PLURAL, plural, one {l''homme et l''animal} other {d''autres hommes et des animaux}}",
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
      source: `{VAR_PLURAL, plural,
          one {the man and the animal}
          other {other men and animals}}`,
      target: `{VAR_PLURAL, plural,
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
      source: "{VAR_PLURAL, plural, =0 {just now} =1 {one minute ago} other {{minutes} minutes ago} }",
      target: "{ VAR_PLURAL, plural, =0 {à l''instant} =1 {il y a une minute} one {il y a {minutes} minute} other {il y a {minutes} minutes} }",
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

  test('Test on many cases', () => {
    // Classic tests
    expect(base.isIcuPluralString("Hello world"                               )).toEqual(false)
    expect(base.isIcuPluralString("{ count, plural, one {cat} other {cats} }" )).toEqual(true)
    expect(base.isIcuPluralString("{ count, plural2, one {cat} other {cats} }")).toEqual(false)
    expect(base.isIcuPluralString("{ count plural, one {cat} other {cats} }"  )).toEqual(false)
    expect(base.isIcuPluralString("{ count, plural, one {cat} other {cats}"   )).toEqual(false)
    expect(base.isIcuPluralString("{ count, plural, something {hey}}"         )).toEqual(false)
    expect(base.isIcuPluralString("{ count, plural, hey}"                     )).toEqual(false)

    // With interpolations
    expect(base.isIcuPluralString("{ count, plural, one {Hello # cat} other {Hello # cats} }"            )).toEqual(true)
    expect(base.isIcuPluralString("{ count, plural, one {Hello {count} cat} other {Hello {count} cats} }")).toEqual(true)
    expect(base.isIcuPluralString("{ count, plural, one {Hello {count} cat} two {Hello {count} cats} other {Hello {count} cats} }")).toEqual(true)

    // 'other' plural form is mandatory in many implementations
    expect(base.isIcuPluralString("{ count, plural, one {cat} }")).toEqual(false)

    // Extra spaces between cases shouldn't matter
    expect(base.isIcuPluralString("{count,      plural,      one    {cat} other {cats}       } ")).toEqual(true)

    // 'several' is a case that doesn't exist (but accepted anyway in the parsing library? Weird!)
    expect(base.isIcuPluralString("{ count, plural, several {cat} other {cats} }")).toEqual(true)

    // With multilines
    expect(base.isIcuPluralString(`{ count, plural,
      one {cat}
      other {cats} }`)).toEqual(true)
  })
})
