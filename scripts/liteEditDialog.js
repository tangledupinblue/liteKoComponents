
//mainly used this:
//http://jsfiddle.net/rniemeyer/durKS/

var LiteEditDialog = function() {
    var self = this;
    self.active = ko.observable(null);
	self._editing = null;
    //doesn't do anything at the moment
    self.errorMessage = ko.observable( null );    
    self.actions = null;

    //call this to initiate editing
    self.edit = function(item, itemBlank, update, cancel) {
        self.actions = { update: update, cancel: cancel  };
        ko.utils.clone(item, itemBlank); //jQuery.extend({}, item);
        self.active(itemBlank);
        self._editing = item;         
    };
    //bind these to the buttons to execute the callbacks
    self.update = function() {
        //self.lastUpdate(self.active());
        ko.utils.clone(self.active(), self._editing);        
        self.doClick(self.actions.update || null);
    };    
    self.cancel = function() {
        self.doClick(self.actions.cancel || null);
    };
    //executes the specified actions from self.edit and closes the form
    self.doClick = function(action) {
        if (action) {
            action();  
        };
        self.active(null);
        self.actions=null;
        self._editing = null;        
    };
};

function widgetInvoke(element, callback) {
    setTimeout(function() {
        if (callback) {
            callback(Array(arguments).slice(2, arguments.length));
        }
    }, 1);
};

ko.bindingHandlers.dialog = {
        init: function(element, valueAccessor, allBindingsAccessor, viewModel) {
            console.log("init");
            var options = ko.unwrap(valueAccessor());            
            widgetInvoke( element, function(options) {
                $( element ).dialog( options );
            });
        },
		update: function( element, valueAccessor, allBindingsAccessor, viewModel ) {
			var action = ko.unwrap( allBindingsAccessor() ).with() ? "open" : "close";
            if (!(action == "close" && $(element).isOpen == false)) {
                widgetInvoke( element, function() {
                    $( element ).dialog( action );
                });
            }
		}        
};
    
ko.bindingHandlers.dialogcmd = {
        init: function(element, valueAccessor, allBindingsAccessor, viewModel) {          
            $(element).button().click(function() {
                var options = ko.utils.unwrapObservable(valueAccessor());
                $('#' + options.id).dialog(options.cmd || 'open');
            });
        }        
	
};
