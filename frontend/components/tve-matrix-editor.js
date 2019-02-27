import '@polymer/polymer/polymer-legacy.js';
import '@polymer/iron-flex-layout/iron-flex-layout-classes.js';
import '@polymer/paper-input/paper-input.js';
import './tve-matrix-renderer.js';
Polymer({
  _template: Polymer.html`
<style include="iron-flex"></style>

<style>
:host {
    display: block;
}

paper-input{
    margin-right: 16px;
}
</style>

<div class="layout vertical">
    <h3>Dimensioner</h3>
    <div class="layout horizontal">
        <paper-input value="{{height}}" label="Rækker"></paper-input>
        <paper-input value="{{width}}" label="Kolonner"></paper-input>
    </div>
    <h3>Svar</h3>
    <tve-matrix-renderer id="matrix" width="[[width]]" height="[[height]]" value="{{answer}}">
    </tve-matrix-renderer>
</div>
`,

  is: 'tve-matrix-editor',

  properties: {
      height: {
          type: Number,
          value: 5,
          notify: true
      },
      width: {
          type: Number,
          value: 5,
          notify: true
      },
      answer: {
          type: Array,
          notify: true
      }
  }
});
