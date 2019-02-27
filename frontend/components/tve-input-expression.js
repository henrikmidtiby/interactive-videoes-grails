import '@polymer/polymer/polymer-legacy.js';
import '@polymer/iron-flex-layout/iron-flex-layout-classes.js';
import '@polymer/marked-element/marked-element.js';
import '@polymer/iron-icon/iron-icon.js';
import '@polymer/iron-icons/iron-icons.js';
import './tekvideo-math-field.js';
import './kas-import.js';
import './tve-status-indicator.js';
Polymer({
  _template: Polymer.html`
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
`,

  is: 'tve-input-expression',

  properties: {
      content: {
          type: String,
          value: ""
      },
      status: {
          type: String,
          value: ""
      }
  },

  grade: function() {
      var expectedValue = KAS.parse(this.content);
      var givenAnswer = KAS.parse(this.$.mathInput.value);
      var result = KAS.compare(expectedValue.expr, givenAnswer.expr);
      return {
          correct: result.equal,
          answer: this.$.mathInput.value
      };
  },

  validate: function() {
      return this.$.mathInput.value.length > 0;
  }
});
