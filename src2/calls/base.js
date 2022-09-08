const fs = require('fs')
const { XMLParser, XMLBuilder } = require('fast-xml-parser')

class Base {
  constructor(configFile) {
    this.configFile = configFile || 'tio.config.json' // default config file
  }

  options() {
    return JSON.parse(
      fs.readFileSync(this.configFile)
    )
  }

  sourceLanguage() {
    return this.options()['source_locale'].trim()
  }

  targetLanguages() {
    return this.options()['target_locales'].map(locale => locale.trim())
  }

  apiKey() {
    return this.options()['api_key']
  }

  endpoint() {
    return this.options()['endpoint'] || 'https://translation.io/api'
  }

  // localeTemplatePath() {
  //   return this.options()['locale_template_path'] || `./src/locale/messages.{locale}.xlf`
  // }

  sourceFile() {
    return './src/locale/messages.xlf'
  }

  targetFile(language) {
    return `./src/locale/messages.${language}.xlf`
  }

  xmlParser() {
    return new XMLParser({
      ignoreAttributes: false,
      processEntities:  false,                   // https://github.com/NaturalIntelligence/fast-xml-parser/blob/master/docs/v4/5.Entities.md
      stopNodes:        ['*.source', '*.target'] // https://github.com/NaturalIntelligence/fast-xml-parser/blob/master/docs/v4/2.XMLparseOptions.md#stopnodes
    })
  }

  xmlBuilder() {
    return new XMLBuilder({
      ignoreAttributes: false,
      format:           true,
      processEntities:  false
    })
  }

  convertXmlUnitsToSegments(xmlUnits) {
    return Array.from(xmlUnits).map(xmlUnit =>
      this.convertXmlUnitToSegment(xmlUnit)
    )
  }

  convertXmlUnitToSegment(xmlUnit) {
    let segment = {
      type:       'source',
      source:     this.xmlUnitSource(xmlUnit),
      target:     this.xmlUnitTarget(xmlUnit),
      context:    this.xmlUnitContext(xmlUnit),
      comment:    this.xmlUnitComment(xmlUnit),
      references: this.xmlUnitReferences(xmlUnit)
    }

    // Remove keys with undefined value
    Object.keys(segment).forEach(key => segment[key] === undefined ? delete segment[key] : {});

    return segment;
  }

  xmlUnitSource(xmlUnit) {
    if (typeof xmlUnit.source === 'string' || xmlUnit.source instanceof String) {
      return xmlUnit.source
    } else {
      return xmlUnit.source['#text']
    }
  }

  xmlUnitTarget(xmlUnit) {
    if (xmlUnit.target) {
      if (typeof xmlUnit.target === 'string' || xmlUnit.target instanceof String) {
        return xmlUnit.target
      } else {
        return xmlUnit.target['#text']
      }
    } else {
      return ''
    }
  }

  // To put existing unit notes into array (even if just one)
  xmlUnitNotes(xmlUnit) {
    let notes = []

    if (xmlUnit.note) {
      if (Array.isArray(xmlUnit.note)) {
        notes = xmlUnit.note
      } else { // object
        notes = [xmlUnit.note]
      }
    }

    return notes
  }

  // To put existing context groups into array (even if just one)
  xmlUnitContextGroups(xmlUnit) {
    let contextGroups = []

    if (xmlUnit['context-group']) {
      if (Array.isArray(xmlUnit['context-group'])) {
        contextGroups = xmlUnit['context-group']
      } else { // object
        contextGroups = [xmlUnit['context-group']]
      }
    }

    return contextGroups
  }

  xmlUnitContext(xmlUnit) {
    const notes = this.xmlUnitNotes(xmlUnit)

    const contextNote = notes.find(note => note['@_from'] === 'meaning')

    if (contextNote) {
      return contextNote['#text']
    } else {
      return undefined
    }
  }

  xmlUnitComment(xmlUnit) {
    const notes = this.xmlUnitNotes(xmlUnit)

    const contextNote = notes.find(note => note['@_from'] === 'description')

    if (contextNote) {
      return contextNote['#text']
    } else {
      return undefined
    }
  }

  xmlUnitReferences(xmlUnit) {
    let contextGroups = this.xmlUnitContextGroups(xmlUnit)

    contextGroups = contextGroups.filter(contextGroup => contextGroup['@_purpose'] === 'location')

    return contextGroups.map(contextGroup => {
      const sourceFile = contextGroup.context.find(context => context['@_context-type'] == 'sourcefile')['#text']
      const lineNumber = contextGroup.context.find(context => context['@_context-type'] == 'linenumber')['#text']

      return `${sourceFile}:${lineNumber}`
    })
  }

  findExistingTarget(sourceSegment, targetSegments) {
    const targetSegment = targetSegments.find(targetSegment => {
      return sourceSegment.source === targetSegment.source && sourceSegment.context === targetSegment.context
    })

    if (targetSegment) {
      return targetSegment['target']
    } else {
      return ''
    }
  }
}

module.exports = Base

