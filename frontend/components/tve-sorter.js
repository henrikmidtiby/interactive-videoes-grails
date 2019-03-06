import { PolymerElement, html } from '@polymer/polymer/polymer-element.js';
import '@polymer/iron-flex-layout/iron-flex-layout-classes.js';
import './tve-status-indicator.js';
import './tve-renderer.js';
/**
 * Shuffles array in place.
 * @param {Array} a items The array containing the items.
 */
function shuffle(a) {
    var j, x, i;
    for (i = a.length; i; i--) {
        j = Math.floor(Math.random() * i);
        x = a[i - 1];
        a[i - 1] = a[j];
        a[j] = x;
    }
}

function zip(arrays) {
    return arrays[0].map(function(_,i){
        return arrays.map(function(array){return array[i]})
    });
}

class TVESorter extends PolymerElement {
  static get template() {
    return html`
<style include="iron-flex"></style>

<style>
:host {
    display: block;
}

.itemA, .itemB {
    min-width: 150px;
    border: 1px solid black;
}

.dropzone {
    background-color: lightblue;
}
</style>

<tve-status-indicator status="[[status]]"></tve-status-indicator>
<table>
    <thead>
        <tr>
            <th>[[columnnamea]]</th>
            <th>[[columnnameb]]</th>
        </tr>
    </thead>
    <tbody>
    <template is="dom-repeat" items="{{_currentOrder}}">
        <tr>
            <td>
                <div class="itemA" on-drop="dropA" on-dragend="dragEndA" on-dragstart="dragStartA" on-dragover="dragOverA" on-drag="dragA" draggable="true">
                    <tve-renderer content="{{item.0.value}}"></tve-renderer>
                </div>
            </td>
            <td>
                <div class="itemB">
                    <tve-renderer content="{{item.1.value}}"></tve-renderer>
                </div>
            </td>
        </tr>
    </template>
    </tbody>
</table>
`;
  }

  static get properties() {
    return {
      columnnamea: {
          type: String,
          value: "Col 1"
      },
      columnnameb: {
          type: String,
          value: "Col 2"
      },
      values: {
          type: Array,
          value: [
              [{ value: "1" }, { value: "A" }],
              [{ value: "2" }, { value: "B" }],
              [{ value: "3" }, { value: "C" }],
          ],
          observer: '_observeValues'
      },
      _currentOrder: {
          type: Array,
          value: []
      },
      status: {
          type: String,
          value: ""
      }
    }
  }

  _observeValues() {
      this._computeRandomizedValues();
  }

  _computeRandomizedValues() {
      if (!this.values) return;
      var aVals = this.values.map(function(e, i) { 
          return {  value: e[0].value, idx: i };  
      });
      var bVals = this.values.map(function(e, i) { 
          return { value: e[1].value, idx: i }; 
      });
      shuffle(aVals);
      shuffle(bVals);
      this._currentOrder = zip([aVals, bVals]);
  }

  dragA(e) {
      var dom = this.shadowRoot;
      var items = dom.querySelectorAll(".itemA");
      for (var i = 0; i < items.length; i++) {
          if (i === e.model.index) continue;
          items[i].classList.add("dropzone");
      }
  }

  dropA(e) {
      var targetIdx = e.model.index;
      var sourceIdx = parseInt(e.dataTransfer.getData("x-tve-dnd-a"));

      var temp = this._currentOrder[targetIdx][0];
      this._currentOrder[targetIdx][0] = this._currentOrder[sourceIdx][0];
      this._currentOrder[sourceIdx][0] = temp;
      this._currentOrder = JSON.parse(JSON.stringify(this._currentOrder));
  }

  dragOverA(e){
      var types = e.dataTransfer.types;
      if (types.indexOf("x-tve-dnd-a") !== -1) {
          e.preventDefault();
      }
  }

  dragStartA(e) {
      e.dataTransfer.setData("x-tve-dnd-a", e.model.index);
  }

  dragEndA(e) {
      var dom = this.shadowRoot;
      var items = dom.querySelectorAll(".itemA");
      for (var i = 0; i < items.length; i++) {
          items[i].classList.remove("dropzone");
      }
  }

  grade() {
      var correct = true;
      for (var i = 0; i < this._currentOrder.length; i++) {
          var item = this._currentOrder[i];
          if (item[0].idx !== item[1].idx) {
              correct = false;
              break;
          }
      }
      return { correct: correct, answer: "" };
  }

  validate() {
      return true;
  }
}

customElements.define('tve-sorter', TVESorter);
