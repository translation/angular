const Interpolation = require('../utils/interpolation')

const fs = require('fs')
const { XMLParser, XMLBuilder } = require('fast-xml-parser')

class Base {
  constructor(configFile) {
    this.configFile = configFile || 'tio.config.json' // default config file
  }

  /* OPTIONS */

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

  /* XML Parser/Builder Utils */

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
    Object.keys(segment).forEach(key => segment[key] === undefined ? delete segment[key] : {})

    return segment
  }

  xmlUnitSource(xmlUnit) {
    let source = ''

    if (typeof xmlUnit.source === 'string' || xmlUnit.source instanceof String) {
      source = xmlUnit.source
    } else {
      source = xmlUnit.source['#text']
    }

    source = Interpolation.escape(source)['text']

    return this.unescapeEntities(source)
  }

  xmlUnitTarget(xmlUnit) {
    let target = ''

    if (xmlUnit.target) {
      if (typeof xmlUnit.target === 'string' || xmlUnit.target instanceof String) {
        target = xmlUnit.target
      } else {
        target = xmlUnit.target['#text']
      }
    }

    target = Interpolation.escape(target)['text']

    return this.unescapeEntities(target)
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
    const notes       = this.xmlUnitNotes(xmlUnit)
    const id          = xmlUnit['@_id']
    const contextNote = notes.find(note => note['@_from'] === 'meaning')
    const isCustomId  = (id) => !/^\d+$/.test(id) // to separate generated IDs with manual IDs

    if (isCustomId(id)) {
      if (contextNote) {
        return `${id} | ${contextNote['#text']}`
      } else {
        return id.toString()
      }
    } else {
      if (contextNote) {
        return contextNote['#text']
      }
    }
  }

  xmlUnitComment(xmlUnit) {
    const notes       = this.xmlUnitNotes(xmlUnit)
    const contextNote = notes.find(note => note['@_from'] === 'description')

    if (contextNote) {
      return contextNote['#text']
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

  unescapeEntities(text) {
    return text.replace(/&quot;/g, '"')
               .replace(/&apos;/g, "'")
               .replace(/&lt;/g,   '<')
               .replace(/&gt;/g,   '>')
               .replace(/&amp;/g,  '&')
  }

  escapeEntities(text) {
    return text.replace(/&/g, '&amp;')
               .replace(/>/g, '&gt;')
               .replace(/</g, '&lt;')
               .replace(/'/g, '&apos;')
               .replace(/"/g, '&quot;')
  }

  uniqueIdentifier(segment) {
    return `${segment.source}|||${segment.context}`
  }

  writeTargetFiles(response) {
    this.targetLanguages().forEach(language => {
      const targetFile = this.targetFile(language)

      // 1. Remove target .xlf file
      if (fs.existsSync(targetFile)) {
        fs.unlinkSync(targetFile)
      }

      // 2. Recreate it from generated .xlf template
      fs.copyFileSync(this.sourceFile(), targetFile)

      // 3. Load XML and...
      const targetRaw      = fs.readFileSync(targetFile)
      const targetXml      = this.xmlParser().parse(targetRaw)
      const targetXmlUnits = targetXml.xliff.file.body['trans-unit']

      const translatedTargetSegments = response.segments[language]

      // TODO extract: Create hash to get target segments in O(1)
      const targetXmlUnitsHash = {}
      targetXmlUnits.forEach(targetXmlUnit => {
        const targetSegment = this.convertXmlUnitToSegment(targetXmlUnit)
        targetXmlUnitsHash[this.uniqueIdentifier(targetSegment)] = targetXmlUnit
      })
      ///

      // 4 ... populate it with targets from Translation.io
      translatedTargetSegments.forEach(translatedTargetSegment => {
        let targetXmlUnit = targetXmlUnitsHash[this.uniqueIdentifier(translatedTargetSegment)]

        // Overwrite XML target value of this segment
        if (targetXmlUnit) {
          const interpolations = Interpolation.escape(targetXmlUnit.source)['interpolations']
          targetXmlUnit.target = Interpolation.unescape(this.escapeEntities(translatedTargetSegment.target), interpolations)
        }
      })

      // 5. Build XML raw content and save it
      const translatedTargetRaw = this.xmlBuilder().build(targetXml)
      fs.writeFileSync(targetFile, translatedTargetRaw)
    })
  }
}

module.exports = Base

