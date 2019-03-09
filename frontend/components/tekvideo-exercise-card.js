import { PolymerElement, html } from '@polymer/polymer/polymer-element.js';
import '@polymer/iron-ajax/iron-ajax.js';
import '@polymer/iron-image/iron-image.js';
import '@polymer/iron-icon/iron-icon.js';
import '@polymer/iron-icons/iron-icons.js';
import '@polymer/iron-icons/communication-icons.js';
import '@polymer/paper-card/paper-card.js';
import '@polymer/paper-icon-button/paper-icon-button.js';
import '@polymer/paper-styles/color.js';
import '@polymer/paper-styles/typography.js';
import '@polymer/paper-button/paper-button.js';
import '@polymer/iron-flex-layout/iron-flex-layout-classes.js';

class TekvideoExerciseCard extends PolymerElement {
  static get template() {
    return html`
<style include="iron-flex"></style>
<style is="custom-style">
:host {
    display: block;
    width: 300px;
}
iron-image {
    width: 100%;
    height: 169px;
}
paper-card {
    width: 100%;
    height: 100%;
}

.header { @apply(--paper-font-headline); }
.light { color: var(--paper-grey-600); }
.stats {
    float: right;
    font-size: 15px;
    vertical-align: middle;
}

a {
    color: var(--google-blue-500);
    text-decoration: none;
}

a:hover {
    text-decoration: underline;
}

.reserve { color: var(--google-blue-500); }

.header-container {
    position: relative;
}

.time {
    position: absolute;
    bottom: 15px;
    right: 15px;
    color: white;
    background-color: rgba(0, 0, 0, 0.5);
    padding: 5px
}

iron-icon.star {
    --iron-icon-width: 16px;
    --iron-icon-height: 16px;
    color: var(--paper-amber-500);
}
iron-icon.star:last-of-type { color: var(--paper-grey-500); }
</style>

<paper-card>
    <div class="header-container" hidden\$="[[!_hasThumbnail(thumbnail)]]">
        <a on-click="onLink" href\$="[[url]]">
            <iron-image sizing="cover" src="https:[[thumbnail]]"></iron-image>
        </a>
    </div>
    <div class="card-content">
      <div class="header"><a on-click="onLink" href="[[url]]">[[title]]</a>
        <div class="stats light">
            <template is="dom-repeat" items="[[stats]]">
                <iron-icon icon="[[item.icon]]"></iron-icon>
                <span>[[item.content]]</span>
            </template>
        </div>
      </div>
      <p>
          <template is="dom-repeat" items="[[breadcrumbs]]">
            <a on-click="onLink" href\$="[[item.url]]">[[item.title]]</a>
            <span hidden\$="[[_isLastBreadcrumb(index)]]">・</span>
          </template>
      </p>
      <div class="layout horizontal">
        <p class="light flex">[[shortDescription]]</p>
        <div hidden\$="{{_hideFeatured(wideFormat, featuredChildren)}}" class="light" style="margin-left: 30px; margin-right: 30px">
            <p>I dette emne:</p>
            <ul>
                <template is="dom-repeat" items="[[featuredChildren]]">
                    <li><a on-click="onLink" href\$="[[item.url]]">[[item.title]]</a></li>
                </template>
            </ul>
        </div>
      </div>
    </div>
  </paper-card>
`;
  }

  static get properties() {
    return {
      title: {
          type: String
      },
      description: {
          type: String
      },
      shortDescription: {
          type: String,
          computed: "_computeShortDescription(description, maxDescriptionLength)"
      },
      breadcrumbs: {
          type: Array,
          value: []
      },
      stats: {
          type: Array,
          value: []
      },
      maxDescriptionLength: {
          type: Number,
          value: 200
      },
      wideFormat: {
          type: Boolean,
          value: false
      },
      featuredChildren: {
          type: Array,
          value: []
      },
      thumbnail: {
          type: String,
          value: "#"
      },
      url: {
          type: String,
          value: "#"
      }
    };
  }

  _hasThumbnail(thumbnail) {
      return thumbnail != null;
  }

  _computeShortDescription(description, maxDescriptionLength) {
      if (description.length > maxDescriptionLength) {
          return description.substring(0, maxDescriptionLength) + "...";
      } else {
          return description;
      }
  }

  _isLastBreadcrumb(index) {
      return index == this.breadcrumbs.length -1;
  }

  _hideFeatured(wideFormat, featuredChildren) {
      return !wideFormat || featuredChildren.length == 0;
  }

  onLink(e, i) {
      var event = new CustomEvent("line", 
                                  {link_info: e, 
                                   bubbles: true, 
                                   composed: true}); 
      self.dispatchEvent(event);
  }
}

customElements.define('tekvideo-exercise-card', TekvideoExerciseCard);
