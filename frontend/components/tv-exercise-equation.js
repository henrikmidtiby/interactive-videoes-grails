import { PolymerElement, html } from '@polymer/polymer/polymer-element.js';
import '@polymer/iron-flex-layout/iron-flex-layout-classes.js';

class TVExerciseEquation extends PolymerElement {
  static get template() {
   return html`
<style include="iron-flex"></style>
<link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/katex@0.11.1/dist/katex.min.css" integrity="sha384-zB1R0rpPzHqg7Kpt0Aljp8JPLqbXI3bhnPWROx27a9N0Ll6ZP/+DiW/UqRcLbRjq" crossorigin="anonymous">

<style>
:host {
    display: block;
}
</style>

<div id="mathcontent"></div>

`;
  }
  static get properties() {
    return {
      content: {
        type: String, 
        value: "", 
        observer: 'insert_math_content'
      }
    }
  }
  ready() {
    super.ready();
    this.insert_math_content();
  }
  insert_math_content() {
    var element = this.$.mathcontent;
    // var augmented_content = "\\begin{align*}" + this.content + "\\end{align*}";
    // Katex does not support the align* environment.
    var augmented_content = this.content;
    katex.render(augmented_content, element, {displayMode: true, throwOnError: false});
  }
}

customElements.define('tv-exercise-equation', TVExerciseEquation);

/*<link rel="import" href="mathjax-include.html">*/
/*
  FIXME(polymer-modulizer): the above comments were extracted
  from HTML and may be out of place here. Review them and
  then delete this comment!
*/
