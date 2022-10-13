const Interpolation = require('../utils/interpolation')

const fs                        = require('fs')
const path                      = require('path')
const { XMLParser, XMLBuilder } = require('fast-xml-parser')
const { parse: icuParse }       = require('@formatjs/icu-messageformat-parser')
const axios                     = require('axios').default
const httpsProxyAgent           = require('https-proxy-agent')

class Base {
  constructor(configFile) {
    this.configFile = configFile || 'tio.config.json' // default config file
  }

  /*------------------*/
  /* Config & Options */
  /*------------------*/
  validateConfig(action) {
    let valid = true

    try {
      this.options()
    } catch (error) {
      valid = false
    }

    if (! valid) {
      console.error(`\n⚠️ Your ${this.configFile} config file seems to be missing or is not a valid JSON.`)
    } else if (! this.apiKey().length) {
      console.error(`\n⚠️ The "api_key" parameter in your ${this.configFile} file seems to be missing.`)
      valid = false
    } else if (! this.sourceLanguage().length) {
      console.error(`\n⚠️ The "source_locale" parameter in your ${this.configFile} file seems to be missing.`)
      valid = false
    } else if (! this.targetLanguages().length || this.targetLanguages().some(language => ! language.length)) {
      console.error(`\n⚠️ The "target_locales" parameter in your ${this.configFile} file is missing or invalid.`)
      console.error(`\nPlease make sure that its value is an array of locale codes (e.g.: ["fr", "it"])`)
      valid = false
    } else if (this.targetLanguages().includes(this.sourceLanguage())) {
      console.error(`\n⚠️ The "target_locales" parameter in your ${this.configFile} file contains your source language (${this.sourceLanguage()}).`)
      console.error(`\nThis will not work with Translation.io. Please remove it from the "target_locales".`)
      valid = false
    } else if (! this.targetFilesPath().includes('{lang}')) {
      console.error(`\n⚠️ The "target_files_path" parameter in your ${this.configFile} file does not contain the "{lang}" placeholder.`)
      console.error(`\nPlease update this parameter so that it contains "{lang}", in order for the process to work.`)
      valid = false
    }

    if (! valid) {
      console.error(`\n❌ The ${action} process could not be executed, because some of the parameters in your ${this.configFile} file are invalid ❌`)
      process.exitCode = 1
    }

    return valid
  }

  options() {
    return JSON.parse(
      fs.readFileSync(this.configFile)
    )
  }

  sourceLanguage() {
    return (this.options()['source_locale'] || '').trim()
  }

  targetLanguages() {
    let locales = this.options()['target_locales']

    // The method should always return an array
    // The validateConfig() method will trigger a console error if it is an empty array
    return Array.isArray(locales) ? locales.map(locale => locale.trim()) : []
  }

  apiKey() {
    return this.options()['api_key'] || ''
  }

  endpoint() {
    return this.options()['endpoint'] || 'https://translation.io/api'
  }

  sourceFilePath() {
    return this.options()['source_file_path'] || './src/locale/messages.xlf'
  }

  targetFilesPath() {
    return this.options()['target_files_path'] || './src/locale/messages.{lang}.xlf'
  }

  sourceFile() {
    return this.sourceFilePath()
  }

  targetFile(language) {
    const regex = new RegExp('\{lang\}', 'g')
    const targetFile = this.targetFilesPath().replace(regex, language)

    const targetDir = path.dirname(targetFile)
    fs.mkdirSync(targetDir, { recursive: true })

    return targetFile
  }

  proxy() {
    return this.options()['proxy']
  }

  /*--------------------------*/
  /* XML Parser/Builder Utils */
  /*--------------------------*/

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

  forceArray(units) {
    let array = this.flattenArray([units])
    return array.filter(unit => unit) // Remove null and undefined values

  }

  // Recursive function to flatten an array
  flattenArray(array, depth = 1, stack = []) {
    for (const unit of array) {
      if (Array.isArray(unit) && depth > 0) {
        this.flattenArray(unit, depth - 1, stack);
      } else {
        stack.push(unit);
      }
    }
    return stack;
  }

  xmlNodeText(xmlNode) {
    if (typeof xmlNode === 'string' || xmlNode instanceof String) {
      return xmlNode
    } else if (xmlNode) {
      return xmlNode['#text']
    } else {
      return ''
    }
  }

  xmlUnitSource(xmlUnit) {
    let source

    source = this.xmlNodeText(xmlUnit.source)
    source = Interpolation.extract(source)['text']
    source = source.trim()
    source = this.unescapeEntities(source)

    return source
  }

  xmlUnitTarget(xmlUnit) {
    let source = this.xmlNodeText(xmlUnit.source)
    let target = this.xmlNodeText(xmlUnit.target)

    target = this.extractTarget(source, target) // Use interpolations from source to keep correct order in target
    target = target.trim()
    target = this.unescapeEntities(target)

    return target
  }

  // To put existing unit notes into array (even if just one)
  xmlUnitNotes(xmlUnit) {
    return this.forceArray(xmlUnit.note) // Ensure consistent array
  }

  // To put existing context groups into array (even if just one)
  xmlUnitContextGroups(xmlUnit) {
    return this.forceArray(xmlUnit['context-group']) // Ensure consistent array
  }

  xmlUnitContext(xmlUnit) {
    const notes       = this.xmlUnitNotes(xmlUnit)
    const id          = xmlUnit['@_id']
    const contextNote = notes.find(note => note['@_from'] === 'meaning')
    const isCustomId  = (id) => !/^\d+$|^\w{40}$/.test(id) // to separate generated IDs with manual IDs
                                                           // => old format: 7ad2c4ad8cd2978acd5e642c3825530e7ee7b7d7
                                                           // => new format: 392942015236586892

    if (isCustomId(id)) {
      if (contextNote) {
        return this.unescapeEntities(`${id} | ${contextNote['#text'].trim()}`)
      } else {
        return id
      }
    } else {
      if (contextNote) {
        return this.unescapeEntities(contextNote['#text'].trim())
      }
    }
  }

  xmlUnitComment(xmlUnit) {
    const notes       = this.xmlUnitNotes(xmlUnit)
    const contextNote = notes.find(note => note['@_from'] === 'description')

    if (contextNote) {
      return this.unescapeEntities(
        contextNote['#text'].trim()
      )
    }
  }

  xmlUnitReferences(xmlUnit) {
    let contextGroups = this.xmlUnitContextGroups(xmlUnit)

    contextGroups = contextGroups.filter(contextGroup => contextGroup['@_purpose'] === 'location')

    const references = contextGroups.map(contextGroup => {
      const sourceFile = contextGroup.context.find(context => context['@_context-type'] == 'sourcefile')['#text']
      const lineNumber = contextGroup.context.find(context => context['@_context-type'] == 'linenumber')['#text']

      return `${sourceFile}:${lineNumber}`
    })

    if (references.length) {
      return references
    }
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

  extractTarget(sourceText, targetText) {
    const sourceInterpolations = Interpolation.extract(sourceText)['interpolations']

    // First loop to keep same numerotation as source
    Object.entries(sourceInterpolations).forEach(interpolation => {
      const substitution = interpolation[0]
      const extraction   = interpolation[1]

      targetText = targetText.replace(extraction, substitution)
    })

    // Second loop to substitute all remaining duplicates (like multiple {x} in ICU plurals)
    Object.entries(sourceInterpolations).forEach(interpolation => {
      const substitution = interpolation[0]
      const extraction   = interpolation[1]

      targetText = targetText.replace(new RegExp(extraction, 'g'), substitution)
    })

    return targetText
  }

  /*-----------------------------------------------------------*/
  /* Wrapper for the axios client using a proxy, if applicable */
  /*-----------------------------------------------------------*/

  axiosClient() {
    let clientOptions = {}
    let proxy = this.proxy()

    if (proxy) {
      clientOptions = {
        httpsAgent: httpsProxyAgent(proxy)
      }
    }

    return axios.create(clientOptions)
  }

  /*----------------------------------------*/
  /* Save target .xlf files after init/sync */
  /*----------------------------------------*/

  checkEmptySource(segments) {
    if (segments.length == 0) {
      console.error()
      console.error("No segments were extracted from your project, please check the i18n syntax in your source files.")
      console.error("If the error persists, please contact us at contact@translation.io")
    }
  }

  writeTargetFiles(response) {
    // For each target language
    this.targetLanguages().forEach(language => {
      const targetFile = this.targetFile(language)

      // 1. Remove target .xlf file
      if (fs.existsSync(targetFile)) {
        fs.unlinkSync(targetFile)
      }

      // 2. Recreate it from generated .xlf template
      fs.copyFileSync(this.sourceFile(), targetFile)

      // 3. Load .xlf
      const targetRaw      = fs.readFileSync(targetFile)
      const targetXml      = this.xmlParser().parse(targetRaw)
      const targetXmlUnits = this.forceArray(targetXml.xliff.file.body['trans-unit']) // Ensure consistent array

      // 4 Populate the loaded .xlf it with targets from Translation.io
      const translatedTargetSegments = response.segments[language]
      const targetXmlUnitsHash       = this.buildXmlUnitsHash(targetXmlUnits)

      translatedTargetSegments.forEach(translatedTargetSegment => {
        let targetXmlUnit = targetXmlUnitsHash[this.uniqueIdentifier(translatedTargetSegment)]

        if (targetXmlUnit) {
          targetXmlUnit.target = this.recomposeTarget(targetXmlUnit, translatedTargetSegment)
        }
      })

      // 5. Build new target .xlf raw content and save it
      const translatedTargetRaw = this.xmlBuilder().build(targetXml)
      fs.writeFileSync(targetFile, translatedTargetRaw)
    })
  }

  // Use XML segment and API segment to build back the target with existing interpolations
  recomposeTarget(xmlUnit, segment) {
    const interpolations = Interpolation.extract(xmlUnit.source)['interpolations']
    let   escapedTarget  = segment.target

    // Detect ICU plural parts and do extra escape
    if (this.isIcuPluralString(segment.source) && this.isIcuPluralString(escapedTarget)) {
      // Replace double single-quotes and escape them
      // Angular doesn't manage the whole ICU syntax so we fix the result from Translation.io
      escapedTarget = this.escapeDoubleSingleQuotesFromIcuPlural(escapedTarget)

      // Angular < 9 doesn't support extra space in "{ VAR_PLURAL" at ICU start
      escapedTarget = escapedTarget.replace(/^{\sVAR_PLURAL,/, '{VAR_PLURAL,')
    }

    // Escape entities like ' and " to &apos; and &quot;
    escapedTarget = this.escapeEntities(escapedTarget)

    // Recompose {x} interpolations to <x id=INTERPOLATION .../>
    escapedTarget = Interpolation.recompose(escapedTarget, interpolations)

    return escapedTarget
  }

  uniqueIdentifier(segment) {
    return `${segment.source}|||${segment.context}`
  }

  // For O(1) search optimization
  buildXmlUnitsHash(xmlUnits) {
    let targetXmlUnitsHash = {}

    xmlUnits.forEach(xmlUnit => {
      const segment = this.convertXmlUnitToSegment(xmlUnit)
      targetXmlUnitsHash[this.uniqueIdentifier(segment)] = xmlUnit
    })

    return targetXmlUnitsHash
  }

  escapeDoubleSingleQuotesFromIcuPlural(icuPlural) {
    // cf. https://www.debuggex.com/r/KO9jkSfi2RVzHlVE
    // or  https://regex101.com/r/y90mJu/1
    let icuPartsWithQuotes = icuPlural.match(/(zero|one|two|few|many|other|=\d+)\s*{.*?''.*?}/g) || []

    icuPartsWithQuotes.forEach((part) => {
      const escapedPart = part.replace(/''/g, "'")
      icuPlural = icuPlural.replace(part, escapedPart)
    })

    return icuPlural
  }

  isIcuPluralString(text) {
    // Quick & Dirty ICU plural detection to avoid parsing each time ('s' flag = consider it like single line)
    if (/^\s*{[\s\S]*,\s*plural\s*,[\s\S]*}\s*$/.test(text)) {
      try { // Will catch exception if not correctly parsed (or if missing keys on parsed result)
        const icuNode = icuParse(text, {
          ignoreTag:            true,  // HTML tags are not parsed as tokens
          requiresOtherClause:  false, // an ICU without other is kinda stupid, but we tolerate it for the source
          shouldParseSkeletons: false  // Whether to parse number/datetime skeleton as tokens
        })[0]

        const cases = Object.keys(icuNode.options || {})

        return icuNode.pluralType == 'cardinal' && cases.includes('other')
      } catch (error) {
        return false
      }
    } else {
      return false
    }
  }
}

module.exports = Base

