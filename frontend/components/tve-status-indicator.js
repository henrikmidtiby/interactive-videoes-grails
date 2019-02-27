import '@polymer/polymer/polymer-legacy.js';
import '@polymer/iron-flex-layout/iron-flex-layout-classes.js';
import '@polymer/marked-element/marked-element.js';
import '@polymer/iron-icon/iron-icon.js';
import '@polymer/iron-icons/iron-icons.js';
import '@polymer/paper-styles/color.js';
import '@polymer/paper-tooltip/paper-tooltip.js';
Polymer({
  _template: Polymer.html`
<style include="iron-flex"></style>

<style>
:host {
    display: inline;
}

.correct {
    color: var(--paper-green-500);
}

.incorrect {
    color: var(--paper-red-500);
}

.warning {
    color: var(--paper-amber-500);
    
}
</style>

<span hidden\$="{{!_showCorrect(status)}}">
    <iron-icon class="correct" id="correct" icon="check-circle"></iron-icon>
    <paper-tooltip for="correct">Korrekt</paper-tooltip>
</span>
<span hidden\$="{{!_showIncorrect(status)}}">
    <iron-icon class="incorrect" id="incorrect" icon="remove-circle"></iron-icon>
    <paper-tooltip for="incorrect">Svaret er forkert</paper-tooltip>
</span>
<span hidden\$="{{!_showWarning(status)}}">
    <iron-icon class="warning" id="warning" icon="warning"></iron-icon>
    <paper-tooltip for="warning">Dette felt mangler information</paper-tooltip>
</span>
`,

  is: 'tve-status-indicator',

  properties: {
      status: {
          type: String,
          value: ""
      }
  },

  _showCorrect: function(status) {
      return status === "correct";
  },

  _showIncorrect: function(status) {
      return status === "incorrect";
  },

  _showWarning: function(status) {
      return status === "warning";
  }
});
