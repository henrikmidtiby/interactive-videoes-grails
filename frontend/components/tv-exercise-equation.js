import { PolymerElement, html } from '@polymer/polymer/polymer-element.js';
import '@polymer/iron-flex-layout/iron-flex-layout-classes.js';
import './math-tex.js';

class TVExerciseEquation extends PolymerElement {
  static get template() {
   return html`
<style include="iron-flex"></style>

<style>
:host {
    display: block;
}
</style>

<math-tex display="block" content="\\begin{align*}{{content}}\\end{align*}"></math-tex>
`;
  }
  static get properties() {
    return {
      content: {
        type: String, 
        value: ""
      }
    }
  }
  constructor() {
    super();
  }
}

customElements.define('tv-exercise-equation', TVExerciseEquation);

/*<link rel="import" href="mathjax-include.html">*/
/*
  FIXME(polymer-modulizer): the above comments were extracted
  from HTML and may be out of place here. Review them and
  then delete this comment!
*/