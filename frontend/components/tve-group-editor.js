import { PolymerElement, html } from '@polymer/polymer/polymer-element.js';
import '@polymer/polymer/polymer-legacy.js';
import '@polymer/iron-flex-layout/iron-flex-layout-classes.js';
import '@polymer/paper-input/paper-input.js';
import '@polymer/paper-input/paper-textarea.js';
import '@polymer/iron-pages/iron-pages.js';
import '@polymer/app-route/app-route.js';
import '@polymer/app-route/app-location.js';
import '@polymer/paper-card/paper-card.js';
import '@polymer/paper-button/paper-button.js';
import '@polymer/paper-toast/paper-toast.js';
import '@polymer/paper-fab/paper-fab.js';
import '@polymer/paper-item/paper-item.js';
import '@polymer/paper-item/paper-item-body.js';
import '@polymer/paper-icon-button/paper-icon-button.js';
import '@polymer/paper-listbox/paper-listbox.js';
import '@polymer/paper-dialog/paper-dialog.js';
import '@polymer/paper-button/paper-button.js';
import '@polymer/paper-toolbar/paper-toolbar.js';
import '@polymer/iron-icons/communication-icons.js';
import './tv-exercise-editor.js';

class TVEGroupEditor extends PolymerElement {
  static get template() {
    return html`<style include="iron-flex"></style>

<style>
:host {
    display: block;
}

paper-fab {
    position: fixed;
    bottom: 24px;
    right: 24px;
}

.paper-item-link {
    color: inherit;
    text-decoration: none;
}

.fake-link {
    cursor: pointer;
}

.content {
    margin: 16px;
}

a.no-decoration {
    text-decoration: none;
    color: white;
}
</style>

<app-location route="{{_route}}" use-hash-as-path></app-location>

<app-route
    route="{{_route}}"
    pattern="/:page"
    data="{{_pageData}}"
    tail="{{_pageTail}}">
</app-route>

<app-route
    route="{{_pageTail}}"
    pattern="/:id"
    data="{{_pageId}}">
</app-route>

<paper-toolbar>
    <template is="dom-if" if="{{_showBackButton(_pageData)}}">
        <paper-icon-button icon="chevron-left" on-click="_goBack"></paper-icon-button>
    </template>
    <span class="title">{{title}}</span>
    <a href="#/import" class="no-decoration">
        <paper-icon-button icon="communication:import-export"></paper-icon-button>
    </a>
    <paper-icon-button icon="save" on-click="save"></paper-icon-button>

</paper-toolbar>
<iron-pages selected="[[_pageData.page]]" attr-for-selected="id">
    <div id="home" class="content">
        <paper-input 
            label="Navn" 
            value="{{name}}">
        </paper-input>
        <paper-input 
            label="Thumbnail URL" 
            value="{{thumbnailUrl}}">
        </paper-input>
        <paper-input 
            label="Opgavestreak for at bestå" 
            value="{{streakToPass}}">
        </paper-input>
        <paper-textarea 
            rows="10"
            label="Beskrivelse" 
            value="{{description}}">
        </paper-textarea>

        <div role="listbox">
            <template is="dom-repeat" items="{{exercises}}">
                <paper-item on-focus="selectItem" class="fake-link">
                    <paper-item-body two-line>
                        <div>[[item.name]]</div>
                        <div secondary>[[_computeShortDocument(item)]]</div>
                    </paper-item-body>
                    <paper-icon-button icon="content-copy" alt="Lav kopi" on-click="_makeCopy"></paper-icon-button>
                    <paper-icon-button icon="delete" alt="Slet" on-click="_deleteExercise"></paper-icon-button>
                </paper-item>
            </template>
        </div>
    </div>
    <div id="edit">
        <tv-exercise-editor 
            id="editor"
            identifier="{{currentExercise.identifier}}"
            name="{{currentExercise.name}}"
            document-content="{{currentExercise.document}}"
            widgets="{{currentExercise.widgets}}"
            hide-save>
        </tv-exercise-editor>
    </div>
    <div id="import" class="content">
        <paper-textarea
            id="inputJsonField"
            label="Importer JSON"
            rows="10">
        </paper-textarea>
        <paper-button on-click="_import">Importer</paper-button>
    
        <paper-textarea 
            id="jsonField"
            label="Eksporter JSON" 
            value="{{_computeJSON(name, description, streakToPass, thumbnailUrl, exercises.*)}}"
            readonly>
        </paper-textarea>
    </div>
</iron-pages>

<paper-toast id="toast">
</paper-toast>

<paper-dialog id="deleteModal">
  <h2>Slet opgave</h2>
  <p>Er du sikker på du vil slette opgaven "{{exerciseName}}"?</p>
  <div class="buttons">
    <paper-button dialog-dismiss>Annuller</paper-button>
    <paper-button dialog-confirm autofocus on-click="_confirmDelete">Ja, slet opgaven</paper-button>
  </div>
</paper-dialog>


<paper-fab icon="add" on-click="_addExercise"></paper-fab>

`;
  }
  
  static get properties() {
    return {
      name: {
        type: String,
        value: ""
      },
      description: {
        type: String,
        value: ""
      },
      thumbnailUrl: {
        type: String,
        value: ""
      },
      exercises: {
        type: Array,
        value: []
      },
      streakToPass: {
        type: Number,
        value: 5
      },
      title: {
        type: String,
        value: "Ny opgave"
      }
    }
  }

  // observers: ["_observePage(_pageData)", "_observePageData(_pageId)"]

  _observePage(pageData) {
      if (pageData.page !== "home" && pageData.page !== "edit" && 
              pageData.page !== "import") {
          document.location = "#/home";
      }
      this.exercises = JSON.parse(JSON.stringify(this.exercises));
  }

  selectItem(e) {
      document.location = this._computeEditLink(e.model.index);
  }

  _import() {
      var obj = JSON.parse(this.$.inputJsonField.value);
      var exercises = obj.exercises;
      for (var i = 0; i < exercises.length; i++) {
          this.push("exercises", exercises[i]);
      }
      this.description = obj.description;
      this.thumbnailUrl = obj.thumbnailUrl;
      this.name = obj.name;
      this.streakToPass = obj.streakToPass;
      this.$.inputJsonField.value = "";
      this._goBack();
  }

  _computeJSON() {
      return JSON.stringify({
          name: this.name,
          description: this.description,
          thumbnailUrl: this.thumbnailUrl,
          exercises: this.exercises,
          streakToPass: this.streakToPass
      });
  }

  _computeShortDocument(item) {
      var text = item.document;
      var length = text.length;
      return text.substring(0, Math.min(length, 120));
  }

  _goBack() {
      document.location = "#/home";
  }

  _makeCopy(e) {
      var exercise = e.model.item;
      var copy = JSON.parse(JSON.stringify(exercise));
      copy.identifier = null;
      copy.name += " (kopi)";
      this.push("exercises", copy);
  }

  _observePageData(pageId) {
      if (this._pageData.page !== "edit") return;

      var id = pageId.id;
      var editor = this.$.editor;

      var exercise = this.exercises[id];
      if (!exercise) {
          this._displayToast("Kunne ikke finde opgave");
          this._route.path = "home";
          document.location = "#/home"
      } else {
          this.currentExercise = exercise;
          editor.selectedPage = 0;
          editor.update();
      }
  }

  _showBackButton(_pageData) {
      return _pageData.page !== "home";
  }

  _computeEditLink(item) {
      return "#/edit/" + item;
  }

  _addExercise() {
      this.push("exercises", {
          identifier: null,
          name: "Ny opgave",
          document: "",
          widgets: {}
      });
      document.location = "#/edit/" + (this.exercises.length - 1);
  }

  _deleteExercise(e) {
      this.currentExerciseIndex = e.model.index;
      this.exerciseName = this.exercises[this.currentExerciseIndex].name;
      this.$.deleteModal.open();
  }

  _confirmDelete() {
      this.splice("exercises", this.currentExerciseIndex, 1);
  }

  _displayToast(text) {
      var toast = this.$.toast;
      toast.text = text;
      toast.opened = true;
  }

  save() {
      if (!this.description) {
          this._displayToast("Mangler opgavebeskrivelse");
      } else if (!this.name) {
          this._displayToast("Mangler navn");
      } else if (!this.streakToPass) {
          this._displayToast("Mangler opgavestreak");
      } else {
          var event = new CustomEvent("save", 
                                      {bubbles: true, 
                                       composed: true}); 
          self.dispatchEvent(event);
      }
  }

  displaySaveSuccess() {
      this._displayToast("Opgaven er blevet gemt!");
  }

  displaySaveFailure() {
      this._displayToast("Der skete en fejl da opgaven skulle gemmes!");
  }

  displayValidationFailure() {
      this._displayToast("Der skete en fejl under validering af input. Mangler du navn?");
  }
}

customElements.define('tve-group-editor', TVEGroupEditor);
