import { PolymerElement, html } from '@polymer/polymer/polymer-element.js';
import '@polymer/iron-flex-layout/iron-flex-layout-classes.js';
import '@polymer/paper-input/paper-textarea.js';
import '@polymer/paper-input/paper-textarea.js';
import '@polymer/paper-button/paper-button.js';
import './tekvideo-math-field.js';

class TVEInputExpressionEditor extends PolymerElement {
  static get template() {
    return html`
<style include="iron-flex"></style>

<style>
:host {
    display: block;
}
</style>

<div class="layout vertical">
    <div><b>Svar:</b></div>
    <paper-input value="{{content}}" hidden=""></paper-input>
    <div><tekvideo-math-field id="expressionField"></tekvideo-math-field></div>
    <paper-button on-click="_saveExpression">Gem udtryk</paper-button>
</div>
`;
  }

  static get properties() {
    return {
      content: {
          type: String,
          value: "",
          notify: true
      }
    };
  }

  _saveExpression() {
      this.content = this.$.expressionField.value;
  }
}

customElements.define('tve-input-expression-editor', TVEInputExpressionEditor);

