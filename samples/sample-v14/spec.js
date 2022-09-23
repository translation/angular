const fs = require('fs')
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
  const apiKey = JSON.parse(fs.readFileSync('./tio.config.json'))['api_key']
  console.log(`Current project API key (for Node Matrix): ${apiKey}`)

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
            "src/app/app.component.html:2,4"
          ]
        },
        {
          "source_id": "4fa0213893cbb41a0ecf4135e92376d1d844e9248ee60ec3e0c6847bfcab498b",
          "target_language": "fr",
          "type": "source",
          "source": "I don't output any element",
          "target": "Je n'affiche aucun élément",
          "references": [
            "src/app/app.component.html:6"
          ]
        },
        {
          "source_id": "d9992d205a9754f933861d0e873395c4f83196e2eebd754b584df64f8e8560c4",
          "target_language": "fr",
          "type": "source",
          "source": "Angular logo",
          "target": "Logo d'Angular",
          "references": [
            "src/app/app.component.html:10"
          ]
        },
        {
          "source_id": "e6e8d69c841511742b0b72258d4798d6620cc40acf9d87e7e95f6ead31bbd7fd",
          "target_language": "fr",
          "type": "source",
          "source": "Updated {icu}",
          "target": "Updated {icu}",
          "references": [
            "src/app/app.component.html:13"
          ]
        },
        {
          "source_id": "5960fc2f039532c1e6af2d0cdc04418ec47a3aa13ee0dadcc033b92a3acf178e",
          "target_language": "fr",
          "type": "source",
          "source": "{VAR_PLURAL, plural, =0 {just now} =1 {one minute ago} other {{x} minutes ago}}",
          "target": "{VAR_PLURAL, plural, =0 {à l'instant} =1 {il y a une minute} one {il y a {x} minute} other {Il y a {x} minutes} }",
          "references": [
            "src/app/app.component.html:13",
            "src/app/app.component.html:19,22"
          ]
        },
        {
          "source_id": "bd21b5ff24450d8817fa1ba90470e03a27e8f9d77d326b140c6f6578b3ecd0ab",
          "target_language": "fr",
          "type": "source",
          "source": "The author is {icu}",
          "target": "L'auteur est {icu}",
          "references": [
            "src/app/app.component.html:17"
          ]
        },
        {
          "source_id": "7317419284dc3f0b7f94c1c3a4475dd0c2fd0a4e8a176f687a4127944c3a8659",
          "target_language": "fr",
          "type": "source",
          "source": "{VAR_SELECT, select, male {male} female {female} other {other}}",
          "target": "{VAR_SELECT, select, male {un homme} female {une femme} other {autre}}",
          "references": [
            "src/app/app.component.html:17",
            "src/app/app.component.html:22"
          ]
        },
        {
          "source_id": "01061dad4787e37f005e46c773af5ad34cd5a7e80f877474a990ab9b34b599b1",
          "target_language": "fr",
          "type": "source",
          "source": "Updated: {icu1} by {icu2}",
          "target": "Mis à jour : {icu1} par {icu2}",
          "references": [
            "src/app/app.component.html:19,23"
          ]
        },
        {
          "source_id": "79e4c6c548888a90598a6d4986da62ade4c504f1c2b14fa71ed25115ee5389f8",
          "target_language": "fr",
          "type": "source",
          "source": "01. A simple <1>tag</1> interpolation.",
          "target": "01. Une simple interpolation de <1>balises</1>.",
          "references": [
            "src/app/app.component.html:26"
          ]
        },
        {
          "source_id": "5d4f1dc03b7f6374d6ba7126363db996b5cf0f8c51ce13b8ec0fb895a82ceae8",
          "target_language": "fr",
          "type": "source",
          "source": "02. A series of <1>non-nested</1> tag <2>interpolations</2>.",
          "target": "02. Une série <2>d'interpolations</2> de balises <1>non-imbriquées</1>.",
          "references": [
            "src/app/app.component.html:28"
          ]
        },
        {
          "source_id": "06fb8859c7a641b39673a35c387aac3a7ac324767e80ed975930bfa2749c729a",
          "target_language": "fr",
          "type": "source",
          "source": "03. A <1>series <2>of <3>nested</3> tag</2> interpolations</1>.",
          "target": "03. Une <1>série d'interpolations <2>de balises <3>imbriquées</3></2></1>.",
          "references": [
            "src/app/app.component.html:30"
          ]
        },
        {
          "source_id": "fe69bdff8ea4ae37206868832cb6fde6302a218c9bbde6ab5e341c0c62438ffb",
          "target_language": "fr",
          "type": "source",
          "source": "04. A series of <1>non-nested</1> tag interpolations <2>with attributes</2>.",
          "target": "04. Une série d'interpolations de balises <1>non-imbriquées</1> <2>avec des attributs</2>.",
          "references": [
            "src/app/app.component.html:32"
          ]
        },
        {
          "source_id": "57fb2a54ff2875e8428aea9a03caa155a534d04b07ad984c8f677609329ad7fa",
          "target_language": "fr",
          "type": "source",
          "source": "05. A series of <1>nested <2>tag</2> interpolations <3>with</3> attributes</1>.",
          "target": "05. Une série <1>d'interpolations de <2>balises</2> imbriquées <3>avec</3> des attributs</1>.",
          "references": [
            "src/app/app.component.html:34"
          ]
        },
        {
          "source_id": "75346f42f7d483d182fa31952f4662b42cfd981052111df0e6cd16e83a1db721",
          "target_language": "fr",
          "type": "source",
          "source": "06. An example of <1>link</1> with many attributes.",
          "target": "06. Un exemple de <1>lien</1> avec beaucoup d'attributs.",
          "references": [
            "src/app/app.component.html:36"
          ]
        },
        {
          "source_id": "e3865e0b91ef234590b83b59e4aa6d56fb1017ac427f331a87c5785b36843d14",
          "target_language": "fr",
          "type": "source",
          "source": "07. Opening a <1>tag and <2>opening it again</2> before closing it</1> and closing it again (strong tag).",
          "target": "07. Ouvrir une <1>balise et <2>l'ouvrir à nouveau</2> avant de la fermer</1> et de la fermer à nouveau (balise \"strong\").",
          "references": [
            "src/app/app.component.html:38"
          ]
        },
        {
          "source_id": "0b03062ac421c06a2fb6fc397870dfd1d9d28842d7defafa1a1af1025b979b22",
          "target_language": "fr",
          "type": "source",
          "source": "08. All <1/> sorts <2/> of <3/> line <4/> breaks <5/>.",
          "target": "08. Toutes <1/> sortes <2/> de <3/> retours <4/> à la ligne <5/>.",
          "references": [
            "src/app/app.component.html:40"
          ]
        },
        {
          "source_id": "9512b82b0c1d3f46c52e10a8fce04b3e240c8f0fd40bc5f7f6e3f0e4955cc32d",
          "target_language": "fr",
          "type": "source",
          "source": "09. <1>We have nested interpolations and <2>a line</2> break<3/> in-between</1>.",
          "target": "09. <1>Nous avons des interpolations imbriquées et <2>un retour</2> à la ligne<3/> au milieu</1>.",
          "references": [
            "src/app/app.component.html:42"
          ]
        },
        {
          "source_id": "d52fd292cc9934e57c7af5305e4ab89a9be08309d60eb955aae4b14e1c293e79",
          "target_language": "fr",
          "type": "source",
          "source": "10. A line break <1/> and all sorts <2/> of <3/> horizontal <4/> rules,<5/> even with attributes.",
          "target": "10. Un retour à la ligne <1/> et toutes sortes <2/> de <3/> lignes <4/> horizontales,<5/> même avec des attributs.",
          "references": [
            "src/app/app.component.html:44"
          ]
        },
        {
          "source_id": "9b25e2298c3ae41b3d3dc02096b339d55d3673ddfa8e9030a900128285dd1f0e",
          "target_language": "fr",
          "type": "source",
          "source": "11. Symbols: < < && >> <1>",
          "target": "11. Des symboles : < < && >> <1>",
          "references": [
            "src/app/app.component.html:46"
          ]
        }
      ]
    }

    assertEqual(JSON.stringify(response), JSON.stringify(expected))
  })
})
