console.log('editors JS');

//init comments object
window.COMMENTS_OBJ = {};
window.MAIN_COMMENTS_IDS = [];
window.SOFT_REMOVED_COMMENTS = [];

// for reading match-4
$(document).on('change', '.fr-element select', function () {
    calculateSelectedAttribute($(this));
});

window.calculateSelectedAttribute = function ($select) {
    let value = $select.val();

    $select.find('option').attr('selected', false);
    $select.find('option[value=' + value + ']').attr('selected', true);

    if ($.inArray(value, LETTERS) >= 0) {
        let answerId = $('.answers .answer[data-order=' + value + ']').attr('data-id');
        $select.closest('span').attr('data-answer-id', answerId);
    }
};

// for reading editing-1
$(document).on('input', '.editor-editing .fr-element input', function () {
    let value = $(this).val();

    $(this).attr('value', value);
});

// for listening editing-1
$(document).on('input', '.editor-listening-editing-1 .fr-element input', function () {
    let value = $(this).val();

    $(this).attr('value', value);
});

$(document).on('click', '.fr-element select', function (e) {
    e.stopImmediatePropagation();
    e.stopPropagation();
});

FroalaEditor.DefineIconTemplate('material_design', '<i class="mdi mdi-[NAME]"></i>');
FroalaEditor.DefineIconTemplate('plain_text', '<span class="text">[NAME]</span>');

let editorsCountOnPage = 0;

window.enableEditors = function (isCTest= false ) {
    let allEditors = document.querySelectorAll('.editable.editor-wrapper .editor');
    editorsCountOnPage = allEditors.length;

    for (let i = 0; i < allEditors.length; ++i) {
        enableEditor(allEditors[i], i, false, isCTest);
    }
};

window.enableDisabledEditors = function () {
    let allDisabledEditors = document.querySelectorAll('.disabled.editor-wrapper .editor');
    editorsCountOnPage = allDisabledEditors.length;
    for (let i = 0; i < allDisabledEditors.length; ++i) {
        enableEditor(allDisabledEditors[i], i, true);
    }
};

window.enableEditor = function (editorInQuery, i, isDisabled, isCTest = false) {
    let editor,
        buttonsText = [
            'bold',
            'italic',
            'underline',
            'strikeThrough',
            'subscript',
            'superscript',
            'fontSize',
            'textColor',
            'backgroundColor',
            'inlineClass',
            'inlineStyle',
            'clearFormatting'
        ],
        pluginsEnabled = [
            'wordCounterPlugin',
            'align',
            'charCounter',
            'codeBeautifier',
            'codeView',
            'colors',
            'draggable',
            'entities',
            'fontSize',
            'inlineStyle',
            'inlineClass',
            'lineBreaker',
            // 'link',
            // 'linkOriginal',
            'lists',
            // 'quickInsert',
            'paragraphFormat',
            'paragraphStyle',
            'save',
            'table',
            'wordPaste',
            'comment'
        ],
        quickInsertButtons = [
            'table',
        ],
        htmlAllowedTags = [
            'a',
            'abbr',
            'address',
            'area',
            'article',
            'aside',
            'audio',
            'b',
            'base',
            'bdi',
            'bdo',
            'blockquote',
            'br',
            'button',
            'canvas',
            'caption',
            'checkbox', // added
            'cite',
            'code',
            'col',
            'colgroup',
            'comment', // added
            'datalist',
            'dd',
            'del',
            'details',
            'dfn',
            'dialog',
            'div',
            'dl',
            'dt',
            'em',
            'embed',
            'fieldset',
            'figcaption',
            'figure',
            'footer',
            'form',
            'h1',
            'h2',
            'h3',
            'h4',
            'h5',
            'h6',
            'header',
            'hgroup',
            'hr',
            'i',
            'iframe',
            'img',
            'input',
            'ins',
            'kbd',
            'keygen',
            'label',
            'legend',
            'li',
            'link',
            'main',
            'map',
            'mark',
            'menu',
            'menuitem',
            'meter',
            'nav',
            'noscript',
            'object',
            'ol',
            'optgroup',
            'option',
            'output',
            'p',
            'param',
            // 'pre',
            'progress',
            'queue',
            'rp',
            'rt',
            'ruby',
            // 's',
            'samp',
            'script',
            'style',
            'section',
            'select',
            'small',
            'source',
            'span',
            'strike',
            'strong',
            'sub',
            'summary',
            'sup',
            'table',
            'tbody',
            'td',
            'textarea',
            'tfoot',
            'th',
            'thead',
            'time',
            'title',
            'tr',
            'track',
            'u',
            'ul',
            'var',
            'video',
            'wbr'
        ],
        htmlAllowedEmptyTags = [
          'textarea',
            'a',
            'iframe',
            'object',
            'video',
            'style',
            'script',
            '.fa',
            '.fr-emoticon',
            '.fr-inner',
            '.mdi',
            'path',
            'line',
            'hr',
        ];

    if (!isCTest) {
        pluginsEnabled.push(... ['image', 'imageTUI', 'imageManager']);
        quickInsertButtons.push('image');
    }

    if (!!$(editorInQuery).attr('data-quick-insert') || true) {
        // temporary enable quickInsert for all editors
        pluginsEnabled.push('quickInsertMod');
    }

    if ($(editorInQuery).hasClass('editor-match-4')) {
        quickInsertButtons.unshift('match_4_insert_example', 'match_4_insert_question');

        let answersCount = +$('#answers').attr('data-count');

        FroalaEditor.DefineIcon('match_4_insert_question', {
            NAME: 'checkbox-blank-outline',
            template: 'material_design'
        });
        FroalaEditor.DefineIcon('match_4_insert_example', {
            NAME: 'alpha-e-box-outline',
            template: 'material_design'
        });
        FroalaEditor.RegisterQuickInsertButton('match_4_insert_question', {
            icon: 'match_4_insert_question',
            title: $(editorInQuery).hasClass('editor-za1') ? __('tasks.insert_item') : __('tasks.insert_question'),
            focus: true,
            undo: true,
            refreshAfterCallback: true,
            callback: function () {
                // first available ID
                let questionId = availableQuestionIds[0],
                    $dropdown = '<span contenteditable="false" data-answer-id="" data-id="' + questionId + '" class="fr-deletable question">' +
                        '<select class="form-control">' +
                        '<option value="-" selected>-</option>';

                for (let i = 0; i < answersCount; i++) {
                    $dropdown += '<option value="' + LETTERS[i] + '">' + LETTERS[i] + '</option>';
                }

                $dropdown += '</select>' +
                    '</span>';

                this.html.insert($dropdown);
                calculateMatch4Buttons($(editorInQuery));
            }
        });
        FroalaEditor.RegisterQuickInsertButton('match_4_insert_example', {
            icon: 'match_4_insert_example',
            title: __('tasks.insert_example'),
            focus: true,
            undo: true,
            refreshAfterCallback: true,
            callback: function () {
                // first available ID
                let exampleId = availableExampleIds[0],
                    $dropdown = '<span contenteditable="false" data-answer-id="" data-id="' + exampleId + '" class="fr-deletable example">' +
                        '<select class="form-control">' +
                        '<option value="-" selected>-</option>';

                for (let i = 0; i < answersCount; i++) {
                    $dropdown += '<option value="' + LETTERS[i] + '">' + LETTERS[i] + '</option>';
                }

                $dropdown += '</select>' +
                    '</span>';

                this.html.insert($dropdown);
                calculateMatch4Buttons($(editorInQuery));
            }
        });

        window.contentChangedCallback = function () {
            calculateMatch4Buttons($(editorInQuery));
            recalculateRightAnswersDropdowns();
            calculateAvailableQuestionIds();
        };
    }

    if ($(editorInQuery).hasClass('editor-ogf-floating')) {
        // reading ogf-3, listening ogf-1 layouts

        quickInsertButtons.unshift('ogf_floating_insert_question', 'ogf_floating_insert_example');

        FroalaEditor.DefineIcon('ogf_floating_insert_question', {
            NAME: 'checkbox-blank-outline',
            template: 'material_design'
        });
        FroalaEditor.DefineIcon('ogf_floating_insert_example', {
            NAME: 'alpha-e-box-outline',
            template: 'material_design'
        });
        FroalaEditor.RegisterQuickInsertButton('ogf_floating_insert_question', {
            icon: 'ogf_floating_insert_question',
            title: $(editorInQuery).attr('data-item-translation') === 'true' ? __('tasks.insert_gap') : __('tasks.insert_item'),
            focus: true,
            undo: true,
            refreshAfterCallback: true,
            callback: function () {
                // first available ID
                let questionId = availableQuestionIds[0],
                    $question = '<span contenteditable="false" data-id="' + questionId + '" data-right-answers="" data-typo-answers="" class="fr-deletable question">-</span>';

                this.html.insert($question);
                calculateOgfFloatingButtons($(editorInQuery));
            }
        });
        FroalaEditor.RegisterQuickInsertButton('ogf_floating_insert_example', {
            icon: 'ogf_floating_insert_example',
            title: __('tasks.insert_example'),
            focus: true,
            undo: true,
            refreshAfterCallback: true,
            callback: function () {
                // first available ID
                let exampleId = availableExampleIds[0],
                    $example = '<span contenteditable="false" data-id="' + exampleId + '" data-right-answers="" data-typo-answers="" class="fr-deletable example">-</span>';

                this.html.insert($example);
                calculateOgfFloatingButtons($(editorInQuery));
            }
        });

        window.contentChangedCallback = function () {
            calculateOgfFloatingButtons($(editorInQuery));
            calculateAvailableQuestionIds();
        };
    }

    if ($(editorInQuery).hasClass('editor-listening-editing-1')) {
        // listening editing-1 layout

        quickInsertButtons.unshift('editing_insert_word', 'editing_insert_right_answer', 'editing_insert_example_right_answer', 'editing_insert_input');

        FroalaEditor.DefineIcon('editing_insert_word', {
            NAME: 'checkbox-blank-outline',
            template: 'material_design'
        });
        FroalaEditor.DefineIcon('editing_insert_right_answer', {
            NAME: 'checkbox-marked-outline',
            template: 'material_design'
        });
        FroalaEditor.DefineIcon('editing_insert_example_right_answer', {
            NAME: 'alpha-e-box-outline',
            template: 'material_design'
        });
        FroalaEditor.DefineIcon('editing_insert_input', {
            NAME: 'minus-box-outline',
            template: 'material_design'
        });
        FroalaEditor.RegisterQuickInsertButton('editing_insert_word', {
            icon: 'editing_insert_word',
            title: __('tasks.insert_word'),
            focus: true,
            undo: true,
            refreshAfterCallback: true,
            callback: function () {
                let $word = '<input type="text" class="fr-deletable word">';

                this.html.insert($word);
            }
        });
        FroalaEditor.RegisterQuickInsertButton('editing_insert_right_answer', {
            icon: 'editing_insert_right_answer',
            title: __('tasks.insert_right_answer'),
            focus: true,
            undo: true,
            refreshAfterCallback: true,
            callback: function () {
                // first available ID
                let questionId = availableQuestionIds[0];

                let $rightAnswer = '<input type="text" class="fr-deletable right-answer" data-id="' + questionId + '">';

                this.html.insert($rightAnswer);
                // calculateEditingButtons(this.$box);
            }
        });
        FroalaEditor.RegisterQuickInsertButton('editing_insert_example_right_answer', {
            icon: 'editing_insert_example_right_answer',
            title: __('tasks.insert_example_right_answer'),
            focus: true,
            undo: true,
            refreshAfterCallback: true,
            callback: function () {
                // first available ID
                let exampleId = availableExampleIds[0];
                // $line = $(this.el).closest('.line');

                let $rightAnswer = '<input type="text" class="fr-deletable right-answer example" data-id="' + exampleId + '">';

                this.html.insert($rightAnswer);
                // calculateEditingButtons(this.$box);
            }
        });
        FroalaEditor.RegisterQuickInsertButton('editing_insert_input', {
            icon: 'editing_insert_input',
            title: __('tasks.insert_input'),
            focus: true,
            undo: true,
            refreshAfterCallback: true,
            callback: function () {
                /*// first available ID
                let questionId = availableQuestionIds[0],
                    $question = '<span contenteditable="false" data-id="' + questionId + '" data-right-answers="" data-typo-answers="" class="fr-deletable question">-</span>';

                this.html.insert($question);
                calculateOgfFloatingButtons($(editorInQuery));*/
                let $input = '<span contenteditable="false" data-right-answers="" data-typo-answers="" class="fr-deletable input">-</span>';

                this.html.insert($input);
                // calculateEditingButtons(this.$box);
            }
        });

        window.contentChangedCallback = function () {
            calculateEditingButtons($(editorInQuery), editor);
            calculateExampleClasses();
            calculateAvailableQuestionIds();
        };
    }

    if ($(editorInQuery).hasClass('editor-editing')) {
        // reading editing-1 layouts

        quickInsertButtons.unshift('editing_insert_word', 'editing_insert_right_answer', 'editing_insert_example_right_answer');

        FroalaEditor.DefineIcon('editing_insert_word', {
            NAME: 'checkbox-blank-outline',
            template: 'material_design'
        });
        FroalaEditor.DefineIcon('editing_insert_right_answer', {
            NAME: 'checkbox-marked-outline',
            template: 'material_design'
        });
        FroalaEditor.DefineIcon('editing_insert_example_right_answer', {
            NAME: 'alpha-e-box-outline',
            template: 'material_design'
        });
        FroalaEditor.RegisterQuickInsertButton('editing_insert_word', {
            icon: 'editing_insert_word',
            title: __('tasks.insert_word'),
            focus: true,
            undo: true,
            refreshAfterCallback: true,
            callback: function () {
                // first available ID
                let $word = '<input type="text" class="fr-deletable word">';

                this.html.insert($word);
            }
        });
        FroalaEditor.RegisterQuickInsertButton('editing_insert_right_answer', {
            icon: 'editing_insert_right_answer',
            title: __('tasks.insert_right_answer'),
            focus: true,
            undo: true,
            refreshAfterCallback: true,
            callback: function () {
                calculateAvailableQuestionIds();

                // first available ID
                let questionId = availableQuestionIds[0];

                let $rightAnswer = '<input type="text" class="fr-deletable right-answer" data-id="' + questionId + '">';

                this.html.insert($rightAnswer);
                // calculateEditingButtons(this.$box);
            }
        });
        FroalaEditor.RegisterQuickInsertButton('editing_insert_example_right_answer', {
            icon: 'editing_insert_example_right_answer',
            title: __('tasks.insert_example_right_answer'),
            focus: true,
            undo: true,
            refreshAfterCallback: true,
            callback: function () {
                calculateAvailableQuestionIds();

                // first available ID
                let exampleId = availableExampleIds[0];
                // $line = $(this.el).closest('.line');

                let $rightAnswer = '<input type="text" class="fr-deletable right-answer example" data-id="' + exampleId + '">';

                this.html.insert($rightAnswer);
                // calculateEditingButtons(this.$box);
            }
        });

        window.contentChangedCallback = function (editorInQuery) {
            calculateEditingButtons($(editorInQuery), editor);
            calculateAvailableQuestionIds();
            calculateLineClasses();
        };
    }

    if ($(editorInQuery).hasClass('editor-values')) {
        quickInsertButtons.unshift('insert_question');

        FroalaEditor.DefineIcon('insert_question', {
            NAME: 'checkbox-blank-outline',
            template: 'material_design'
        });
        FroalaEditor.RegisterQuickInsertButton('insert_question', {
            icon: 'insert_question',
            title: __('tasks.insert_question'),
            focus: true,
            undo: true,
            refreshAfterCallback: true,
            callback: function () {
                $('.active-editor').removeClass('active-editor');
                this.inlineClass.apply('active-editor');

                let $modal = $('.default-modal');

                $modal.find('.modal-dialog').addClass('modal-xl');
                $modal.find('.response-content').html('');
                $modal.find('.loading').removeClass('hidden');
                $modal.find('.modal-title').html(__('tasks.insert_question'));
                $modal.modal('show');

                $.ajax({
                    url: $('#predefined_questions_url').val(),
                    type: 'get',
                    headers: {
                        'X-CSRF-TOKEN': Laravel.csrfToken
                    },
                    cache: false,
                }).done(function (response) {
                    $modal.find('.loading').addClass('hidden');
                    if (response.html) {
                        $modal.find('.response-content').html(response.html).removeClass('hidden');
                        $('.predefined-questions .questions').niceScroll();

                        $(document).on('click', '.insert-question', function () {
                            insertQuestion($(this));

                            $('.default-modal').modal('hide');
                            $('.default-modal').find('.response-content').html('');
                            $('.default-modal .modal-dialog').removeClass('modal-xl');
                        })
                    } else {
                        swalError(response.status);
                    }
                }).fail(function (responseXML) {
                    swalError(responseXML.status);
                });
            }
        });
    }

    if ($(editorInQuery).hasClass('editor-listening-mixed-2')) {
        quickInsertButtons.unshift('mixed_insert_question', 'mixed_insert_checkbox');

        FroalaEditor.DefineIcon('mixed_insert_question', {
            NAME: 'checkbox-blank-outline',
            template: 'material_design'
        });
        FroalaEditor.DefineIcon('mixed_insert_checkbox', {
            NAME: 'check-box-multiple-outline',
            template: 'material_design'
        });
        FroalaEditor.RegisterQuickInsertButton('mixed_insert_question', {
            icon: 'mixed_insert_question',
            title: __('tasks.insert_open_gap_fill'),
            focus: true,
            undo: true,
            refreshAfterCallback: true,
            callback: function () {
                // first available ID
                // let questionId = availableQuestionIds[0],
                let uniqueId = Date.now(),
                    $question = '<span contenteditable="false" data-id="' + uniqueId + '" data-right-answers="" data-typo-answers="" class="fr-deletable question">-</span>';

                this.html.insert($question);
                $('.question[data-id='+uniqueId+']').next('br').remove();
            }
        });
        FroalaEditor.RegisterQuickInsertButton('mixed_insert_checkbox', {
            icon: 'mixed_insert_checkbox',
            title: __('tasks.insert_multiple_choice'),
            focus: true,
            undo: true,
            refreshAfterCallback: true,
            callback: function () {
                let uniqueId = Date.now(),
                    $checkbox = '<checkbox contenteditable="false" data-id="' + uniqueId + '" data-right-answers="[]" class="fr-deletable question-checkbox">' +
                        '<span class="mdi mdi-order-bool-ascending-variant"></span>' +
                        '</checkbox>';

                this.html.insert($checkbox);
                $('.question-checkbox[data-id='+uniqueId+']').next('br').remove();
            }
        });
    }

    if ($(editorInQuery).hasClass('editor-writing-mixed-1')) {
        quickInsertButtons.unshift('writing_mixed_insert_input_25', 'writing_mixed_insert_input_50', 'writing_mixed_insert_input_75', 'writing_mixed_insert_input_100', 'writing_mixed_insert_checkbox');

        FroalaEditor.DefineIcon('writing_mixed_insert_input_25', {
            NAME: '25%',
            template: 'plain_text'
        });
        FroalaEditor.DefineIcon('writing_mixed_insert_input_50', {
            NAME: '50%',
            template: 'plain_text'
        });
        FroalaEditor.DefineIcon('writing_mixed_insert_input_75', {
            NAME: '75%',
            template: 'plain_text'
        });
        FroalaEditor.DefineIcon('writing_mixed_insert_input_100', {
            NAME: '100%',
            template: 'plain_text'
        });
        FroalaEditor.DefineIcon('writing_mixed_insert_checkbox', {
            NAME: 'check-box-multiple-outline',
            template: 'material_design'
        });
        FroalaEditor.RegisterQuickInsertButton('writing_mixed_insert_input_25', {
            icon: 'writing_mixed_insert_input_25',
            title: __('tasks.insert_open_gap_fill_25'),
            focus: true,
            undo: true,
            refreshAfterCallback: true,
            callback: function () {
                let uniqueId = Date.now(),
                    $question = '<span contenteditable="false" data-id="' + uniqueId + '" data-right-answers="" data-typo-answers="" class="fr-deletable question question-25">-</span>';

                this.html.insert($question);
                $('.question[data-id='+uniqueId+']').next('br').remove();
            }
        });
        FroalaEditor.RegisterQuickInsertButton('writing_mixed_insert_input_50', {
            icon: 'writing_mixed_insert_input_50',
            title: __('tasks.insert_open_gap_fill_50'),
            focus: true,
            undo: true,
            refreshAfterCallback: true,
            callback: function () {
                let uniqueId = Date.now(),
                    $question = '<span contenteditable="false" data-id="' + uniqueId + '" data-right-answers="" data-typo-answers="" class="fr-deletable question question-50">-</span>';

                this.html.insert($question);
                $('.question[data-id='+uniqueId+']').next('br').remove();
            }
        });
        FroalaEditor.RegisterQuickInsertButton('writing_mixed_insert_input_75', {
            icon: 'writing_mixed_insert_input_75',
            title: __('tasks.insert_open_gap_fill_75'),
            focus: true,
            undo: true,
            refreshAfterCallback: true,
            callback: function () {
                let uniqueId = Date.now(),
                    $question = '<span contenteditable="false" data-id="' + uniqueId + '" data-right-answers="" data-typo-answers="" class="fr-deletable question question-75">-</span>';

                this.html.insert($question);
                $('.question[data-id='+uniqueId+']').next('br').remove();
            }
        });
        FroalaEditor.RegisterQuickInsertButton('writing_mixed_insert_input_100', {
            icon: 'writing_mixed_insert_input_100',
            title: __('tasks.insert_open_gap_fill_100'),
            focus: true,
            undo: true,
            refreshAfterCallback: true,
            callback: function () {
                let uniqueId = Date.now(),
                    $question = '<span contenteditable="false" data-id="' + uniqueId + '" data-right-answers="" data-typo-answers="" class="fr-deletable question question-100">-</span>';

                this.html.insert($question);
                $('.question[data-id='+uniqueId+']').next('br').remove();
            }
        });
        FroalaEditor.RegisterQuickInsertButton('writing_mixed_insert_checkbox', {
            icon: 'writing_mixed_insert_checkbox',
            title: __('tasks.insert_multiple_choice'),
            focus: true,
            undo: true,
            refreshAfterCallback: true,
            callback: function () {
                let uniqueId = Date.now(),
                    $checkbox = '<checkbox contenteditable="false" data-id="' + uniqueId + '" data-right-answers="[]" class="fr-deletable question-checkbox">' +
                        '<span class="mdi mdi-order-bool-ascending-variant"></span>' +
                        '</checkbox>';

                this.html.insert($checkbox);
                $('.question-checkbox[data-id='+uniqueId+']').next('br').remove();
            }
        });
    }

    editor = new FroalaEditor(editorInQuery, {
        htmlUntouched: true,
        enter: FroalaEditor.ENTER_DIV,
        key: "1C%kZV[IX)_SL}UJHAEFZMUJOYGYQE[\\ZJ]RAe(+%$==", // Temporary key
        attribution: false,
        toolbarInline: true,
        // toolbarVisibleWithoutSelection: !!$(editorInQuery).attr('data-toolbar'),
        pasteDeniedTags: ['comment', 'a'],
        wordCounter: !!$(editorInQuery).attr('data-word-count'),
        wordCounterLabel: __('common.words'),
        pluginsEnabled: pluginsEnabled,
        pasteDeniedAttrs: ["id"],   // this two lines added because we need to copy past close Icon
        htmlAllowedEmptyTags: htmlAllowedEmptyTags,
        quickInsertButtons: quickInsertButtons,
        toolbarButtons: {
            'moreText': {
                'buttons': buttonsText,
                'buttonsVisible': 3
            },
            'moreParagraph': {
                'buttons': ['alignLeft', 'alignCenter', 'alignRight', 'formatOLSimple', 'formatUL', 'paragraphFormat', 'paragraphStyle', 'outdent', 'indent'],
                'buttonsVisible': 3
            },
            'moreRich': {
                'buttons': ['insertImage', 'insertTable', 'insertHR', 'comment', 'cancelIcon'],
                'buttonsVisible': 5
            },
            'moreMisc': {
                'buttons': ['undo', 'redo', 'selectAll', 'html'],
                'align': 'right',
                'buttonsVisible': 2
            }
        },
        events: {
            'initialized': function () {
                console.log('initialized');
            },
            'click': function (clickEvent) {
                // Do something here.
                // this is the editor instance.
                // console.log(this);
            },
            'contentChanged': function () {
                // console.log('! EDITOR EVENT ! contentChanged');
                // @todo wrap this into the function
                if (window.location.href.indexOf('tasks') > -1 || window.location.href.indexOf('task-revisions') > -1) {
                    setTaskHasChangedToTrue();
                } else if (window.location.href.indexOf('packs') > -1 || window.location.href.indexOf('pack-revisions') > -1) {
                    setPackHasChangedToTrue();
                } else if (window.location.href.indexOf('c-tests') > -1 ) {
                    setCTestHasChangedToTrue();
                }

                if (typeof contentChangedCallback !== 'undefined') {
                    contentChangedCallback(editorInQuery);
                }

                if (typeof calculateWordsCountInAllEditors !== 'undefined') {
                    calculateWordsCountInAllEditors();
                }

                checkRemovedComments();
            },
            'codeView.update': function () {
                if (window.location.href.indexOf('tasks') > -1 || window.location.href.indexOf('task-revisions') > -1) {
                    setTaskHasChangedToTrue();
                } else if (window.location.href.indexOf('packs') > -1 || window.location.href.indexOf('pack-revisions') > -1) {
                    packHasChanged = true;
                }
            },
            'focus': function () {
                // Do something here.
                // this is the editor instance.
                // console.log(this);
            },
            'toolbar.show': function () {
                // 'this' is the editor instance.
                let self = this,
                    selectionHasCommentInside = false;

                $('.fr-toolbar .fr-command').removeClass('fr-disabled');

                $('comment').each(function (index, element) {
                    // if there is 'comment' tag in the selection
                    self.selection.get().containsNode($(element).get(0), true) ? selectionHasCommentInside = true : '';
                });

                if (selectionHasCommentInside) {
                    $('.fr-toolbar [data-cmd=comment]').addClass('fr-disabled');
                }
            },
            'keydown': function (keydownEvent) {
                if (keydownEvent.key === '\"') {
                    keydownEvent.preventDefault();
                    let currentCursorPosition = this.selection.get().focusOffset;

                    if (currentCursorPosition === 0 || $(this.selection.get().baseNode).hasClass('fr-view')) {
                        this.html.insert("„");
                    } else {
                        let previousChar = this.selection.get().baseNode.data[currentCursorPosition - 1];

                        if ($.inArray(previousChar, ['', ' ', '(', "10", String.fromCharCode(160)]) >= 0) {
                            this.html.insert("„");
                        } else {
                            this.html.insert("”");
                        }
                    }
                }
            }
        },
        requestHeaders: {
            'X-CSRF-TOKEN': Laravel.csrfToken,
            'X-Requested-With': 'XMLHttpRequest',
        },
        htmlAllowedTags: htmlAllowedTags,
        imagePaste: false,
        imageUploadURL: $('#image_upload_url').val(),
        imageUploadMethod: 'POST',
        imageUploadParam: 'image',
        imageManagerLoadURL: $('#image_manager_load_url').val(),
        imageMaxSize: 1024 * 1024 * 100,
        requestWithCORS: true,
        tableCellStyles: {
            'froala-cell-border-top': 'Border Top',
            'froala-cell-border-bottom': 'Border Bottom',
            'froala-cell-border-left': 'Border Left',
            'froala-cell-border-right': 'Border Right',
        },
        // imageManagerPageSize: 20,
        // imageManagerScrollOffset: 2,
    }, function () {
        if (i === editorsCountOnPage - 1) {
            //all editors are initialized
            calculateCommentsContainerHeight();
            calculateCommentsView();
            calculateEditorWordsWidth();

            if (typeof froalaInitCallback !== 'undefined') {
                froalaInitCallback($(editorInQuery));
            }
        }

        this.opts.placeholderText = this.$oel.attr('data-placeholder') || ' ';
        this.placeholder.refresh();

        if (!$('#task_content').length && !$('#predefined_questions_content').length && !$('#pack_content').length) {
            editor.edit.off();
            $('.main-content select').attr('disabled', true);
        }

        if (isDisabled) {
            editor.edit.off();
        }
    });
};

window.calculateCommentsContainerHeight = function () {
    console.log('function calculateCommentsContainerHeight');
    let commentsHeight = $('.paper-container .task').outerHeight();

    $('.comments-container .empty-space').css('height', commentsHeight + 'px');
    $('.comments-container').css('height', (commentsHeight + 100) + 'px');
    $('.comments-container').niceScroll({
        scrollbarid: 'comments_scrollbar'
    });
    $('.comments-container').getNiceScroll(0).doScrollTop(commentsHeight, 0);
};

/*--- adjust 'word' and 'right-answer' input fields' widths ---*/
window.calculateEditorWordsWidth = function () {
    $('.editor').find('input[type=text]').each(function (index, element) {
        let inputWidth = (this.value.length + 1) * 8;
        $(element).hasClass('example') || $(element).hasClass('right-answer') ? inputWidth += 24 : '';
        this.style.width = inputWidth + 'px';
    });
};

$(document).on('input', '.editor input[type=text]', function () {
    let inputWidth = (this.value.length + 1) * 8;
    $(this).hasClass('example') || $(this).hasClass('right-answer') ? inputWidth += 24 : '';
    this.style.width = inputWidth + 'px';
});
