import { PolymerElement, html } from '@polymer/polymer/polymer-element.js';

// import '@polymer/iron-flex-layout/iron-flex-layout-classes.js';

class TVEInlineEquation extends PolymerElement {
  static get template() {
    return html`

<link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/katex@0.10.1/dist/katex.css" integrity="sha384-b/NoaeRXkMxyKcrDw2KtVtYKkVg3dA0rTRgLoV7W2df3MzeR1eHLTi+l4//4fMwk" crossorigin="anonymous">

<div id="mathcontent"></div>
`;
  }
  static get properties() {
    return {
      content: {
        type: String, 
        value: "", 
      }
    }
  }
  ready() {
    super.ready();
    this.insert_math_content();
  }
  insert_math_content() {
    var element = this.$.mathcontent;
    katex.render(this.content, element, {displayMode: false, throwOnError: false});
  }
}

customElements.define('tve-inline-equation', TVEInlineEquation);
