const TagInterpolation = require('./tag-interpolation')

class Interpolation {
  static extract(text) {
    const regexp         = /<x[\s\S]*?\/>/g // Use [\s\S] instead of . for multiline matching => https://stackoverflow.com/a/16119722/1243212
    const extractions    = text.match(regexp) || []
    let   escapedText    = `${text}`
    let   interpolations = {}

    TagInterpolation.resetStack()

    extractions.forEach((extraction) => {
      const substitution = this.substitution(extraction, Object.keys(interpolations))

      escapedText = escapedText.replace(extraction, substitution) // Replace in string
      interpolations[substitution] = extraction                   // Save the substitution for "recompose"
    })

    // Don't number substitutions if only one the kind!
    if (escapedText.includes('{x1}') && !escapedText.includes('{x2}')) {
      escapedText = escapedText.replace('{x1}', '{x}')
      this.renameKey(interpolations, '{x1}', '{x}')
    }

    if (escapedText.includes('{icu1}') && !escapedText.includes('{icu2}')) {
      escapedText = escapedText.replace('{icu1}', '{icu}')
      this.renameKey(interpolations, '{icu1}', '{icu}')
    }

    return {
      text:           escapedText,
      interpolations: interpolations
    }
  }

  static unescapeInterpolationTags(text) {
    return text.replace(/&lt;([\/]?\d{1,}[\/]?)&gt;/g, "<$1>")
  }

  static recompose(escapedText, interpolations) {
    const substitutions = Object.keys(interpolations)
    let   text          = this.unescapeInterpolationTags(`${escapedText}`)

    substitutions.forEach((substitution) => {
      const extraction = interpolations[substitution]

      text = text.replace(new RegExp(substitution, 'g'), extraction)
    })

    return text
  }

  // Substitutes the interpolation with an appropriate variable (specific or index-generated)
  // depending on already existing substitutions
  static substitution(extraction, existingSubstitutions) {
    let substitution, nextIndex

    const joinedSubstitutions = existingSubstitutions.join(" ")

    if (extraction.includes('id="INTERPOLATION') && extraction.includes('equiv-text=')) {
      const variableName = extraction.split('equiv-text="{{', 2)[1].split('}}"', 2)[0]
      substitution = `{${variableName.trim()}}`
    } else if (extraction.includes('id="ICU')) {
      nextIndex = (joinedSubstitutions.match(/{icu\d+?}/g) || []).length + 1
      substitution = `{icu${nextIndex}}`
    } else if (TagInterpolation.isSelfClosingTag(extraction)) {
      nextIndex = TagInterpolation.addToStackAndGetNextIndex(extraction)
      substitution = `<${nextIndex}/>`
    } else if (TagInterpolation.isClosingTag(extraction)) {
      nextIndex = TagInterpolation.removeFromStackAndGetNextIndex(extraction)
      substitution = `</${nextIndex}>`
    } else if (TagInterpolation.isOpeningTag(extraction)) {
      nextIndex = TagInterpolation.addToStackAndGetNextIndex(extraction)
      substitution = `<${nextIndex}>`
    } else {
      const nextIndex = (joinedSubstitutions.match(/{x\d+?}/g) || []).length + 1
      substitution = `{x${nextIndex}}`
    }

    return substitution
  }

  static renameKey(object, oldKey, newKey) {
    Object.defineProperty(object, newKey, Object.getOwnPropertyDescriptor(object, oldKey))
    delete object[oldKey]
  }
}

module.exports = Interpolation
