import '@polymer/polymer/polymer-legacy.js';
import '@polymer/iron-flex-layout/iron-flex-layout-classes.js';
import '@polymer/paper-input/paper-textarea.js';
import '@polymer/paper-icon-button/paper-icon-button.js';
var MathJax = {
    skipStartupTypeset: true,
    jax: ['input/TeX', 'output/HTML-CSS']
};

var states = {start: 1, loading: 2, ready: 3, error: 4},
    state = states.start,
    typesetting = false,
    queue = [],
    src = "https://cdnjs.cloudflare.com/ajax/libs/mathjax/2.7.5/MathJax.js",
    element_prototype = Object.create(HTMLElement.prototype);

function process_queue() {
    var typesets = [], reprocesses = [];
    queue.forEach(function (elem) {
        var state = MathJax.Hub.isJax(elem);
        if (state === -1)
            typesets.push(elem);
        else if (state === 1)
            reprocesses.push(elem);
    });
    queue = [];
    if (typesets.length) {
        if (typesets.length === 1) typesets = typesets[0];
        MathJax.Hub.Queue(['Typeset', MathJax.Hub, typesets]);
    }
    if (reprocesses.length) {
        if (reprocesses.length === 1) reprocesses = reprocesses[0];
        MathJax.Hub.Queue(['Reprocess', MathJax.Hub, reprocesses]);
    }
    if (typesets.length || reprocesses.length)
        MathJax.Hub.Queue(process_queue);
    else
        typesetting = false;
}

function check_queue() {
    if (state === states.ready && !typesetting) {
        typesetting = true;
        process_queue();
    }
}

function load_library() {
    state = states.loading;
    MathJax.AuthorInit = function () {
        MathJax.Hub.Register.StartupHook('End', function () {
            state = states.ready;
            check_queue();
        });
    };
    var script = document.createElement('script');
    script.type = 'text/javascript';
    script.src = src;
    script.async = true;
    script.onerror = function () {
        console.warn("Error loading MathJax library " + src);
        state = states.error;
        queue = [];
    };
    document.head.appendChild(script);
}

element_prototype.attachedCallback = function () {
    if (this.hasAttribute('src'))
        src = this.getAttribute('src');
    if (!this.hasAttribute('lazyload'))
        load_library();
};

element_prototype.typeset = function (elem) {
    if (state === states.error)
        return;
    queue.push(elem);
    if (state === state.ready)  // lazy load
        load_library();
    else
        check_queue();
};

document.registerElement('mathjax-loader', {
    prototype: element_prototype
});

Polymer({
  _template: Polymer.html`
<style>
:host {
    display: inline;
}
</style>

<span id="root"></span>
`,

  is: 'math-tex',

  properties: {
      content: {
          type: String,
          value: "2 + 2",
          notify: true
      },
      display: {
          type: String,
          value: "inline"
      }
  },

  observers: ["update(content, display)"],

  _created: function() {
      check_handler();
      if (!handler) return;
      var script = document.createElement('script');
      this.$.root.appendChild(script);
      this._private = {jax: script};
      this.update();
  },

  attached: function() {
      this._created();
  },

  update: function () {
      if (this._private) {
          var script = this._private.jax;
          script.type = this.display === 'block' ? 'math/tex; mode=display' : 'math/tex';
          script.innerHTML = this.content;
          handler.typeset(script);
      }
  }
});

function check_handler() {
    if (handler || (handler = document.querySelector(HANDLER_TAG_NAME))) return;
    handler = document.createElement(HANDLER_TAG_NAME);
    if (!handler || typeof handler.typeset !== 'function') {
        console.warn(['no', HANDLER_TAG_NAME, 'element defined;', TAG_NAME, 'element will not work'].join(' '));
        handler = undefined;
    } else {
        document.head.appendChild(handler);
    }
}

var TAG_NAME = 'math-tex',
    HANDLER_TAG_NAME = 'mathjax-loader',
    mutation_config = {childList: true, characterData: true, attributes: true},
    handler;
