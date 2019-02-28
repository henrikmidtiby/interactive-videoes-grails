import { PolymerElement, html } from '@polymer/polymer/polymer-element.js';
import '@polymer/iron-flex-layout/iron-flex-layout-classes.js';
import '@polymer/marked-element/marked-element.js';
import '@polymer/paper-button/paper-button.js';
import '@polymer/iron-collapse/iron-collapse.js';
import './tve-renderer.js';

class TVEExplanation extends PolymerElement {
  static get template() {
    return html`
<style include="iron-flex"></style>

<style>
:host {
    display: block;
}
</style>

<paper-button id="button" on-click="showExplanation" noink="">Vis hint</paper-button>

<iron-collapse id="collapse" no-animation="">
    <h3>Hint</h3>
    <tve-renderer content="{{content}}"></tve-renderer>
</iron-collapse>
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

  showExplanation() {
      this.$.collapse.show();
      this.$.button.hidden = true;

      var event = new CustomEvent('action', {type: "hint-showed", bubbles: true, composed: true});
      this.dispatchEvent(event);
  }
}

customElements.define('tve-explanation', TVEExplanation);
