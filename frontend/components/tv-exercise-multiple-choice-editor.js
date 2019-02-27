import '@polymer/polymer/polymer-legacy.js';
import '@polymer/iron-flex-layout/iron-flex-layout-classes.js';
import '@polymer/paper-input/paper-input.js';
import '@polymer/paper-button/paper-button.js';
import '@polymer/paper-checkbox/paper-checkbox.js';
import '@polymer/iron-icons/iron-icons.js';
import '@polymer/paper-icon-button/paper-icon-button.js';
import '@polymer/paper-tooltip/paper-tooltip.js';
Polymer({
  _template: Polymer.html`
<style include="iron-flex"></style>

<style>
:host {
    display: block;
}
</style>

<template is="dom-repeat" items="{{choices}}">
    <paper-input value="{{item.title}}" on-keydown="_notify" tabindex\$="{{index}}">
        <paper-checkbox checked="{{item.correct}}" on-click="_notify" prefix="">
            <paper-tooltip>Korrekt?</paper-tooltip>
        </paper-checkbox>
        <paper-icon-button data-index\$="{{index}}" icon="delete" on-click="delete" suffix="">
        </paper-icon-button>
    </paper-input>
    
</template>

<div class="layout horizontal">
    <paper-button on-click="_addItem" class="flex">Nyt element</paper-button>
</div>
<div class="layout vertical">
<paper-checkbox checked="{{randomizeorder}}">Randomiser rækkefølge</paper-checkbox>
<paper-checkbox checked="{{selectmultiple}}">Vælg alle</paper-checkbox>
</div>
`,

  is: 'tv-exercise-multiple-choice-editor',

  properties: {
      selectmultiple: {
        	type: Boolean,
        	value: false,
        	notify: true
      },
      randomizeorder: {
          type: Boolean,
          value: false,
          notify: true
      },
      choices: {
          type: Array,
          value: [{ title: window.itemToAddValue, correct: false }],
          notify: true
      }
  },

  _notify: function(e) {
      if (e.keyCode === 13) {
          this._addItem();
      } else {
          var copy = this.choices.slice();
          console.log(this.choices);
          this.choices = copy;
      }
  },

  _addItem: function() {
      var copy = this.choices.slice();
      copy.push({ title: this.itemToAddValue, correct: false });
      console.log(copy);
      this.choices = copy;
      this.itemToAddValue = "";

      var self = this;
      setTimeout(function() {
          // Nice hack.
          var inputs = Polymer.dom(self.root).querySelectorAll('paper-input');
          if (inputs && inputs.length > 0) {
              inputs[inputs.length - 1].$.input.focus();
          }
      }, 100);
  },

  delete: function(e) {
      var index = e.target.getAttribute("data-index");
      this.choices.splice(index, 1);
      this.choices = this.choices.slice();
  }
});
