import '@polymer/polymer/polymer-legacy.js';
import '@polymer/iron-flex-layout/iron-flex-layout-classes.js';
import '@polymer/marked-element/marked-element.js';
import './tve-matrix-renderer.js';
import './tve-status-indicator.js';
Polymer({
  _template: Polymer.html`
<style include="iron-flex"></style>

<style>
:host {
    display: block;
}

input {
    height: 30px;
    width: 40px;
    margin: 3px;
    padding: 3px;
}
</style>

<tve-status-indicator status="[[status]]"></tve-status-indicator>

<tve-matrix-renderer id="matrix" height="[[height]]" width="[[width]]">
</tve-matrix-renderer>
`,

  is: 'tve-matrix',

  properties: {
      height: {
          type: Number,
          value: 5
      },
      width: {
          type: Number,
          value: 5
      },
      answer: {
          type: Array,
          value: []
      },
      status: {
          type: String,
          value: ""
      }
  },

  grade: function() {
      var givenAnswer = this.$.matrix.value;
      var correct = true;

      try {
          if (this.answer.length > 0 && 
                  this.answer.length === givenAnswer.length && 
                  this.answer[0].length === givenAnswer[0].length) {
              outer: for (var i = 0; i < this.answer.length; i++) {
                  for (var j = 0; j < this.answer[0].length; j++) {
                      if (this.answer[i][j] !== givenAnswer[i][j]) {
                          correct = false;
                          break outer;
                      }
                  }
              }
          } else {
              correct = false;
          }
      } catch (e) { 
          console.log(e); 
          correct = false;
      }

      return {
          answer: givenAnswer,
          correct: correct
      };
  },

  validate: function() {
      return true;
  }
});
