import { PolymerElement, html } from '@polymer/polymer/polymer-element.js';

import '@polymer/iron-flex-layout/iron-flex-layout-classes.js';

class TVEInlineEquation extends PolymerElement {
  static get template() {
    return html`
<style include="iron-flex"></style>

<style>
:host {
    display: inline;
}
</style>

<math-tex display="inline" content="{{content}}"></math-tex>
`;
  }
  static get properties() {
   return {
      content: {
        type: String,
        value: ""
      }
    }
  }
}

customElements.define('tve-inline-equation', TVEInlineEquation);
/*<link rel="import" href="mathjax-include.html">*/
/*
  FIXME(polymer-modulizer): the above comments were extracted
  from HTML and may be out of place here. Review them and
  then delete this comment!
*/
