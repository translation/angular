const { segmentsIndex, segmentDelete, purgeProject } = require('../tio-utils')

// Custom test methods

function it(desc, fn) {
  try {
    fn()
    console.log(desc);
  } catch (error) {
    console.log('\n');
    console.log(desc);
    console.error(error);

    process.exitCode = 1
  }
}

function assertEqual(result, expected) {
  if (result === expected) {
    console.log(".")
  } else {
    console.log("F")

    console.log("Expected: \n\n")
    console.log(expected)
    console.log("\n\n")
    console.log("Got: \n\n")
    console.log(result)
    console.log("------")

    process.exitCode = 1
  }
}

// Tests

it('After init, segments on Translation.io should exist and be translated', () => {
  const apiKey = "TRANSLATIONANGULARTESTINGNODE18X"

  segmentsIndex(apiKey, "fr", (jsonResponse) => {
    // Remove ids from response
    let response = JSON.parse(jsonResponse)
    response['segments'].forEach(segment => delete segment['id'])

    const expected = {
      "segments": [
        {
          "source_id": "d66ffd50cc1572c37c0e8517b16595b0d8101fec513e0c0e95f5f0d850f3d0c7",
          "target_language": "fr",
          "type": "source",
          "source": "Hello i18n!",
          "target": "Bonjour i18n !",
          "context": "introductionHeader | User welcome",
          "comment": "An introduction header for this sample",
          "references": [
            "src/app/app.component.html:1,3"
          ]
        },
        {
          "source_id": "4fa0213893cbb41a0ecf4135e92376d1d844e9248ee60ec3e0c6847bfcab498b",
          "target_language": "fr",
          "type": "source",
          "source": "I don't output any element",
          "target": "Je n'affiche aucun élément",
          "references": [
            "src/app/app.component.html:5"
          ]
        },
        {
          "source_id": "d9992d205a9754f933861d0e873395c4f83196e2eebd754b584df64f8e8560c4",
          "target_language": "fr",
          "type": "source",
          "source": "Angular logo",
          "target": "Logo d'Angular",
          "references": [
            "src/app/app.component.html:9"
          ]
        },
        {
          "source_id": "e6e8d69c841511742b0b72258d4798d6620cc40acf9d87e7e95f6ead31bbd7fd",
          "target_language": "fr",
          "type": "source",
          "source": "Updated {icu}",
          "target": "Mis à jour {icu}",
          "references": [
            "src/app/app.component.html:12"
          ]
        },
        {
          "source_id": "5960fc2f039532c1e6af2d0cdc04418ec47a3aa13ee0dadcc033b92a3acf178e",
          "target_language": "fr",
          "type": "source",
          "source": "{VAR_PLURAL, plural, =0 {just now} =1 {one minute ago} other {{x} minutes ago}}",
          "target": "{ VAR_PLURAL, plural, =0 {À l''instant} =1 {Il y a une minute} one {Il y a une minute} other {Il y a {x} minutes} }",
          "references": [
            "src/app/app.component.html:12",
            "src/app/app.component.html:18,21"
          ]
        },
        {
          "source_id": "bd21b5ff24450d8817fa1ba90470e03a27e8f9d77d326b140c6f6578b3ecd0ab",
          "target_language": "fr",
          "type": "source",
          "source": "The author is {icu}",
          "target": "L'auteur est {icu}",
          "references": [
            "src/app/app.component.html:16"
          ]
        },
        {
          "source_id": "7317419284dc3f0b7f94c1c3a4475dd0c2fd0a4e8a176f687a4127944c3a8659",
          "target_language": "fr",
          "type": "source",
          "source": "{VAR_SELECT, select, male {male} female {female} other {other}}",
          "target": "{VAR_SELECT, select, male {masculin} female {féminin} other {autre}}",
          "references": [
            "src/app/app.component.html:16",
            "src/app/app.component.html:21"
          ]
        },
        {
          "source_id": "01061dad4787e37f005e46c773af5ad34cd5a7e80f877474a990ab9b34b599b1",
          "target_language": "fr",
          "type": "source",
          "source": "Updated: {icu1} by {icu2}",
          "target": "Mis à jour: {icu1} par {icu2}",
          "references": [
            "src/app/app.component.html:18,22"
          ]
        }
      ]
    }

    assertEqual(JSON.stringify(response), JSON.stringify(expected))
  })
})
