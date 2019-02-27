import '@polymer/polymer/polymer-legacy.js';
import '@polymer/iron-flex-layout/iron-flex-layout-classes.js';
import '@polymer/marked-element/marked-element.js';
import '@polymer/iron-input/iron-input.js';
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

.faded {
    color: white;
    background-color: #AAA;
}

input:placeholder-shown {
    color: white;
    background-color: #AAA;
}

.not-faded {
    color: black !important;
    background-color: white !important;
}
</style>

<template id="matrixRepeat" is="dom-repeat" items="{{_generateRange(height)}}" index-as="row">
    <div class="row">
        <template is="dom-repeat" items="{{_generateRange(width)}}" index-as="col">
            <span>
                <input is="iron-input" placeholder=" " data-column\$="{{col}}" data-row\$="{{row}}" on-change="_updateMatrix">
                
            </span>
        </template>
    </div>
</template>
`,

  is: 'tve-matrix-renderer',

  properties: {
      height: {
          type: Number,
          value: 5
      },
      width: {
          type: Number,
          value: 5
      },
      value: {
          type: Array,
          value: [],
          notify: true
      }
  },

  ready: function() {
      var self = this;
      this.$.matrixRepeat.addEventListener("dom-change", function() {
          setTimeout(function() {
              try {
                  self._updateMatrix();
              } catch (ignored) {}
          }, 100);
      });
  },

  _generateRange: function(value) {
      var res = [];
      for (var i = 0; i < value; i++) {
          res.push(i);
      }
      return res;
  },

  _updateMatrix: function() {
      var components = [];
      var maxRow = 0;
      var maxColumn = 0;
      for (var i = 0; i < this.height; i++) {
          var rowComponents = [];
          for (var j = 0; j < this.width; j++) {
              var field = this.$$('[data-column*="' + j + '"][data-row*="' + i + '"]');
              rowComponents.push(field);

              if (field.value !== "") {
                  if (i > maxRow) maxRow = i;
                  if (j > maxColumn) maxColumn = j;
              }
          }
          components.push(rowComponents);
      }

      var result = [];
      for (var i = 0; i < this.height; i++) {
          var row = [];
          for (var j = 0; j < this.width; j++) {
              var component = components[i][j];
              if (i > maxRow || j > maxColumn) {
                  component.classList.add("faded");
                  component.classList.remove("not-faded");
              } else {
                  component.classList.remove("faded");
                  component.classList.add("not-faded");
                  row.push(component.value);
              }
          }
          if (row.length !== 0) result.push(row);
      }

      this.value = result;
  }
});
