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
    
    self.items = ko.observableArray([]),
    self.selectedItem = ko.observable(null),
    self.filter = ko.observable(""),

    self.selectItem = function(item) {
        if (self.selectedItem()) {
            self.selectedItem().isSelected(false);
        }
        item.isSelected(true);
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
            return rec1 === rec2 ? 0 : rec1 < rec2 ? -1 : 1;
        });   
    };
        
    self.filteredItems = ko.computed(function() {
        var filter = self.filter().toLowerCase();
        if (!filter) {
            return self.sort(self.items());
        } else {
            var filtered = ko.utils.arrayFilter(self.items(), function(item) {
                //return ko.utils.stringStartsWith(item.name().toLowerCase(), filter);
                //return item.name().toLowerCase().indexOf(filter) !== -1;
                return Object.keys(item).some(function (key) {
                    var val = ko.isObservable(item[key]) ? item[key]() : item[key];
                    console.log(val);
                    return  val == undefined || val == null 
                                ? false 
                                : val.toString().toLowerCase().indexOf(filter) !== -1;
                });                
            });
            return self.sort(filtered);         
        }
    });    
};

ko.bindingHandlers.sortGrid = {
	init: function(element, valueAccessor, allBindingsAccessor, viewModel, bindingContext) {
		var asc = false;
		element.style.cursor = 'pointer';
		
		element.onclick = function(){
			console.log("click" + new Date());
            
            var value = valueAccessor();

            viewModel.asc(!viewModel.asc());
            viewModel.sortProp(value.prop);
        };
    }
};


