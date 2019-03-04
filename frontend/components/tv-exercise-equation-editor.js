import { PolymerElement, html } from '@polymer/polymer/polymer-element.js';
import '@polymer/iron-flex-layout/iron-flex-layout-classes.js';
import '@polymer/paper-input/paper-textarea.js';

class TVExerciseEquationEditor extends PolymerElement {
  static get template() {
    return html`
<style include="iron-flex"></style>

<style>
:host {
    display: block;
}
</style>

<paper-textarea label="LaTeX" value="{{content}}"></paper-textarea>
`;
  }

  static get properties() {
    return {
      content: {
        	type: String,
        	value: "",
        	notify: true
      }
    };
  }
}

customElements.define('tv-exercise-equation-editor', TVExerciseEquationEditor);
