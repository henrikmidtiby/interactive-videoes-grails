import { PolymerElement, html } from '@polymer/polymer/polymer-element.js';
import '@polymer/iron-flex-layout/iron-flex-layout-classes.js';
import '@polymer/paper-button/paper-button.js';
import '@polymer/iron-icon/iron-icon.js';
import '@polymer/iron-icons/iron-icons.js';
import '@polymer/iron-icons/av-icons.js';
import '@polymer/paper-styles/color.js';
import '@polymer/iron-pages/iron-pages.js';
import '@polymer/paper-icon-button/paper-icon-button.js';
import './tve-renderer.js';

function storageAvailable(type) {
    try {
        var storage = window[type],
            x = '__storage_test__';
        storage.setItem(x, x);
        storage.removeItem(x);
        return true;
    }
    catch(e) {
        return false;
    }
}

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

var hasStorage = storageAvailable("localStorage");

class TVEGroupRenderer extends PolymerElement {
  static get template() {
    return html`
<style is="custom-style">
.checkmark {
    color: var(--paper-green-500);
    height: 96px;
    width: 96px;
}
.correct-text {
    font-size: 30pt;
}
.subtitle {
    font-size: 20pt;
}

.spacer {
    margin-top: 20px;
    margin-bottom: 20px;
}

.next-button {
    background-color: var(--paper-green-500);
    color: white;
}

.table {
    width: 100%;
    border-collapse: collapse;
}

table, th, td {
    border: 1px solid black;
}

th, td {
    padding: 10px;
    text-align: left;
}
</style>
<style include="iron-flex"></style>

<paper-icon-button icon="toc" on-click="showExercises"></paper-icon-button>
<iron-pages selected="{{_selectedPage}}">
    <tve-renderer id="renderer"></tve-renderer>
    <div>
        <div class="layout vertical center spacer">
            <iron-icon class="checkmark" icon="check"></iron-icon>
            <span class="correct-text">Korrekt!</span>
            <template is="dom-if" if="{{_hasCompletedAll(currentExercise)}}">
                <span class="subtitle">
                    Du har nu løst alle opgaverne der er under dette emne!
                </span>
            </template>
            
        </div>

        <div class="layout horizontal center-justified">
            <template is="dom-if" if="{{_hasCompletedAll(currentExercise)}}">
                <paper-button on-click="backToMenu">
                <iron-icon icon="toc"></iron-icon>
                Til opgave oversigt
                </paper-button>
            </template>
            <paper-button on-click="stopCountdown">
                <iron-icon icon="av:stop"></iron-icon>
                Til opgaven
            </paper-button>

            <paper-button raised="" class="next-button" on-click="displayNext">
                <iron-icon icon="av:skip-next"></iron-icon>
                Fortsætter om {{_countdown}} sek
            </paper-button>
        </div>
    </div>
    <div>
        <h2>Delopgaver tilgængelige</h2>
        <table class="table">
            <thead>
                <tr>
                    <th>Navn</th>
                    <th>Status</th>
                    <th>Muligheder</th>
                </tr>
            </thead>
            <tbody>
                <template is="dom-repeat" items="{{exercisePool}}">
                    <tr>
                        <td>{{item.name}}</td>
                        <td><iron-icon icon="{{_computeCompletionIcon(item)}}"></iron-icon></td>
                        <td><paper-icon-button icon="create" on-click="_goToItem"></paper-icon-button></td>
                    </tr>
                </template>
            </tbody>
        </table>
            
    </div>
</iron-pages>
`;
  }

  static get properties() {
    return {
      exercisePool: {
          type: Array,
          value: [],
          observer: '_observePool'
      },
      completed: {
          type: Array,
          value: [],
          observer: '_observeCompleted'
      },
      name: {
          type: String,
          value: ""
      },
      identifier: {
          type: Number,
          value: 0
      },
      _countdown: {
          type: Number,
          value: 0
      },
      currentExercise: {
          type: Number,
          value: 0
      },
      _cachedLocalStatus: {
          type: Object,
          value: null
      },
      _assignmentOrder: {
          type: Array,
          value: null
      }
    };
  }

  act_on_grade_event(e) {
    console.log("act_on_grade_event");
    console.log(e);
    console.log(this);
    var data = e.detail;

    if (data.passes) {
      var exercise = this._assignmentOrder[this.currentExercise];
      this.markAsCorrect([exercise.identifier]);
      renderer.isInteractive = false;
      this._selectedPage = 1;
      this._countDownForNext(3);
    }
  }

  ready() {
      super.ready();
      window.addEventListener("grade", this.act_on_grade_event.bind(this));

      if (this.exercisePool && this.exercisePool.length > 0) {
          this.displayNext();
      }
  }

  _countDownForNext(time) {
      var self = this;
      self._countdown = time;
      self._currentTimer = setTimeout(function() {
          if (self._countdown > 1) {
              self._countDownForNext(time - 1);
          } else {
              self.displayNext();
          }
      }, 1000);
  }

  _goToItem(e) {
      var identifier = e.model.item.identifier;
      var idx = this._assignmentOrder.map(function(e) { 
          return e.identifier; 
      }).indexOf(identifier);

      if (idx !== -1) {
          this.display(idx);
      }
  }

  stopCountdown() {
      clearTimeout(this._currentTimer);
      this._selectedPage = 0;
      this.$.renderer.isInteractive = true;
  }

  displayNext() {
      this.stopCountdown();
      // Hack for ensuring that exercises are shown in firefox. 
      // For some (unknown) reason, the value of this.currentExercise
      // is initialised to NaN, instead of 0.
      if(isNaN(this.currentExercise))
      {
          this.currentExercise = 0;
      }
      var next = (this.currentExercise + 1) % this.exercisePool.length;
      this.display(next);
  }

  backToMenu() {
      var event = new CustomEvent("backToMenu", 
                                  {bubbles: true, 
                                   composed: true});
      self.dispatchEvent(event);
  }

  markAsCorrect(ids) {
      var localStatus = this._getLocalStatus();
      for (var i = 0; i < ids.length; i++) {
          var id = ids[i];
          localStatus[id] = true;
      }
      this._cachedLocalStatus = localStatus;
      localStorage.completedExercises = JSON.stringify(localStatus);
  }

  _getLocalStatus() {
      if (this._cachedLocalStatus != null) {
          return this._cachedLocalStatus;
      }

      var result = {};
      if (hasStorage) {
          var localStatusString = localStorage.completedExercises || "{}";
          result = JSON.parse(localStatusString);
      }

      this._cachedLocalStatus = result;
      return result;
  }

  display(exerciseIdx) {
      this.currentExercise = exerciseIdx;
      this._selectedPage = 0;
      this.$.renderer.isInteractive = true;

      var exercise = this._assignmentOrder[exerciseIdx];
      var renderer = this.$.renderer;
      if (exercise) {
          var event = new CustomEvent("display", 
                                      {exercise: exercise, 
                                       bubbles: true, 
                                       composed: true}); 
          self.dispatchEvent(event);
          renderer.content = exercise.document;
          renderer.widgets = exercise.widgets;
          renderer.identifier = exercise.identifier;
      }
  }

  showExercises() {
      this._selectedPage = 2;
  }

  _computeCompletionIcon(item) {
      var status = this._getLocalStatus();
      return item.identifier in status ? "check" : "close";
  }

  _observePool() {
      if (this.exercisePool.length > 0) {
          this._assignmentOrder = this._createAssignmentOrder(this.exercisePool);
          this.displayNext();
      }
  }

  _observeCompleted(completed) {
      this.markAsCorrect(completed);
  }

  _createAssignmentOrder(pool) {
      var status = this._getLocalStatus();
      var complete = [];
      var incomplete = [];
      for (var i = 0; i < pool.length; i++) {
          var item = pool[i];
          if (item.identifier in status) {
              complete.push(item);
          } else {
              incomplete.push(item);
          }
      }
      shuffle(complete);
      shuffle(incomplete);
      this._incompleteIndex = incomplete.length;
      return incomplete.concat(complete);
  }

  _hasCompletedAll() {
      var result = this.currentExercise >= this._incompleteIndex || 
          this.currentExercise == this.exercisePool.length - 1;
      if (result) {
          this._incompleteIndex = 0;
      }
      return result;
  }
}
  
customElements.define('tve-group-renderer', TVEGroupRenderer);
