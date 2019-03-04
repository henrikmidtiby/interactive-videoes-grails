import { PolymerElement, html } from '@polymer/polymer/polymer-element.js';
import '@polymer/iron-flex-layout/iron-flex-layout-classes.js';
import '@polymer/paper-input/paper-textarea.js';
import '@polymer/paper-icon-button/paper-icon-button.js';

class TVEMarkdownEditor extends PolymerElement {
  static get template() {
    return html`
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
`;
  }

  static get properties() {
    return {
      content: {
          type: String,
          value: "",
          notify: true
      }
    }
  }
}

customElements.define('tve-markdown-editor', TVEMarkdownEditor);

