import '@polymer/polymer/polymer-legacy.js';
import '@polymer/iron-flex-layout/iron-flex-layout-classes.js';
import '@polymer/paper-input/paper-input.js';
import '@polymer/paper-button/paper-button.js';
import '@polymer/paper-checkbox/paper-checkbox.js';
import '@polymer/iron-icons/iron-icons.js';
import '@polymer/paper-icon-button/paper-icon-button.js';
import '@polymer/paper-tooltip/paper-tooltip.js';
Polymer({
  _template: Polymer.html`
<style include="iron-flex"></style>

<style>
:host {
    display: block;
}
</style>

<paper-input value="{{columnnamea}}" label="Navn A"></paper-input>
<paper-input value="{{columnnameb}}" label="Navn B"></paper-input>

<template is="dom-repeat" items="{{values}}">
    <div class="layout horizontal">
        <paper-input value="{{item.0.value}}" label="A" class="flex"></paper-input>
        <paper-input value="{{item.1.value}}" label="B" class="flex"></paper-input>
        <paper-icon-button icon="delete" on-click="delete"></paper-icon-button>
    </div>
</template>

<div class="layout horizontal">
    <paper-button on-click="_addItem" class="flex">Nyt element</paper-button>
</div>
`,

  is: 'tve-sorter-editor',

  properties: {
      columnnamea: {
          type: String,
          value: "",
          notify: true
      },
      columnnameb: {
          type: String,
          value: "",
          notify: true
      },
      values: {
          type: Array,
          value: [],
          notify: true
      },
  },

  _addItem: function() {
      var copy = this.values.slice();
      copy.push([{ value: "" }, { value: "" }]);
      this.values = copy;
  },

  delete: function(e) {
      var index = e.model.index;
      this.values.splice(index, 1);
      this.values = this.values.slice();
  }
});
