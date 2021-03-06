//Simple grid with only key functionality:
// filtering, sorting, selecting (single)
//based very much on this:
//http://jsfiddle.net/rniemeyer/vdcUA/
// and for sorting, this:
//http://jsfiddle.net/brendonparker/6S85t/
// and for selecting:
//https://jsfiddle.net/johnpapa/6FCEe/


var LiteKoGrid = function() {
    var self = this;
    self.asc = ko.observable(false);
    self.sortProp = ko.observable("");   
    self.updating = false;
    
    self._items = ko.observableArray([]),
    self.selectedItem = ko.observable(null),
    self.filter = ko.observable(""),

    self.makeSelectable = function(item) {
        if (item.isSelected == undefined) { item.isSelected = ko.observable(false) }
        return item; 
    }

    self.setItems = function(arr) {
        //expecting items with observable props as per example as an array...
        //we check to make sure that they have a prop "isSelected" - and add if not
        arr.forEach((i) => { if (i.isSelected == undefined) 
            { i.isSelected = ko.observable(false) } 
        });
        self._items(arr);
    };

    self.pushItem = function(item) {
        self._items.push(self.makeSelectable(item));
    };

    self.removeItem = function(item) {
        self._items.remove(item);
    };

    self.selectItem = function(item) {
        if (self.selectedItem()) {
            self.selectedItem().isSelected(false);
        }
        if (item) {
            item.isSelected(true);
        }
        self.selectedItem(item); 
    };

    self.sort = function(items) {
        return items.sort(function(left, right){
            var rec1 = left;
            var rec2 = right;
                      
            if(!self.asc()) {
                rec1 = right;
                rec2 = left;
            }
            var props = self.sortProp().split('.');
            for(var i in props){                
                var propName = props[i];
                if (typeof propName == "string" && propName.length > 0) {
                    var parenIndex = propName.indexOf('()');
                    if(parenIndex > 0) {
                        //functions
                        propName = propName.substring(0, parenIndex);
                        rec1 = rec1[propName]();
                        rec2 = rec2[propName]();
                    } else if (ko.isObservable(rec1[propName])) {
                        //ko observables posing as properties
                        rec1 = rec1[propName]();
                        rec2 = rec2[propName]();
                    }
                    else {
                        //properties
                        rec1 = rec1[propName];
                        rec2 = rec2[propName];
                    }
                }
            } 
            return rec1 === rec2 ? 0 : rec1 < rec2 ? -1 : 1;
        });   
    };
        
    self.filteredItems = ko.computed(function() {
        var filter = self.filter().toLowerCase();
        if (!filter) {
            return self.sort(self._items());
        } else {
            var filtered = ko.utils.arrayFilter(self._items(), function(item) {
                //return ko.utils.stringStartsWith(item.name().toLowerCase(), filter);
                //return item.name().toLowerCase().indexOf(filter) !== -1;
                return Object.keys(item).some(function (key) {
                    var val = ko.isObservable(item[key]) ? item[key]() : item[key];
                    //console.log(val);
                    return  val == undefined || val == null 
                                ? false 
                                : val.toString().toLowerCase().indexOf(filter) !== -1;
                });                
            });
            //return self.sortProp() ? self.sort(filtered) : filters;
            return self.sort(filtered);         
        }
    });    
};

ko.bindingHandlers.sortGrid = {
	init: function(element, valueAccessor, allBindingsAccessor, viewModel, bindingContext) {
		var asc = false;
		element.style.cursor = 'pointer';		
		element.onclick = function(){            
            var value = valueAccessor();
            viewModel.asc(!viewModel.asc());
            viewModel.sortProp(value.prop);
        };
    }
};

//http://stackoverflow.com/questions/10535548/best-way-to-clone-observables
// extends observable objects intelligently to clone edited items
ko.utils.extendObservable = function ( target, source ) {
    var prop, srcVal, tgtProp, srcProp,
        isObservable = false;

    for ( prop in source ) {

        if ( !source.hasOwnProperty( prop ) ) {
            continue;
        }

        if ( ko.isWriteableObservable( source[prop] ) ) {
            isObservable = true;
            srcVal = source[prop]();
        } else if ( typeof ( source[prop] ) !== 'function' ) {
            srcVal = source[prop];
        }

        if ( ko.isWriteableObservable( target[prop] ) ) {
            target[prop]( srcVal );
        } else if ( target[prop] === null || target[prop] === undefined ) {

            target[prop] = isObservable ? ko.observable( srcVal ) : srcVal;

        } else if ( typeof ( target[prop] ) !== 'function' ) {
            target[prop] = srcVal;
        }

        isObservable = false;
    }
};

// then finally the clone function
ko.utils.clone = function(obj, emptyObj){
    var json = ko.toJSON(obj);
    var js = JSON.parse(json);
    return ko.utils.extendObservable(emptyObj, js);
};


