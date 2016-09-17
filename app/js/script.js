var ToDo = ToDo || {};

ToDo.app = (function () {
    var reference = '';
    var cache = {
        'toDoContainer': document.getElementById('toDoContainer'),
        'toDoItems': document.getElementById('toDoItems')
    };
    var fn = {
        _init: function() {
            fn._events();
            fn._initFirebase();
            fn._initApp();
        },
        _events: function() {
            var target = '';
            cache['toDoContainer'].addEventListener('click', function(event) {
                target = event.target;
                if(target.getAttribute('id') === 'addToDo') {
                    if(!cache['toDoTitleElem']) {
                        cache['toDoTitleElem'] = document.getElementById('todoTitle');
                    }
                    var title = cache['toDoTitleElem'].value;
                    var toDoItem = {
                        title: title
                    };
                    fn._addItem(toDoItem);
                    fn._reset();
                }
                else if(target.classList.contains('delete-actn-btn')) {
                    var parentNode = target.parentNode.parentNode;
                    fn._removeItem(parentNode, parentNode.getAttribute('uniqueReferenceKey'));
                }
                else if(target.classList.contains('complete-actn-btn')) {
                    var parentNode = target.parentNode.parentNode;
                    var title = parentNode.childNodes[0].innerText;
                    fn._completeItem(parentNode, title, parentNode.getAttribute('uniqueReferenceKey'), parentNode.classList.contains('complete'));
                }
            });
        },
        _reset: function() {
            cache['toDoTitleElem'].value = '';
        },
        _initFirebase: function () {
            // Initialize Firebase
            var config = {
                apiKey: "",
                authDomain: "",
                databaseURL: "",
                storageBucket: "",
                messagingSenderId: ""
            };

            //TODO: Fill the above values by registering in firebase.google.com and by copy pasting the code given by them
            firebase.initializeApp(config);

            reference = firebase.database().ref('again');
        },
        _addItem: function(title) {
            reference.push({
              toDoItem: title
            });
        },
        _updateItem: function(ref, title, isComplete) {
            var item = {
                toDoItem: {
                    title: title
                }
            };
            if(!isComplete) item['toDoItem'].isComplete = !isComplete;
            reference.child(ref).update(item);
        },
        _removeItem: function(parent, ref) {
            reference.child(ref).remove();
            parent.remove();
        },
        _completeItem: function(parent, title, ref, isComplete) {
            fn._updateItem(ref, title, isComplete);
            if(!isComplete) parent.classList.add('complete');
            else parent.classList.remove('complete');
        },
        _initApp: function() {
            //fn._addItem('First ToDO! Meh');
            reference.limitToLast(12).on('child_added', function(m) {
                fn._loadList(m);
            });
            /*reference.limitToLast(12).on('child_changed', function(m) {
                fn._loadList(m);
            });*/
            reference.on('value', function(changes) {
                fn._loadList(changes);
            });
        },
        _loadList: function(data) {
            var key = data.key;
            var value = data.val();
            var item = value.toDoItem;
            if(!item) return;
            var newChild = document.createElement('div');
            newChild.classList.add('todo-item');
            newChild.classList.add('col-xs-12');
            newChild.classList.add('col-md-6');
            newChild.setAttribute('uniqueReferenceKey', key);

            var titleChild = document.createElement('span');
            titleChild.classList.add('col-xs-8');
            titleChild.classList.add('item-title');
            titleChild.innerText = item.title;

            var buttons = document.createElement('div');
            buttons.classList.add('col-xs-4');
            buttons.classList.add('action-btns');

            //var editBtn = document.createElement('span');
            var deleteBtn = document.createElement('span');
            var completeBtn = document.createElement('span');

           /* editBtn.innerText = 'Edit';
            editBtn.classList.add('edit-actn-btn');*/

            deleteBtn.innerText = 'Delete';
            deleteBtn.classList.add('delete-actn-btn');

            completeBtn.innerText = item.isComplete ? 'Resume' : 'Complete';
            completeBtn.classList.add('complete-actn-btn');

           // buttons.appendChild(editBtn);
            buttons.appendChild(deleteBtn);
           if(item.isComplete === undefined || !item.isComplete) buttons.appendChild(completeBtn);

            newChild.appendChild(titleChild)
            newChild.appendChild(buttons);

            if(item.isComplete) newChild.classList.add('complete');
            cache['toDoItems'].appendChild(newChild);
        }
    };
    var api = {
        init: function() {
            return fn._init.apply(this, arguments);
        }
    };
    return api;
})();

ToDo.app.init();