import { PolymerElement, html } from '@polymer/polymer/polymer-element.js';
import {KatexInline} from 'katex-elements/katex-inline.js';

// import '@polymer/iron-flex-layout/iron-flex-layout-classes.js';

class TVEInlineEquation extends PolymerElement {
  static get template() {
    return html`
<katex-inline>{{content}}</katex-inline>
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
  }
}

customElements.define('tve-inline-equation', TVEInlineEquation);
