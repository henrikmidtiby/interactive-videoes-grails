import './tv-exercise-equation.js';
import './tv-exercise-multiple-choice.js';
import './tve-explanation.js';
import './tve-input-expression.js';
import './tve-matrix.js';
import './tve-inline-equation.js';
import './tve-sorter.js';

var TekVideo = TekVideo || {};
TekVideo.WidgetConfiguration = {};
function registerWidgetType(name, shortName, component, editor, properties) {
    TekVideo.WidgetConfiguration[shortName] = {
        name: name,
        shortName: shortName,
        component: component,
        editor: editor,
        properties: properties
    };
}
registerWidgetType(
    "Ligning", 
    "eq",
    "tv-exercise-equation", 
    "tv-exercise-equation-editor",
    ["content"]
);

registerWidgetType(
    "Inline ligning", 
    "eql",
    "tve-inline-equation", 
    "tv-exercise-equation-editor",
    ["content"]
);

registerWidgetType(
    "Forklaring", 
    "hint",
    "tve-explanation", 
    "tve-markdown-editor",
    ["content"]
);

registerWidgetType(
    "Spørgsmål (Matematisk udtryk)", 
    "equation-input",
    "tve-input-expression", 
    "tve-input-expression-editor",
    ["content"]
);

registerWidgetType(
    "Multiple choice",
    "multiple-choice",
    "tv-exercise-multiple-choice",
    "tv-exercise-multiple-choice-editor",
    ["selectmultiple", "choices", "randomizeorder"]
);

registerWidgetType(
    "Matrix",
    "matrix",
    "tve-matrix",
    "tve-matrix-editor",
    ["width", "height", "answer"]
);

registerWidgetType(
    "Sorter",
    "sorter",
    "tve-sorter",
    "tve-sorter-editor",
    ["columnnamea", "columnnameb", "values"]
);

export default TekVideo;
