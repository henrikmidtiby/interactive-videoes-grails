import '@polymer/polymer/polymer-legacy.js';
import './jquery-dependency.js';
import './tekvideo-math-field-scripts.js';
function addExtSheet(componentRoot, href) {
    if (document.head.createShadowRoot) {
        var style = document.createElement("style");
        style.textContent = '@import "' + href + '"';
        componentRoot.appendChild(style);
    } else {
        window.extSheets = window.extSheets || {};
        if (!window.extSheets[href]) {
            var link = document.createElement("link");
            link.rel = "stylesheet";
            link.href = href;
            document.head.appendChild(link);
            window.extSheets[href] = true;
        }
    }
}

Polymer({
  _template: Polymer.html`
<style>
:host {
    display: inline;
}

#mathField {
  min-width: var(--tekvideo-math-field-min-width, 300px);
}
</style>

<span id="editor"></span>
`,

  is: 'tekvideo-math-field',
  _shouldUpdate: true,

  properties: {
      value: {
          type: String,
          value: "",
          observer: "_valueChanged"
      }
  },

  _mathField: null,

  attached: function() {
      addExtSheet(this.shadowRoot, this.resolveUrl("/assets/vendor/mathquill2.css"));
      var self = this;
      var editor = this.$.editor;
      editor.classList.add(this.is);
      var MQ = MathQuill.getInterface(2);
      var mathField = MQ.MathField(editor, {
          spaceBehavesLikeTab: true,
          handlers: {
              edit: function() {
                  self._shouldUpdate = false;
                  self.value = mathField.latex();
              }
          }
      });
      this._mathField = mathField;
  },

  _valueChanged: function() {
      if (this._shouldUpdate && this._mathField != null) {
          this._mathField.latex(this.value);
      }
      this._shouldUpdate = true;
  }
});
