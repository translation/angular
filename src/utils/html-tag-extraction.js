class HtmlTagExtraction {
  static resetStack() {
    this.tagStack = {} // Examples:
                       // * { em: [ 1, 2 ], strong: [ 3, 4 ] } means that, at that point of the extraction, 1 & 2 are still opened <em>, and 3 & 4 are still opened <strong>
                       // * { em: [ 1 ], strong: [ 5 ] }       means that, at that point of the extraction, the 1st <em> and the 5th <strong> are still open. 2, 3, 4 have been closed already

    this.number = 1 // Number of next extracted opening or self-closing html tag
  }

  static isOpeningTag(extraction) {
    return extraction.includes('equiv-text="&lt;') && extraction.includes('&gt;"') && !this.isClosingTag(extraction) && !this.isSelfClosingTag(extraction)
  }

  static isClosingTag(extraction) {
    return extraction.includes('equiv-text="&lt;/') && extraction.includes('&gt;"')
  }

  static isSelfClosingTag(extraction) {
    const id = this.getId(extraction)
    return ['LINE_BREAK','HORIZONTAL_RULE'].includes(id) || (extraction.includes('equiv-text="&lt;') && extraction.includes('/&gt;"'))
  }

  static addToStackAndGetNumber(extraction) {
    const htmlTag = this.detectHtmlTag(extraction)

    this.tagStack[htmlTag] = this.tagStack[htmlTag] || []
    this.tagStack[htmlTag].push(this.number)

    this.number += 1

    return this.number - 1
  }

  static removeFromStackAndGetNumber(extraction) {
    const htmlTag = this.detectHtmlTag(extraction)

    return this.tagStack[htmlTag].pop()
  }

  static detectHtmlTag(extraction) {
    let htmlTag = 'span'

    // 4 fallbacks to detect correct HTML tag:

    if (extraction.includes(' ctype="')) {       // 1. Most extraction have a c-type like "x-em" or "x-strong" (easiest!)
      htmlTag = this.getCType(extraction)
    } else if (extraction.includes(' id="')) {   // Fallback to id if no c-type (don't know why it happens. because of extra-attributes on tag?)
      let id = this.getId(extraction)

      if (id.startsWith('TAG_')) {               // 2. if id is TAG_SOMETHING, html tag is "something"
        htmlTag = id.replace(/^TAG_/, '').toLowerCase()
      } else {                                   // 3. if id is in Angular list, use it!
        htmlTag = this.angularIdToHtmlTag(id) || 'span' // 4. span is nothing else if found
      }
    }

    return htmlTag
  }

  static getCType(extraction) {
    let htmlTag = extraction.split(' ctype="', 2)[1].split('"', 2)[0]
    if (htmlTag.startsWith('x-')) {
      htmlTag = htmlTag.replace(/^x-/, '')
      htmlTag = htmlTag.replace(/_[0-9]+$/, '')

    }
    return htmlTag
  }

  static getId(extraction) {
    let id = extraction.split(' id="', 2)[1].split('"', 2)[0]
    id = id.replace(/^(START_|CLOSE_)/, '')
    id = id.replace(/_[0-9]+$/, '')
    return id
  }

  // Cf. List: https://github.com/angular/angular/blob/3a60063a54d850c50ce962a8a39ce01cfee71398/packages/compiler/src/i18n/serializers/placeholder.ts#L9
  static angularIdToHtmlTag(id) {
    return {
      'LINK':               'a',
      'BOLD_TEXT':          'b',
      'EMPHASISED_TEXT':    'em',
      'HEADING_LEVEL1':     'h1',
      'HEADING_LEVEL2':     'h2',
      'HEADING_LEVEL3':     'h3',
      'HEADING_LEVEL4':     'h4',
      'HEADING_LEVEL5':     'h5',
      'HEADING_LEVEL6':     'h6',
      'HORIZONTAL_RULE':    'hr',
      'ITALIC_TEXT':        'i',
      'LINE_BREAK':         'lb',
      'LIST_ITEM':          'li',
      'MEDIA_LINK':         'link',
      'ORDERED_LIST':       'ol',
      'PARAGRAPH':          'p',
      'QUOTATION':          'q',
      'STRIKETHROUGH_TEXT': 's',
      'SMALL_TEXT':         'small',
      'SUBSTRIPT':          'sub',
      'SUPERSCRIPT':        'sup',
      'TABLE_BODY':         'tbody',
      'TABLE_CELL':         'td',
      'TABLE_FOOTER':       'tfoot',
      'TABLE_HEADER_CELL':  'th',
      'TABLE_HEADER':       'thead',
      'TABLE_ROW':          'tr',
      'MONOSPACED_TEXT':    'tt',
      'UNDERLINED_TEXT':    'u',
      'UNORDERED_LIST':     'ul'
    }[id]
  }
}

module.exports = HtmlTagExtraction
