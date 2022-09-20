class Interpolation {
  static extract(text) {
    const regexp         = /<x[\s\S]*?\/>/g // Use [\s\S] instead of . for multiline matching => https://stackoverflow.com/a/16119722/1243212
    const extractions    = text.match(regexp) || []
    let   escapedText    = `${text}`
    let   interpolations = {}

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

  static recompose(escapedText, interpolations) {
    const substitutions = Object.keys(interpolations)
    let   text          = `${escapedText}`;

    substitutions.forEach((substitution) => {
      const extraction = interpolations[substitution]

      text = text.replace(new RegExp(substitution, 'g'), extraction)
    })

    return text
  }

  // Substitutes the interpolation with an appropriate variable (specific or index-generated)
  // depending on already existing substitutions
  static substitution(extraction, existingSubstitutions) {
    let substitution

    const joinedSubstitutions = existingSubstitutions.join(" ")

    if (extraction.includes('id="INTERPOLATION') && extraction.includes('equiv-text=')) {
      const variableName = extraction.split('equiv-text="{{', 2)[1].split('}}"', 2)[0]
      substitution = `{${variableName.trim()}}`
    } else if (extraction.includes('id="ICU')) {
      const nextIndex = (joinedSubstitutions.match(/{icu\d+?}/g) || []).length + 1
      substitution = `{icu${nextIndex}}`
    } else if (this.isSelfClosingTag(extraction)) {
      const nextIndex = this.countSelfClosingTags(joinedSubstitutions) + this.countClosingTags(joinedSubstitutions) + 1
      substitution = `<${nextIndex}/>`
    } else if (this.isClosingTag(extraction)) {
      const nextIndex = this.countSelfClosingTags(joinedSubstitutions) + this.countClosingTags(joinedSubstitutions) + 1
      substitution = `</${nextIndex}>`
    } else if (this.isOpeningTag(extraction)) {
      const nextIndex = this.countSelfClosingTags(joinedSubstitutions) + this.countOpeningTags(joinedSubstitutions) + 1
      substitution = `<${nextIndex}>`
    } else {
      const nextIndex = (joinedSubstitutions.match(/{x\d+?}/g) || []).length + 1
      substitution = `{x${nextIndex}}`
    }

    return substitution
  }

  static isSelfClosingTag(extraction) {
    return extraction.includes('equiv-text="&lt;') && extraction.includes('/&gt;"')
  }

  static isClosingTag(extraction) {
    return extraction.includes('equiv-text="&lt;/') && extraction.includes('&gt;"')
  }

  static isOpeningTag(extraction) {
    return extraction.includes('equiv-text="&lt;') && extraction.includes('&gt;"')
  }

  static countSelfClosingTags(joinedSubstitutions) {
    return (joinedSubstitutions.match(/<\d+?\/>/g) || []).length
  }

  static countClosingTags(joinedSubstitutions) {
    return (joinedSubstitutions.match(/<\/\d+?>/g) || []).length
  }

  static countOpeningTags(joinedSubstitutions) {
    return (joinedSubstitutions.match(/<\d+?>/g) || []).length
  }

  static renameKey(object, oldKey, newKey) {
    Object.defineProperty(object, newKey, Object.getOwnPropertyDescriptor(object, oldKey))
    delete object[oldKey]
  }
}

module.exports = Interpolation
