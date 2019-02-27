import '@polymer/polymer/polymer-legacy.js';
import '@polymer/iron-flex-layout/iron-flex-layout-classes.js';
import '@polymer/paper-checkbox/paper-checkbox.js';
import '@polymer/paper-radio-group/paper-radio-group.js';
import '@polymer/paper-radio-button/paper-radio-button.js';
import '@polymer/paper-listbox/paper-listbox.js';
import '@polymer/paper-item/paper-item.js';
import './tve-renderer.js';
import './tve-status-indicator.js';
Polymer({
  _template: Polymer.html`
<style include="iron-flex"></style>

<style>
:host {
    display: block;
}

li {
    list-style: none;
}

.items {
    @apply(--layout-vertical);
}

paper-checkbox {
    margin: 10px;
}
</style>

<tve-status-indicator status="[[status]]"></tve-status-indicator>

<template is="dom-if" if="[[selectmultiple]]">
    <div class="items">
        <template is="dom-repeat" items="{{_computeChoices(choices.*, randomizeorder)}}">
            <paper-checkbox data-index\$="[[index]]">[[item.title]]</paper-checkbox>
        </template>
    </div>
</template>

<template is="dom-if" if="[[!selectmultiple]]">
    <paper-radio-group class="items">
        <template is="dom-repeat" items="{{_computeChoices(choices.*, randomizeorder)}}">
            <paper-radio-button data-index\$="[[index]]" name="{{index}}">[[item.title]]</paper-radio-button>
        </template>
    </paper-radio-group>
</template>
`,

  is: 'tv-exercise-multiple-choice',

  properties: {
      selectmultiple: {
          type: Boolean,
          value: false
      },
      randomizeorder: {
          type: Boolean,
          value: false
      },
      choices: {
          type: Array,
          value: []
      },
      status: {
          type: String,
          value: ""
      }
  },

  _computeChoices: function(choices, randomizeOrder) {
      if (randomizeOrder) {
          return this._shuffle(this.choices);
      } else {
          return this.choices;
      }
  },

  _shuffle: function(originalArray) {
      var array = originalArray.slice();
      var counter = array.length;

      // While there are elements in the array
      while (counter > 0) {
          // Pick a random index
          var index = Math.floor(Math.random() * counter);

          // Decrease counter by 1
          counter--;

          // And swap the last element with it
          var temp = array[counter];
          array[counter] = array[index];
          array[index] = temp;
      }
      return array;
  },

  getSelected: function() {
      var selected = [];

      var items = this.selectmultiple ? 
          Polymer.dom(this.root).querySelectorAll("paper-checkbox") : 
          Polymer.dom(this.root).querySelectorAll("paper-radio-button");

      for (var i = 0; i < items.length; i++) {
          var item = items[i];
          if (item.checked) {
              selected.push(parseInt(item.dataset.index));
          }
      }
      return selected;
  },

  grade: function() {
      var maxPoints = 0;
      var points = 0;
      var incorrect = 0;
      var selected = this.getSelected();

      for (var i = 0; i < this.choices.length; i++) {
          if (this.choices[i].correct) {
              maxPoints++;
          }

          if (selected.indexOf(i) !== -1) {
              if (this.choices[i].correct) {
                  points++;
              } else {
                  incorrect++;
              }
          }
      }

      return { 
          answer: {
              selected: selected,
              correct: points,
              incorrect: incorrect,
              maxPoints: maxPoints
          },
          correct: points === maxPoints && incorrect === 0
      };
  },

  validate: function() {
      return this.getSelected().length > 0
  }
});
