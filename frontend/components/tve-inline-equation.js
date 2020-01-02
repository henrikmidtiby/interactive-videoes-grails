import { PolymerElement, html } from '@polymer/polymer/polymer-element.js';

// import '@polymer/iron-flex-layout/iron-flex-layout-classes.js';

class TVEInlineEquation extends PolymerElement {
  static get template() {
    return html`

<link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/katex@0.11.1/dist/katex.min.css" integrity="sha384-zB1R0rpPzHqg7Kpt0Aljp8JPLqbXI3bhnPWROx27a9N0Ll6ZP/+DiW/UqRcLbRjq" crossorigin="anonymous">

<span id="mathcontent"></span>
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
