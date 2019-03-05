import { PolymerElement, html } from '@polymer/polymer/polymer-element.js';
import '@polymer/iron-flex-layout/iron-flex-layout-classes.js';
import '@polymer/iron-icons/iron-icons.js';
import '@polymer/paper-icon-button/paper-icon-button.js';
import '@polymer/paper-input/paper-input.js';
import '@polymer/iron-collapse/iron-collapse.js';

class TVExerciseEditorWrapper extends PolymerElement {
  static get template() {
    return html`
<style include="iron-flex"></style>

<style>
:host {
    display: block;
}
</style>

<div class="layout horizontal">
    <div class="flex">
        <p hidden\$="{{editMode}}"><b>{{name}}</b></p>
        <paper-input id="nameInput" value="{{name}}" hidden="{{!editMode}}" on-keydown="_onNameInput">
        </paper-input>
    </div>
    <paper-icon-button id="editButton" icon="create" on-click="edit"></paper-icon-button>
    <paper-icon-button icon="delete" on-click="delete"></paper-icon-button>
    <paper-icon-button icon="unfold-more" on-click="toggle"></paper-icon-button>
</div>

<iron-collapse id="collapse">
    <div class="content" id="content">
        <hr>
    </div>
</iron-collapse>
`;
  }

  static get properties() {
    return {
      name: {
          type: String,
          value: "",
          notify: true
      },
      editMode: {
          type: Boolean,
          value: false
      }
    }
  }

  setEditor(editor) {
    this.$.content.appendChild(editor);
  }

  toggle() {
    this.$.collapse.toggle();
  }

  delete() {
      this.fire("delete");
  }

  edit() {
    this.editMode = !this.editMode;
    var button = this.$.editButton;
    button.icon = this.editMode ? "check" : "create";
    if (this.editMode) this.$.nameInput.focus();
  }

  _onNameInput(e) {
      if (e.keyCode === 13) {
          this.edit();
      }
  }
}
  
customElements.define('tv-exercise-editor-wrapper', TVExerciseEditorWrapper);

