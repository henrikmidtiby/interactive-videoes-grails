import { PolymerElement, html } from '@polymer/polymer/polymer-element.js';
import '@polymer/marked-element/marked-element.js';
import '@polymer/paper-button/paper-button.js';
import '@polymer/iron-flex-layout/iron-flex-layout-classes.js';
import '@polymer/paper-spinner/paper-spinner.js';
import '@polymer/iron-pages/iron-pages.js';
import './marked-import.js';
import TekVideo from './tve-widget-config.js' 

class TVERenderer extends PolymerElement {
  static get template() {
    return html`
<style is="custom-style">
paper-button.custom {
    --paper-button-ink-color: white;
    /* These could also be individually defined for each of the
    specific css classes, but we'll just do it once as an example */
    --paper-button-flat-keyboard-focus: {
        background-color: var(--paper-indigo-a200);
        color: white !important;    
    };
    --paper-button-raised-keyboard-focus: {
        background-color: var(--paper-indigo-a200) !important;
        color: white !important;
    };
}

paper-button.custom:hover {
    background-color: var(--paper-indigo-400);
}

paper-button.indigo {
    background-color: var(--paper-indigo-500);
    color: white;
    --paper-button-raised-keyboard-focus: {
        background-color: var(--paper-indigo-a200) !important;
        color: white !important;
    };
}

paper-button {
    width: 100%;
}


:host {
    display: inline;
}
</style>
<style include="iron-flex"></style>

<div id="documentInsertion"></div>

<paper-button hidden\$="{{!isInteractive}}" class="custom indigo" on-click="checkAnswers" raised="">

    <iron-pages id="pages" selected="[[_buttonStatus]]">
        <div>Tjek svar</div>
        <div>Korrekt!</div>
        <div>Du mangler at afgive svar i et af felterne</div>
        <div>Der var en fejl i et af felterne</div>
    </iron-pages>
</paper-button>
`;
  }

  static get properties() {
    return {
      identifier: {
          type: Number,
          value: null
      },
      content: {
          type: String,
          observer: '_observeDocument'
      },
      widgets: {
          type: Object,
          value: {},
          observer: '_observeDocument'
      },
      isInteractive: {
          type: Boolean,
          value: false
      },
      _buttonStatus: {
          type: Number,
          value: 0
      }
    }
  }

  _observeDocument(content) {
      var documentInsertion = this.$.documentInsertion;
      var result = content;

      var SEARCHING = 0,
          HAS_OPEN_BRACKET = 1,
          HAS_TYPE = 2;

      var state = 0;
      var start = -1;
      var type = "";
      var body = "";
      var output = [];
      for (var i = 0; i < result.length - 1; i++) {
          var token = result[i];
          var lookahead = result[i + 1];
          switch (state) {
              case SEARCHING:
                  if (token === "[" && lookahead === "[") {
                      state = HAS_OPEN_BRACKET;
                      start = i;
                      i++;
                  }
                  break;
              case HAS_OPEN_BRACKET:
                  if (token === " ") state = HAS_TYPE;
                  else type += token;
                  break;
              case HAS_TYPE:
                  if (token === "]" && lookahead === "]") {
                      i++; // Old code expected i to be at last bracket

                      var replacement = "<span id='insertion-" + output.length + "'></span>";
                      var before = result.substring(0, start);
                      var after = result.substring(i + 1, result.length);
                      var tokenLength = i - start;
                      i = replacement.length - tokenLength + i;
                      result = before + replacement + after;
                      output.push({
                          type: type,
                          body: body
                      });

                      type = "";
                      body = "";
                      start = -1;
                      state = SEARCHING;
                  } else  {
                      body += token;
                  } 
                  break;
          }
      }
      result = marked(result);
      documentInsertion.innerHTML = result;
      for (var i = 0; i < output.length; i++) {
          var insertionPoint = documentInsertion.querySelector("#insertion-" + i);
          
          this._insertWidget(insertionPoint, output[i].type, output[i].body);
      }
  }

  _insertWidget(insertionPoint, type, body) {
      if (type === "ref") {
          var widgetInfo = this.widgets[body];
          if (!widgetInfo) return;
          
          var widgetConfig = TekVideo.WidgetConfiguration[widgetInfo.type];
          if (!widgetConfig) return;
          
          var widget = this._createWidget(widgetConfig.component, widgetInfo.properties);
          insertionPoint.parentNode.replaceChild(widget, insertionPoint);
      } else {
          var widgetConfig = TekVideo.WidgetConfiguration[type];
          if (!widgetConfig) return;

          var widget = this._createWidget(widgetConfig.component, { content: body });
          insertionPoint.parentNode.replaceChild(widget, insertionPoint);
      }
  }

  _createWidget(type, properties) {
      var self = this;
      var component = document.createElement(type);

      for (var property in properties) {
          var value = properties[property];
          component[property] = value;
      }
      component.dataset.isWidget = true;

      component.addEventListener("action", function(e) {
          self.fire("widget-action", {
              widget: component,
              detail: e.detail
          });
      });
      return component;
  }

  checkAnswers() {
      var GRADED_WIDGET_METHODS = ["grade", "validate"];

      var widgets = [].map.call(Polymer.dom(this.root).querySelectorAll("[data-is-widget]"), 
          function(el) { return el; })

      var gradedWidgets = widgets.filter(function(widget) {
          var isGraded = true;
          for (var i = 0; i < GRADED_WIDGET_METHODS.length; i++) {
              if (typeof widget[GRADED_WIDGET_METHODS[i]] !== "function") {
                  isGraded = false;
                  break;
              }
          }
          return isGraded;
      });

      var validates = true;
      var passes = true;
      for (var i = 0; i < gradedWidgets.length; i++) {
          var widget = gradedWidgets[i];
          widget.status = "";

          if (!widget.validate()) {
              widget.status = "warning";
              validates = false;
          }
      }

      if (!validates) {
          this.setStatus(2);
          return;
      }

      var widgetResults = [];
      for (var i = 0; i < gradedWidgets.length; i++) {
          var widget = gradedWidgets[i];

          var result = widget.grade();
          var status = result.correct ? "correct" : "incorrect";
          widget.status = status;
          if (!result.correct){
              passes = false;
          } 
          widgetResults.push(result);
      }

      if (passes) this.setStatus(1);
      else this.setStatus(3);

      this.fire("grade", {
          identifier: this.identifier,
          passes: passes,
          widgetResults: widgetResults
      });
  }

  beginSpinning(status) {
      var self = this;
      self._buttonStatus = 1;

      setTimeout(function() {
          self.setStatus(status);
      }, 600);
  }

  setStatus(status) {
      var self = this;
      self._buttonStatus = status;

      setTimeout(function() {
          self._buttonStatus = 0;
      }, 3000);
  }
}

customElements.define('tve-renderer', TVERenderer);
