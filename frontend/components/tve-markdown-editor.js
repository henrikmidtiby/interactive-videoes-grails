import '@polymer/polymer/polymer-legacy.js';
import '@polymer/iron-flex-layout/iron-flex-layout-classes.js';
import '@polymer/paper-input/paper-textarea.js';
import '@polymer/paper-icon-button/paper-icon-button.js';
Polymer({
  _template: Polymer.html`
<style include="iron-flex"></style>

<style>
:host {
    display: block;
}

paper-dialog {
    width: 1000px;
}
</style>

<div class="layout vertical">
    <paper-textarea label="Indhold" rows="10" value="{{content}}">
    </paper-textarea>
</div>
`,

  is: 'tve-markdown-editor',

  properties: {
      content: {
          type: String,
          value: "",
          notify: true
      }
  }
});
