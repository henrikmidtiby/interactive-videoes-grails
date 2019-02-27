import '@polymer/polymer/polymer-legacy.js';
import '@polymer/iron-flex-layout/iron-flex-layout-classes.js';
import '@polymer/paper-input/paper-textarea.js';
Polymer({
  _template: Polymer.html`
<style include="iron-flex"></style>

<style>
:host {
    display: block;
}
</style>

<paper-textarea label="LaTeX" value="{{content}}"></paper-textarea>
`,

  is: 'tv-exercise-equation-editor',

  properties: {
      content: {
        	type: String,
        	value: "",
        	notify: true
      }
  }
});
