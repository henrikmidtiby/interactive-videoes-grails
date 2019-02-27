import '@polymer/polymer/polymer-legacy.js';
import '@polymer/iron-flex-layout/iron-flex-layout-classes.js';
import './math-tex.js';
Polymer({
  _template: Polymer.html`
<style include="iron-flex"></style>

<style>
:host {
    display: block;
}
</style>

<math-tex display="block" content="\\begin{align*}{{content}}\\end{align*}"></math-tex>
`,

  is: 'tv-exercise-equation',

  properties: {
      content: {
        	type: String,
        	value: ""
      }
  }
});
/*<link rel="import" href="mathjax-include.html">*/
/*
  FIXME(polymer-modulizer): the above comments were extracted
  from HTML and may be out of place here. Review them and
  then delete this comment!
*/
