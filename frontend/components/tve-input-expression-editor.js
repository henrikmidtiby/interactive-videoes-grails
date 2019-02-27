import '@polymer/polymer/polymer-legacy.js';
import '@polymer/iron-flex-layout/iron-flex-layout-classes.js';
import '@polymer/paper-input/paper-textarea.js';
import '@polymer/paper-input/paper-textarea.js';
import '@polymer/paper-button/paper-button.js';
import './tekvideo-math-field.js';
Polymer({
  _template: Polymer.html`
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
`,

  is: 'tve-input-expression-editor',

  properties: {
      content: {
          type: String,
          value: "",
          notify: true
      }
  },

  _saveExpression: function() {
      this.content = this.$.expressionField.value;
  }
});
