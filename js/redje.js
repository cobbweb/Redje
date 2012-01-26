var TestContentEditorView = Backbone.View.extend({

    el: $("#test-content-editor-wrapper"),

    keyCodes: {
        ESCAPE: 27
    },

    events: {
        "keyup textarea":   "onEscape",
        "click #cancel":    "cancel",
        "click #save":      "save"
    },

    initialize: function() {
        _.bindAll(this);
        this.el.hide();

        this.textarea = this.$("textarea");
        this.tools    = $("#test-content-tools");
        this.cancelButton   = $("#cancel");
        this.saveButton     = $("#save");
    },

    show: function(text) {
        this.textarea.val(text);

        this.el.fadeIn("fast", _.bind(function() {
            this.textarea.focus();
            this.setCaretPosition(this.lastCaretPosition);
        }, this));

        $(window).one("keyup", this.onEscape);
    },

    cancel: function() {
        this._close();
    },

    save: function() {
        this._close();

        this.trigger("save", this.textarea.val());
    },

    _close: function() {
        this.lastCaretPosition = this.getCaretPosition();
        this.el.fadeOut("fast");
    },

    onEscape: function(event) {
        var keyCode = event.keyCode || event.which;

        if (keyCode == this.keyCodes.ESCAPE) {
            this.cancel();
        }
    },

    setCaretPosition: function(index) {
        var ta = this.textarea.get(0);
        console.log("Caret to ", index);

        if (ta.setSelectionRange) {
            ta.setSelectionRange(index, index);
        } else if (ta.createTextRange) {
            var range = ta.createTextRange();
            range.collapse(true);
            range.moveEnd('character', index);
            range.moveStart('character', index);
            range.select();
        }
    },

    getCaretPosition: function() {
        return this.textarea.get(0).selectionStart;
    }

});

var TestContentView = Backbone.View.extend({

    el: $("#test-content"),

    events: {
        "click":    "showEditor"
    },

    initialize: function() {
        _.bindAll(this);
        this.editor = new TestContentEditorView();
        this.editor.bind("save", this.onEditorSave);
    },

    showEditor: function() {
        this.editor.show(this.el.text());
    },

    onEditorSave: function(text) {
        this.el.text(text);
        this.trigger("onEditorSave");
    },

    getText: function() {
        return this.el.text();
    },

    highlight: function(regexp) {
        var text   = this.getText();

        try {
            var highlighted = text.replace(regexp, '<em>$&</em>');
        } catch (e) {
            console.dir(e);
        }

        this.el.html(highlighted);
    }

});

var AppView = Backbone.View.extend({

    el: $("#wrapper"),

    events: {
        "keyup #regexp":        "highlight",
        "change #tools input":  "highlight"
    },

    flags: {
        "global":           "g",
        "multiline":        "m",
        "case-insensitive": "i"
    },

    initialize: function() {
        _.bindAll(this);
        this.regexp      = this.$("#regexp");
        this.testContent = new TestContentView();
        this.flagInputs  = this.$("#tools input");

        this.testContent.bind("onEditorSave", this.highlight);
    },

    highlight: function() {
        var flags = [];

        this.flagInputs.each(_.bind(function(i, el) {
            var input = $(el);

            if (input.is(":checked")) {
                flags.push(this.flags[input.prop('id')]);
            }
        }, this));

        try {
            var regexp = new RegExp(this.regexp.val(), flags.join(','));
        } catch(e) {
            console.dir(e);
            return false;
        }

        this.testContent.highlight(regexp);
    }

});

new AppView();