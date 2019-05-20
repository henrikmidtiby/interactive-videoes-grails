import { PolymerElement, html } from '@polymer/polymer/polymer-element.js';
import '@polymer/iron-ajax/iron-ajax.js';
import '@polymer/iron-flex-layout/iron-flex-layout-classes.js';
import '@polymer/paper-input/paper-input.js';
import '@polymer/paper-button/paper-button.js';
import '@polymer/paper-icon-button/paper-icon-button.js';
import '@polymer/iron-icon/iron-icon.js';
import '@polymer/iron-icons/iron-icons.js';
import './tekvideo-exercise-card.js';

function getAncestor(node, tagName) {
    tagName = tagName.toUpperCase();
    while (node) {
        if (node.nodeType == 1 && node.nodeName == tagName) {
            return node;
        }
        node = node.parentNode;
    }
    return null;
}

class TVBrowser extends PolymerElement {
  static get template() {
    return html`
<style include="iron-flex"></style>
<style is="custom-style">
:host {
    display: block;
}

#results > * {
    margin: 16px;
}

#results > tekvideo-exercise-card {
    width: 30%;
    max-width: 260px;
}

#results.list > tekvideo-exercise-card {
    width: 100%;
    max-width: none;
}

.control-panel > paper-icon-button {
    opacity: 0.4;
}

.control-panel > paper-icon-button.active {
    opacity: 1;
}

#pager {
    margin: 16px;
}
</style>

<iron-ajax
    auto
    url="[[itemsEndpoint]]"
    handle-as="json"
    last-response="{{items}}"
    debounce-duration="300"></iron-ajax>

<paper-input value="{{searchQuery}}" class="flex">
    <iron-icon icon="search" prefix></iron-icon>
    <paper-icon-button suffix on-click="_clearQuery" icon="clear" alt="clear" title="clear">
</paper-input>
<div class="layout horizontal control-panel">
    <paper-icon-button icon="view-module" class="active" id="gridView" on-click="setGridView"></paper-icon-button>
    <paper-icon-button icon="view-list" id="listView" on-click="setListView"></paper-icon-button>
    <div class="flex"></div>
    <span>Viser [[activeItems.length]] resultater</span>
</paper-icon-button>
</div>

<div class="layout horizontal wrap" id="results">
    <template is="dom-if" if="[[!_currentPage.length]]">
        Ingen resultater
    </template>
    <template is="dom-repeat" items="[[_currentPage]]">
        <tekvideo-exercise-card title="[[item.title]]"
                                description="[[item.description]]"
                                thumbnail="[[item.thumbnail]]"
                                breadcrumbs="[[item.breadcrumbs]]"
                                stats="[[item.stats]]"
                                featured-children="[[item.featuredChildren]]"
                                url="[[item.url]]"
                                max-description-length="[[_maxDescriptionLength]]"
                                wide-format="[[_wideFormat]]"
                                on-link="_onLink">
        </tekvideo-exercise-card>
    </template>
</div>

<div class="layout horizontal center-justified" id="pager">
    <paper-icon-button icon="chevron-left" 
                       on-click="_prevPage"
                       disabled="{{!_hasPrevPage(page)}}">
    </paper-icon-button>
    <template is="dom-repeat" items="[[_range(page, numberOfPages)]]">
        <paper-button disabled="{{_computeDisabledProperty(page, item)}}" 
                      on-click="_setPage"
                      data-index$="{{item}}">{{item}}</paper-button>
    </template>
    <paper-icon-button icon="chevron-right" 
                       on-click="_nextPage"
                       disabled="{{!_hasNextPage(page, numberOfPages)}}">
    </paper-icon-button>
</div>
`;
  }

  static get properties() {
    return {
      itemsEndpoint: {
        type: String
      },
      items: {
        type: Array
      },
      itemsPerPage: {
        type: Number,
        value: 12
      },
      page: {
        type: Number,
        value: 0
      },
      searchQuery: {
        type: String,
        value: ""
      },
      activeItems: {
        type: Array,
        computed: "_computeActiveItems(items, searchQuery)"
      },
      numberOfPages: {
        type: Number,
        computed: "_computeNumberOfPages(_pages)"
      },
      _pages: {
        type: Array,
        value: [], 
        computed: "_computePages(activeItems)"
      },
      _currentPage: {
        type: Array,
        computed: "_computeCurrentPage(_pages, page)"
      },
      _maxDescriptionLength: {
        type: Number,
        value: 200
      },
      _wideFormat: {
         type: Boolean,
         value: false
      }
    }
  }

  setGridView() {
    this.$.listView.classList.remove("active");
    this.$.gridView.classList.add("active");
    this.$.results.classList.remove("list");
    this._maxDescriptionLength = 200;
    this._wideFormat = false;
  }

  setListView() {
    this.$.listView.classList.add("active");
    this.$.gridView.classList.remove("active");
    this.$.results.classList.add("list");
    this._maxDescriptionLength = 500;
    this._wideFormat = true;
  }

  _setPage(e) {
    this.page = parseInt(e.target.getAttribute("data-index") - 1);
  }

  _nextPage() {
    if (this.page < this.numberOfPages - 1) {
      this.page++;
    }
  }

  _prevPage() {
    if (this.page > 0) {
      this.page--;
    }
  }

  _clearQuery() {
    this.searchQuery = "";
  }

  _hasPrevPage(page) {
    return page > 0;
  }

  _hasNextPage(page, numberOfPages) {
    return page < numberOfPages - 1;
  }

  _computeDisabledProperty(page, index) {
    return page === index - 1;
  }

  _range(count, numberOfPages) {
    var result = [];
    var MAX_PAGES = 6;

    var i = count - 3;
    while (result.length < MAX_PAGES && i < numberOfPages) {
      if (i >= 0 && i < numberOfPages) {
        result.push(i + 1);
      }
      i++;
    }
    return result;
  }

  _computeActiveItems(items, searchQuery) {
    return this._search(items, searchQuery);
  }

  _computeNumberOfPages(_pages) {
    return _pages.length;
  }

  _computePages(activeItems) {
    return this._chunkItems(activeItems);
  }

  _computeCurrentPage(_pages, page) {
    if (page < _pages.length && page >= 0) {
      return _pages[page];
    } else {
      return [];
    }
  }

  _search(items, searchQuery) {
    var normalizedQuery = searchQuery.trim().toLowerCase();
    if (normalizedQuery === "") {
      return items;
    }

    return items.filter(function(item) {
      if (item.title.toLowerCase().indexOf(normalizedQuery) !== -1) {
        return true;
      } else if (item.description.toLowerCase().indexOf(normalizedQuery) !== -1) {
        return true;
      } else if (item.url.toLowerCase().indexOf(normalizedQuery) !== -1) {
        return true;
      } else {
        return false;
      }
    });
  }

  _chunkItems(items) {
    return this._chunkArray(items, this.itemsPerPage);
  }

  _chunkArray(array, chunkSize) {
    var result = [];
    for (var i = 0; i < array.length; i += chunkSize) {
      result.push(array.slice(i, i + chunkSize));
    }
    return result;
  }

  _onLink(e) {
    e.stopPropagation();

    var anchor = getAncestor(e.detail.target, "a");
    var event = new CustomEvent("display", 
                                {bubbles: true, 
                                 composed: true,
				 original: e.detail, 
				 link: anchor.getAttribute("href")}); 
    self.dispatchEvent(event);
  }
}

customElements.define('tv-browser', TVBrowser);
