import { PolymerElement, html } from '@polymer/polymer/polymer-element.js';
import {} from '@polymer/polymer/lib/utils/async.js';

// import '@polymer/iron-flex-layout/iron-flex-layout-classes.js';

class TVEInlineEquation extends PolymerElement {
  static get template() {
    return html`

<link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/katex@0.10.1/dist/katex.css" integrity="sha384-b/NoaeRXkMxyKcrDw2KtVtYKkVg3dA0rTRgLoV7W2df3MzeR1eHLTi+l4//4fMwk" crossorigin="anonymous">
<script defer src="https://cdn.jsdelivr.net/npm/katex@0.10.1/dist/katex.js" integrity="sha384-ern5NCRqs6nJ/a4Ik0nB9hnKVH5HwV2XRUYdQl09OB/vvd1Lmmqbg1Mh+mYUclXx" crossorigin="anonymous"></script>

<div id="mathcontent"></div>
`;
  }
  static get properties() {
    return {
      content: {
        type: String, 
        value: "", 
      }
    }
  }
  ready() {
    super.ready();
    console.log("Setting timeout");
//    setTimeout(this.insert_math_content.bind(this), 1000);
    this.insert_math_content();
    console.log("Finished setting timeout");
  }
  insert_math_content() {
    console.log("<insert_math_content>");
    var element = this.$.mathcontent;
    console.log(this.content);
    var temp = katex.renderToString(this.content, element, {displayMode: false, throwOnError: false});
    console.log(temp);
    element.innerHTML = temp;
    console.log("</insert_math_content>");
  }
}

customElements.define('tve-inline-equation', TVEInlineEquation);
