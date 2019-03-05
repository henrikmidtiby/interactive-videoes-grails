import { PolymerElement, html } from '@polymer/polymer/polymer-element.js';
import '@polymer/iron-flex-layout/iron-flex-layout-classes.js';
import '@polymer/marked-element/marked-element.js';
import '@polymer/paper-button/paper-button.js';
import '@polymer/iron-collapse/iron-collapse.js';
import '@polymer/iron-image/iron-image.js';
import '@polymer/paper-card/paper-card.js';
import './tve-renderer.js';
import TekVideoTemplates from './tve-templates.js';

class TVETemplateSelector extends PolymerElement {
  static get template() {
    return html`
<style include="iron-flex"></style>

<style>
:host {
    display: block;
}

paper-card.template { 
    @apply(--layout-horizontal); 
}

.template-image {
    width: 150px;
}

.template-content {
    @apply(--layout-flex);
    float: left;
}

.template-header { 
    @apply(--paper-font-headline); 
}

.template-name { 
    color: var(--paper-grey-600); margin: 10px 0; 
}

paper-icon-button.template-icon {
    --iron-icon-fill-color: white;
    --iron-icon-stroke-color: var(--paper-grey-600);
}

.template {
    margin: 16px 0 16px 0;
}

.templateButton {
    width: 100%;
    color: white;
    background-color: var(--paper-pink-500);
}
</style>

<paper-button on-click="toggle" class="templateButton" raised="">Toggle templates</paper-button>

<iron-collapse id="collapse">
  <div>
    <template is="dom-repeat" items="[[_templates]]">
        <paper-card class="template">
            <div class="template-content">
                <div class="card-content">
                    <div class="template-header">[[item.name]]</div>
                    <div>[[item.description]]</div>
                </div>
                <div class="card-actions">
                    <paper-button data-template\$="[[item.name]]" on-click="_insertTemplate">Indsæt</paper-button>
                </div>
            </div>
        </paper-card>
    </template>
  </div>
</iron-collapse>
`;
  }

  static get properties() {
    return {
      _dirtyTemplates: {
          type: Boolean,
          value: true
      },
      _templates: {
          type: Array,
          computed: "_computeTemplates(_dirtyTemplates)"
      }
    }
  }

  insertTemplate(name) {
      var template = TekVideoTemplates.Templates[name];
      if (template) {
          var event = new CustomEvent('insert', {detail: template, bubbles: true, composed: true});
          this.dispatchEvent(event);
      }
  }

  _insertTemplate(e) {
      var name = e.target.dataset.template;
      // TODO Confirm
      this.insertTemplate(name);
  }

  _computeTemplates() {
      var templates = TekVideoTemplates.Templates;
      var res = [];
      for (var key in templates) {
          res.push(templates[key]);
      }
      return res;
  }

  refreshTemplates() {
      this._dirtyTemplates = !this._dirtyTemplates;
  }

  toggle() {
      this.$.collapse.toggle();
  }
}

customElements.define('tve-template-selector', TVETemplateSelector);
