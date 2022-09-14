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
    const regexp        = /{\w+?}/g
    const substitutions = escapedText.match(regexp) || []
    let   text          = `${escapedText}`;

    substitutions.filter(this.uniq).forEach((substitution) => {
      const extraction = interpolations[substitution]

      text = text.replace(new RegExp(substitution, 'g'), extraction)
    })

    return text
  }

  // Substitutes the interpolation with an appropriate variable (specific or index-generated)
  // depending on already existing substitutions
  static substitution(extraction, existingSubstitutions) {
    let substitution

    if (extraction.includes('id="INTERPOLATION') && extraction.includes('equiv-text=')) {
      const variableName = extraction.split('equiv-text="{{', 2)[1].split('}}"', 2)[0]
      substitution = `{${variableName.trim()}}`
    } else if (extraction.includes('id="ICU')) {
      const nextIndex = (existingSubstitutions.join(" ").match(/{icu\d+?}/g) || []).length + 1
      substitution = `{icu${nextIndex}}`
    } else {
      const nextIndex = (existingSubstitutions.join(" ").match(/{x\d+?}/g) || []).length + 1
      substitution = `{x${nextIndex}}`
    }

    return substitution
  }

  static renameKey(object, oldKey, newKey) {
    Object.defineProperty(object, newKey, Object.getOwnPropertyDescriptor(object, oldKey))
    delete object[oldKey]
  }

  static uniq(value, index, self) {
    return self.indexOf(value) === index
  }
}

module.exports = Interpolation
