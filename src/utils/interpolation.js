const HtmlTagExtraction = require('./html-tag-extraction')

class Interpolation {
  static extract(text) {
    const regexp         = /<x[\s\S]*?\/>/g // Use [\s\S] instead of . for multiline matching => https://stackoverflow.com/a/16119722/1243212
    const extractions    = text.match(regexp) || []
    let   escapedText    = `${text}`
    let   interpolations = {}

    HtmlTagExtraction.resetStack()

    extractions.forEach((extraction) => {
      const substitution = this.substitution(extraction, Object.keys(interpolations))

      escapedText = escapedText.replace(extraction, substitution) // Replace in string
      interpolations[substitution] = extraction                   // Save the substitution for "recompose"
    })

    // Don't number substitutions if only one the kind!
    if (escapedText.includes('{x1}') && !escapedText.includes('{x2}')) {
      escapedText = escapedText.replace(/\{x1\}/g, '{x}')
      this.renameKey(interpolations, '{x1}', '{x}')
    }

    if (escapedText.includes('{icu1}') && !escapedText.includes('{icu2}')) {
      escapedText = escapedText.replace(/\{icu1\}/g, '{icu}')
      this.renameKey(interpolations, '{icu1}', '{icu}')
    }

    return {
      text:           escapedText,
      interpolations: interpolations
    }
  }

  static recompose(escapedText, interpolations) {
    const substitutions = Object.keys(interpolations)
    let   text          = `${escapedText}`

    substitutions.forEach((substitution) => {
      const extraction = interpolations[substitution]

      text = text.replace(new RegExp(substitution, 'g'), extraction)
    })

    return text
  }

  // Substitutes the interpolation with an appropriate variable (specific or index-generated)
  // depending on already existing substitutions
  static substitution(extraction, existingSubstitutions) {
    let substitution, name, number

    if (extraction.includes('id="INTERPOLATION_') && ! extraction.includes('equiv-text=')) {        // {x2}, {x3}, ... // Interpolations in HTML templates
      number       = parseInt(extraction.split('id="INTERPOLATION_', 2)[1].split('"', 2)[0]) + 1
      substitution = `{x${number}}`
    } else if (extraction.includes('id="INTERPOLATION"') && ! extraction.includes('equiv-text=')) { // {x1} - May be converted later to {x} if only 1
      substitution = `{x1}`
    } else if (this.includesAll(extraction, ['id="INTERPOLATION', 'equiv-text="{{', '}}"'])) {      // {variable} or {complex | expression}
      name = extraction.split('equiv-text="{{', 2)[1].split('}}"', 2)[0].trim()

      if (/^[a-zA-Z_$][a-zA-Z_$0-9]*$/.test(name)) {                                                // {variable}
        substitution = `{${name}}`
      } else {                                                                                      // {complex | expression} transformed as {x}
        if (extraction.includes('id="INTERPOLATION_')) {
          number       = parseInt(extraction.split('id="INTERPOLATION_', 2)[1].split('"', 2)[0]) + 1
          substitution = `{x${number}}`
        } else {
          substitution = `{x1}`
        }
      }
    } else if (this.includesAll(extraction, ['id="PH_', 'equiv-text='])) {                          // {x2}, {x3}, ... // Interpolations (placeholders) in components, using $localize
      number       = parseInt(extraction.split('id="PH_', 2)[1].split('"', 2)[0]) + 1
      substitution = `{x${number}}`
    } else if (this.includesAll(extraction, ['id="PH"', 'equiv-text='])) {                          // {x1} - May be converted later to {x} if only 1
      substitution = `{x1}`
    } else if (extraction.includes('id="ICU')) {                                                    // {icu1}, {icu2}, ... - May be converted later to {icu} if only 1
      number       = (existingSubstitutions.join(" ").match(/{icu\d+?}/g) || []).length + 1
      substitution = `{icu${number}}`
    } else if (HtmlTagExtraction.isOpeningTag(extraction)) {                                        // <tag>
      number       = HtmlTagExtraction.addToStackAndGetNumber(extraction)
      substitution = `&lt;${number}&gt;`
    } else if (HtmlTagExtraction.isClosingTag(extraction)) {                                        // </tag>
      number       = HtmlTagExtraction.removeFromStackAndGetNumber(extraction)
      substitution = `&lt;/${number}&gt;`
    } else if (HtmlTagExtraction.isSelfClosingTag(extraction)) {                                    // <tag/>
      number       = HtmlTagExtraction.addToStackAndGetNumber(extraction)
      substitution = `&lt;${number}/&gt;`
    } else if (extraction.includes('<x id="') && this.excludesAll(extraction, ['id="INTERPOLATION', 'id="PH', 'id="ICU'])) { // {name} // Named interpolations (placeholders) in components, using $localize, excluding specific ids, so that they end up as parsing errors below
      name         = extraction.split('id="', 2)[1].split('"', 2)[0].trim()
      substitution = `{${name}}`
    } else {
      substitution = `{parsingError}`;
      console.error(`\n⚠️ No substitution found for this extraction: ${extraction}\nPlease check the validity of your XLF formatting.`);
    }

    return substitution
  }

  // Helper method (because String.prototype.includes() does not accept an array of strings)
  static includesAll(extraction, terms) {
    for (const term of terms) {
      if (! extraction.includes(term)) {
        return false
      }
    }
    return true
  }

  // Helper method (because String.prototype.excludes() doesn't exist and String.prototype.includes() does not accept an array of strings)
  static excludesAll(extraction, terms) {
    for (const term of terms) {
      if (extraction.includes(term)) {
        return false
      }
    }
    return true
  }

  static renameKey(object, oldKey, newKey) {
    Object.defineProperty(object, newKey, Object.getOwnPropertyDescriptor(object, oldKey))
    delete object[oldKey]
  }
}

module.exports = Interpolation
