class Interpolation {
  // Convert
  // 'Hello <x id="INTERPOLATION"/> and <x id="INTERPOLATION"/>'
  // to
  //'Hello <x0> and <x1>'
  //----
  // Convert
  // 'Hello <x id="INTERPOLATION" equiv-text="{{ name }}"/> and <x id="INTERPOLATION" equiv-text="{{ otherName }}"/>'
  // to
  //'Hello <x0> and <x1>'
  static escape(text) {
    const regexp         = /<x[\s\S]*?\/>/g // Use [\s\S] instead of . for multiline matching => https://stackoverflow.com/a/16119722/1243212
    const interpolations = text.match(regexp) || []
    let   escapedText    = `${text}`

    interpolations.forEach((interpolation, index) =>
      escapedText = escapedText.replace(interpolation, `{x${index}}`)
    )

    return {
      text:           escapedText,
      interpolations: interpolations
    }
  }

  // Convert
  //'Hello <x0> and <x1>' and ['<x id="INTERPOLATION"/>', '<x id="INTERPOLATION"/>']
  // to
  // 'Hello <x id="INTERPOLATION"/> and <x id="INTERPOLATION"/>'
  //----
  // Convert
  //'Hello <x1> and <x0>' and ['<x id="INTERPOLATION" equiv-text="{{ name }}"/>', '<x id="INTERPOLATION" equiv-text="{{ otherName }}"/>']
  // to
  // 'Hello <x id="INTERPOLATION" equiv-text="{{ otherName }}"/> and <x id="INTERPOLATION" equiv-text="{{ name }}"/>
  static unescape(escapedText, interpolations) {
    const regexp               = /{x\d+?}/g
    const simpleInterpolations = escapedText.match(regexp) || []

    let text = `${escapedText}`

    simpleInterpolations.forEach((simpleInterpolation) => {
      const index = parseInt(simpleInterpolation.replace('{x', '').replace('}', ''))
      text = text.replace(simpleInterpolation, (interpolations[index] || ''))
    })

    return text
  }
}

module.exports = Interpolation







// const result = Interpolation.escape('Hello <x id="INTERPOLATION" equiv-text="{{ name }}"/> and <x id="INTERPOLATION" equiv-text="{{ otherName }}"/>')

// {
//   text: 'Hello <x0> and <x1>',
//   interpolations: [
//     '<x id="INTERPOLATION" equiv-text="{{ name }}"/>',
//     '<x id="INTERPOLATION" equiv-text="{{ otherName }}"/>'
//   ]
// }

// Interpolation.unescape('Hello {{x0}} and {{x1}}', [
//   '<x id="INTERPOLATION" equiv-text="{{ name }}"/>',
//   '<x id="INTERPOLATION" equiv-text="{{ otherName }}"/>'
// ])

// Interpolation.unescape('Hello {{x1}} and {{x0}}', [
//   '<x id="INTERPOLATION" equiv-text="{{ name }}"/>',
//   '<x id="INTERPOLATION" equiv-text="{{ otherName }}"/>'
// ])

