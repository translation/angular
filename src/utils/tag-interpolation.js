class TagInterpolation {
  static resetStack() {
    this.tagStack =  []
    this.tagTotal =  0
  }

  static isSelfClosingTag(extraction) {
    const id = this.getTagId(extraction)
    return (['LINE_BREAK','HORIZONTAL_RULE'].includes(id)) || (extraction.includes('equiv-text="&lt;') && extraction.includes('equiv-text="/&lt;'))
  }

  static isClosingTag(extraction) {
    return extraction.includes('equiv-text="&lt;/') && extraction.includes('&gt;"')
  }

  static isOpeningTag(extraction) {
    return extraction.includes('equiv-text="&lt;') && extraction.includes('&gt;"')
  }

  static addToStackAndGetNextIndex(extraction) {
    let type
    this.tagTotal++

    if (type = this.detectTagType(extraction)) {
      this.tagStack[type] = this.tagStack[type] || []
      this.tagStack[type].push(this.tagTotal)
    }

    return this.tagTotal
  }

  static removeFromStackAndGetNextIndex(extraction) {
    let type

    if (type = this.detectTagType(extraction)) {
      return this.tagStack[type].pop()
    } else {
      this.tagTotal++
      return this.tagTotal
    }
  }

  static detectTagType(extraction) {
    let type = 'span'

    if (extraction.includes(' ctype="')) {
      type = this.getCType(extraction)
    } else if (extraction.includes(' id="')) {
      let id = this.getTagId(extraction)

      if (id.startsWith('TAG_')) {
        type = id.replace(/^TAG_(.+)/, (_, tagName) => tagName.toLowerCase())
      } else {
        type = this.getTagMap()[id] || 'span'
      }
    }

    return type
  }

  static getCType(extraction) {
    let type = extraction.split(' ctype="', 2)[1].split('"', 2)[0]
    if (type.startsWith('x-')) {
      type = type.replace(/^x-/, '')
    }
    return type
  }

  static getTagId(extraction) {
    let id = extraction.split(' id="', 2)[1].split('"', 2)[0]
    id = id.replace(/^(START_|CLOSE_)/, '')
    id = id.replace(/_[0-9]+$/, '')
    return id
  }

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

module.exports = TagInterpolation
