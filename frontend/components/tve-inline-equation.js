import { PolymerElement, html } from '@polymer/polymer/polymer-element.js';

// import '@polymer/iron-flex-layout/iron-flex-layout-classes.js';

class TVEInlineEquation extends PolymerElement {
  static get template() {
    return html`
<math-tex display="inline"><slot>0</slot></math-tex>
`;
  }
}

customElements.define('tve-inline-equation', TVEInlineEquation);
