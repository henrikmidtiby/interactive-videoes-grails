var TekVideo = TekVideo || {};
TekVideo.Templates = {};

function registerTemplate(name, description, object) {
    TekVideo.Templates[name] = {
        name: name,
        description: description,
        object: object
    };
}

registerTemplate("Eksempel 1", "En eksempel opgave om ligningssystemer på matrixform", {
  "name": "Eksempel 1",
  "document": "# Ligningssystem på matrixform\n\nGivet de tre ligninger: [[eql x + y = 2]], [[eql z + x = 2]] og [[eql x + y + z = 3]].\n\nAngiv [[eql A]] og [[eql \\vec{b}]] når ligningssystemet skrives på formen [[eql A = \\begin{pmatrix} x \\\\\\\\ y \\\\\\\\ z\\end{pmatrix} = \\vec{b} ]]\n\n[[eql A =]] [[ref a-matrix-input]]\n\n[[eql \\vec{b} =]] [[ref b-matrix-input]]\n\n[[ref hint-1]]\n\n[[ref hint-2]]",
  "widgets": {
    "b-matrix-input": {
      "type": "matrix",
      "properties": {
        "height": "5",
        "width": "1",
        "answer": [
          [
            "2"
          ],
          [
            "2"
          ],
          [
            "3"
          ]
        ]
      },
      "name": "b-matrix-input"
    },
    "a-matrix-input": {
      "type": "matrix",
      "properties": {
        "answer": [
          [
            "1",
            "1",
            "0"
          ],
          [
            "1",
            "0",
            "1"
          ],
          [
            "1",
            "1",
            "1"
          ]
        ]
      },
      "name": "a-matrix-input"
    },
    "hint-1": {
      "type": "hint",
      "properties": {
        "content": "Skriv ligningerne op så de ubekendte står i følgende rækkefølge [[eql x]], [[eql y]], og [[eql z]]. Desuden skal der være en koefficient til alle led.\n\n[[eq 1 \\cdot x + 1 \\cdot y + 0 \\cdot z = 2]]\n[[eq 1 \\cdot x + 0 \\cdot y + 1 \\cdot z = 2]]\n[[eq 1 \\cdot x + 1 \\cdot y + 0 \\cdot z = 3]]"
      },
      "name": "hint-1"
    },
    "hint-2": {
      "type": "hint",
      "properties": {
        "content": "Saml koefficienterne i [[eql A]].\n\n[[eq A = \\begin{pmatrix}\n1 & 1 & 0 \\\\\\\\\n1 & 0 & 1 \\\\\\\\\n1 & 1 & 1\n\\end{pmatrix}]]\n\nog konstanterne i [[eql \\vec{b}]]:\n\n[[eq \\vec{b} = \\begin{pmatrix}\n2 \\\\\\\\ 2 \\\\\\\\ 3\n\\end{pmatrix}]]"
      },
      "name": "hint-2"
    }
  }
});

registerTemplate("Eksempel 2", "En eksempel opgave om typer af differentialligninger", {
  "name": "Eksempel 2",
  "document": "# Typer af differentialligninger\n\nDifferentialligningen [[eql \\frac{dy}{dx} = \\frac{y}{x^2}]] er:\n\n[[ref multiple-choice]]\n\n[[ref hint-1]]\n\n[[ref hint-2]]\n\n[[ref hint-3]]",
  "widgets": {
    "multiple-choice": {
      "type": "multiple-choice",
      "properties": {
        "choices": [
          {
            "title": "separabel",
            "correct": false
          },
          {
            "title": "første ordens linær",
            "correct": false
          },
          {
            "title": "både separabel og første ordens linær ",
            "correct": true
          },
          {
            "title": "hverken separabel eller første ordens linær ",
            "correct": false
          }
        ]
      },
      "name": "multiple-choice"
    },
    "hint-1": {
      "type": "hint",
      "properties": {
        "content": "Ligningen kan skrives på formen:\n\n[[eq \\frac{dy}{dx} = \\frac{1}{x^2} \\cdot y]]"
      },
      "name": "hint-1"
    },
    "hint-2": {
      "type": "hint",
      "properties": {
        "content": "Ligningen kan skrives på formen:\n\n[[eq \\frac{dy}{dx} + \\frac{-1}{x^2} \\cdot y = 0]]"
      },
      "name": "hint-2"
    },
    "hint-3": {
      "type": "hint",
      "properties": {
        "content": "Hint 1 viser at ligningen er separabel\n\nHint 2 viser at ligningen er en første ordens linær "
      },
      "name": "hint-3"
    }
  }
});

registerTemplate("Eksempel 3", "En eksempel opgave om ligningssystemer", {
  "name": "Eksempel 3",
  "document": "# Ligningssystemer\n\nGivet ligningerne [[eql 2x + y = 3]] og [[eql x - y = 0]] bestem [[eql x]] og [[eql y]].\n\n[[eql x =]] [[ref input-1]]\n\n[[eql y =]] [[ref input-2]]\n\n[[ref hint-1]]\n\n[[ref hint-2]]",
  "widgets": {
    "input-1": {
      "type": "equation-input",
      "properties": {
        "content": "1"
      },
      "name": "input-1"
    },
    "input-2": {
      "type": "equation-input",
      "properties": {
        "content": "1"
      },
      "name": "input-2"
    },
    "hint-1": {
      "type": "hint",
      "properties": {
        "content": "Læg de to ligninger sammen, det giver [[eql 3x = 3]]. Derefter kan [[eql x]] findes og vi har [[eql x = 1]]"
      },
      "name": "hint-1"
    },
    "hint-2": {
      "type": "hint",
      "properties": {
        "content": "Indsæt [[eql x = 1]] i den første ligninge. Det giver [[eql 2 \\cdot 1 + y = 3]], der forenkles til [[eql y = 1]]."
      },
      "name": "hint-2"
    }
  }
});
