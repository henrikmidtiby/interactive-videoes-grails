import { PolymerElement, html } from '@polymer/polymer/polymer-element.js';
import '@polymer/iron-flex-layout/iron-flex-layout-classes.js';
import '@polymer/paper-input/paper-input.js';
import '@polymer/paper-button/paper-button.js';
import '@polymer/paper-card/paper-card.js';
import '@polymer/paper-dropdown-menu/paper-dropdown-menu.js';
import '@polymer/paper-listbox/paper-listbox.js';
import '@polymer/paper-item/paper-item.js';
import '@polymer/paper-toggle-button/paper-toggle-button.js';
import '@polymer/iron-icons/iron-icons.js';
import '@polymer/iron-pages/iron-pages.js';
import '@polymer/paper-input/paper-textarea.js';
import '@polymer/paper-tabs/paper-tabs.js';
import '@polymer/paper-tabs/paper-tab.js';
import '@polymer/paper-styles/color.js';
import '@polymer/iron-a11y-keys/iron-a11y-keys.js';
import './tv-exercise-equation-editor.js';
import './tv-exercise-multiple-choice-editor.js';
import './tve-input-expression-editor.js';
import './tve-matrix-editor.js';
import './tve-markdown-editor.js';
import './tve-sorter-editor.js';
import './tv-exercise-editor-wrapper.js';
import './tve-renderer.js';
import './tve-template-selector.js';
import './tve-widget-config.js';
var PAGE_EDITOR = 0;
var PAGE_PREVIEW = 1;
var PAGE_JSON = 2;

class TVExerciseEditor extends PolymerElement {
  static get template() {
    return html`
<style include="iron-flex"></style>

<style>
:host {
    display: block;
    width: 100%;
    height: 100%;
}

tv-exercise-editor-wrapper {
    margin-top: 20px;
    margin-bottom: 20px;
}

paper-card {
    margin: 16px;
    padding: 16px;
}

paper-tabs {
    background-color: var(--paper-indigo-500);
    color: white;

    --paper-tabs-selection-bar-color: var(--paper-pink-a200);
    text-transform: uppercase;
}

.content {
    margin: 16px;
}
</style>

<paper-tabs selected="{{selectedPage}}" scrollable="" fit-container="">
  <paper-tab>Editor</paper-tab>
  <paper-tab>Forhåndsvisning</paper-tab>
  <paper-tab>JSON</paper-tab>
</paper-tabs>

<iron-pages selected="{{selectedPage}}">
    <div id="editor" class="content">
        <paper-input value="{{name}}" label="Opgave navn"></paper-input>

        <div class="layout horizontal">
            <paper-dropdown-menu label="Widget" always-float-label="" class="flex">
                <paper-listbox class="dropdown-content" id="widgetDropdown">
                    <template is="dom-repeat" items="{{_widgets}}">
                        <paper-item short-name="{{item.shortName}}">
                            {{item.title}}
                        </paper-item>
                    </template>
                </paper-listbox>
            </paper-dropdown-menu>
            <paper-button id="addWidget" on-click="_addWidget">
                <iron-icon icon="add"></iron-icon>
                Tilføj
            </paper-button>
        </div>
        <p><b>Syntaks:</b> <code>[[ref WIDGET-NAVN]]</code> reference til widgets. Widgets med en forkortelse kan indsættes direkte. For eksempel: <code>[[eql 2^2 = 4]]</code></p>
        
        <tve-template-selector id="templateSelector"></tve-template-selector>
        <paper-button on-click="_save" hidden\$="{{hideSave}}">Gem</paper-button>
        
        <paper-textarea value="{{documentContent}}" label="Dokument" rows="20"></paper-textarea>
        
        <div id="editors" class="layout vertical">
        </div>
    </div>

    <div id="preview" class="content">
        <tve-renderer id="renderer" is-interactive=""></tve-renderer>
    </div>
    
    <div id="json" class="content">
        <div id="json">
            <paper-textarea id="jsonField" label="Eksporter JSON" value="{{_computeJSON(name, documentContent, widgets)}}" readonly="">
            </paper-textarea>

            <paper-textarea id="inputJsonField" label="Importer JSON">
            </paper-textarea>
            <paper-button on-click="_sync">Importer</paper-button>
        </div>
    </div>
</iron-pages>
`;
  }

  static get properties() {
    return {
      name: {
          type: String,
          value: "",
          notify: true
      },
      identifier: {
          type: Number,
          value: null
      },
      widgets: {
          type: Object,
          value: {},
          notify: true
      },
      _configuration: {
          type: Object,
          value: {}
      },
      selectedPage: {
          type: Number,
          value: 0, 
          observer: '_observeSelectedPage'
      },
      documentContent: {
          type: String,
          value: "",
          notify: true
      },
      _counter: {
          type: Number,
          value: 0
      },
      _widgets: {
          type: Array,
          value: []
      },
      hideSave: {
          type: Boolean,
          value: false
      }
    }
  }

  ready() {
      var self = this;
      console.log(this.shadowRoot);
      this.$.templateSelector.addEventListener("insert", function(e) {
          var data = e.detail.object;
          self.$.inputJsonField.value = JSON.stringify(data, null, 2);
          self._sync();
      });
  }

  attached() {
      var items = [];
      for (name in TekVideo.WidgetConfiguration) {
          var config = TekVideo.WidgetConfiguration[name];

          var title = config.name;
          if (config.properties.length === 1 && 
                  config.properties[0] === "content") {
              title += " [" + config.shortName + "]";
          }

          var item = {
              title: title,
              shortName: config.shortName
          };
          items.push(item);
      }
      this._widgets = items;
      this.$.widgetDropdown.selected = 0;
  }

  addWidget(widget, name) {
      var self = this;

      var widgetConfig = TekVideo.WidgetConfiguration[widget.type];
      if (widgetConfig) {
          var editor = document.createElement(widgetConfig.editor);

          var wrapper = document.createElement("tv-exercise-editor-wrapper");
          wrapper.setEditor(editor); // Cross-platform hack
          if (!name) {
              wrapper.name = "ny-" + widget.type + self._counter;
              self._counter++;
          } else {
              wrapper.name = name;
          }
          widget.name = wrapper.name;
          this.widgets[widget.name] = widget;
          this.$.editors.appendChild(wrapper);

          for (var property in widget.properties) {
              var value = widget.properties[property];
              editor[property] = value;
          }

          for (var i = 0; i < widgetConfig.properties.length; i++) {
              self._setupPropertyListener(i, editor, widget, wrapper, 
                  widgetConfig);
          }

          wrapper.addEventListener("name-changed", function(e) {
              delete self.widgets[widget.name];
              widget.name = wrapper.name;
              self.widgets[wrapper.name] = widget;
          });

          wrapper.addEventListener("delete", function() {
              var index = Array.prototype.slice.call(self.$.editors.children).indexOf(wrapper);
              self.$.editors.removeChild(wrapper);
              delete self.widgets[widget.name];
          });
      }
  }

  _setupPropertyListener(i, editor, widget, wrapper, widgetConfig) {
      var self = this;
      var property = widgetConfig.properties[i];
      editor.addEventListener(property + "-changed", function(ev) {
          self.widgets[widget.name].properties[property] = editor[property];
      });
  }

  _addWidget() {
      var type = this.$.widgetDropdown.selectedItem.shortName;
      this.addWidget({
          "type": type,
          "properties": { }
      });
  }

  _computeJSON(widgetsSplices) {
      return JSON.stringify({
          name: this.name,
          document: this.documentContent,
          widgets: this.widgets
      }, null, 2);
  }

  _sync() {
      var value = JSON.parse(this.$.inputJsonField.value);
      this.widgets = {};
      this.$.editors.innerHTML = "";
      this.documentContent = value.document;
      for (a in value.widgets) {
          this.addWidget(value.widgets[a], value.widgets[a].name);
      }
      this.name = value.name;
      // TODO Hack
      this._observeSelectedPage(PAGE_JSON);
  }

  _observeSelectedPage(selectedPage) {
      switch (selectedPage) {
          case PAGE_PREVIEW:
              this.$.renderer.content = this.documentContent;
              this.$.renderer.widgets = JSON.parse(JSON.stringify(this.widgets));
              break;
          case PAGE_JSON:
              // TODO Hack
              this.widgets = JSON.parse(JSON.stringify(this.widgets));
              break;
      }
  }

  _save() {
      this.fire("save");
  }

  update() {
      // TODO Hack
      var obj = {
          document: this.documentContent,
          widgets: this.widgets,
          name: this.name
      };
      this.$.inputJsonField.value = JSON.stringify(obj);
      this._sync();
  }
}

customElements.define('tv-exercise-editor', TVExerciseEditor);

