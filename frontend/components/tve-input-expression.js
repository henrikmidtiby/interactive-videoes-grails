import { PolymerElement, html } from '@polymer/polymer/polymer-element.js';
import '@polymer/iron-flex-layout/iron-flex-layout-classes.js';
import '@polymer/marked-element/marked-element.js';
import '@polymer/iron-icon/iron-icon.js';
import '@polymer/iron-icons/iron-icons.js';
import './tekvideo-math-field.js';
import './kas-import.js';
import './tve-status-indicator.js';

class TVInputExpression extends PolymerElement {
  static get template() {
    return html`
<style include="iron-flex"></style>

<style>
:host {
    display: inline;
}

tekvideo-math-field {
    --tekvideo-math-field-min-width: 100px;
}
</style>

<tekvideo-math-field id="mathInput"></tekvideo-math-field> 
<tve-status-indicator status="[[status]]"></tve-status-indicator>
`;
  }

  static get properties() {
    return {
      content: {
          type: String,
          value: ""
      },
      status: {
          type: String,
          value: ""
      }
    }
  }

  grade() {
      var expectedValue = KAS.parse(this.content);
      var givenAnswer = KAS.parse(this.$.mathInput.value);
      var result = KAS.compare(expectedValue.expr, givenAnswer.expr);
      return {
          correct: result.equal,
          answer: this.$.mathInput.value
      };
  }

  validate() {
      return this.$.mathInput.value.length > 0;
  }
}
  
customElements.define('tve-input-expression', TVInputExpression);
