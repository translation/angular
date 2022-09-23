class HtmlTagExtraction {
  static resetStack() {
    this.tagStack = {}
    this.tagTotal = 0
  }

  static isOpeningTag(extraction) {
    return extraction.includes('equiv-text="&lt;') && extraction.includes('&gt;"') && !this.isClosingTag(extraction) && !this.isSelfClosingTag(extraction)
  }

  static isClosingTag(extraction) {
    return extraction.includes('equiv-text="&lt;/') && extraction.includes('&gt;"')
  }

  static isSelfClosingTag(extraction) {
    const id = this.getTagId(extraction)
    return ['LINE_BREAK','HORIZONTAL_RULE'].includes(id) || (extraction.includes('equiv-text="&lt;') && extraction.includes('/&gt;"'))
  }

  static addToStackAndGetNextIndex(extraction) {
    const htmlTag = this.detectHtmlTag(extraction)

    this.tagTotal += 1

    this.tagStack[htmlTag] ||= []
    this.tagStack[htmlTag].push(this.tagTotal)

    return this.tagTotal
  }

  static removeFromStackAndGetNextIndex(extraction) {
    const htmlTag = this.detectHtmlTag(extraction)

    return this.tagStack[htmlTag].pop()
  }

  static detectHtmlTag(extraction) {
    let htmlTag = 'span'

    // 4 fallbacks to detect correct HTML tag:

    if (extraction.includes(' ctype="')) {       // 1. Most extraction have a c-type like "x-em" or "x-strong" (easiest!)
      htmlTag = this.getCType(extraction)
    } else if (extraction.includes(' id="')) {   // Fallback to id if no c-type (don't know why it happens. because of extra-attributes on tag?)
      let id = this.getTagId(extraction)

      if (id.startsWith('TAG_')) {               // 2. if id is TAG_SOMETHING, html tag is "something"
        htmlTag = id.replace(/^TAG_(.+)/, (_, tagName) => tagName.toLowerCase())
      } else {                                   // 3. if id is in Angular list, use it!
        htmlTag = this.getTagMap()[id] || 'span' // 4. span is nothing else if found
      }
    }

    return htmlTag
  }

  static getCType(extraction) {
    let htmlTag = extraction.split(' ctype="', 2)[1].split('"', 2)[0]
    if (htmlTag.startsWith('x-')) {
      htmlTag = htmlTag.replace(/^x-/, '')
    }
    return htmlTag
  }

  static getTagId(extraction) {
    let id = extraction.split(' id="', 2)[1].split('"', 2)[0]
    id = id.replace(/^(START_|CLOSE_)/, '')
    id = id.replace(/_[0-9]+$/, '')
    return id
  }

  // Cf. List: https://github.com/angular/angular/blob/3a60063a54d850c50ce962a8a39ce01cfee71398/packages/compiler/src/i18n/serializers/placeholder.ts#L9
  static getTagMap() {
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
    }
  }
}

module.exports = HtmlTagExtraction
