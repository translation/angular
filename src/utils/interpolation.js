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
    let substitution, nextIndex

    if (extraction.includes('id="INTERPOLATION_') && !extraction.includes('equiv-text=')) {
      nextIndex = parseInt(extraction.split('id="INTERPOLATION_', 2)[1].split('"', 2)[0]) + 1
      substitution = `{x${nextIndex}}`
    } else if(extraction.includes('id="INTERPOLATION"') && !extraction.includes('equiv-text=')) {
      substitution = `{x1}`
    } else if (extraction.includes('id="INTERPOLATION') && extraction.includes('equiv-text=')) {
      const variableName = extraction.split('equiv-text="{{', 2)[1].split('}}"', 2)[0]
      substitution = `{${variableName.trim()}}`
    } else if (extraction.includes('id="ICU')) {
      nextIndex = (existingSubstitutions.join(" ").match(/{icu\d+?}/g) || []).length + 1
      substitution = `{icu${nextIndex}}`
    } else if (TagInterpolation.isSelfClosingTag(extraction)) {
      nextIndex = TagInterpolation.addToStackAndGetNextIndex(extraction)
      substitution = `&lt;${nextIndex}/&gt;`
    } else if (TagInterpolation.isClosingTag(extraction)) {
      nextIndex = TagInterpolation.removeFromStackAndGetNextIndex(extraction)
      substitution = `&lt;/${nextIndex}&gt;`
    } else if (TagInterpolation.isOpeningTag(extraction)) {
      nextIndex = TagInterpolation.addToStackAndGetNextIndex(extraction)
      substitution = `&lt;${nextIndex}&gt;`
    } else {
      console.error(`No substitution found for this extraction: ${extraction}`)
    }

    return substitution
  }

  static renameKey(object, oldKey, newKey) {
    Object.defineProperty(object, newKey, Object.getOwnPropertyDescriptor(object, oldKey))
    delete object[oldKey]
  }
}

module.exports = Interpolation
