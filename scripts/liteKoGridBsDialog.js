//requires ko, jquery and bootstrap
//require likeKoGrid

//override the following callbacks on add / edit / delete - eg.
// <instance>.onInsertItem = function(item, callbackOnSuccess) { 
//    console.log("doing something with" + item);   
//    callbackOnSuccess(); 
//};

//see liteGridBootstrapDialog.html for more examples

//set id of bootstrap dialog to "editItemDialog"

var LiteKoGridBsDialog = function() {
    var self = this;
    LiteKoGrid.call(self);

    //override these callbacks to eg. post to server
    self.onInsertItem = (item, callbackOnSuccess) => { callbackOnSuccess() };
    self.onUpdateItem = (item, callbackOnSuccess) => { callbackOnSuccess() };
    self.onDeleteItem = (item, callbackOnSuccess) => { callbackOnSuccess() };

    self.dialogs = {
        NONE:       { action: "None", id: "" },
        ADDING:     { action: "Add", id: "#editItemDialog",
                        onOkayCall: () => {
                            var funcSuccess = () => {
                                self.pushItem(self.dialogItem());
                                self.selectItem(self.dialogItem());
                            }; 
                            self.onInsertItem(self.dialogItem(), funcSuccess);            
                        }
                     },
        EDITING:    { action: "Edit", id: "#editItemDialog",
                        onOkayCall: () => {
                            var selected = self.selectedItem();
                            ko.utils.clone(self.dialogItem(), selected);
                            var funcSuccess = () => self.selectItem(selected); 
                            self.onUpdateItem(selected, funcSuccess);
                        }
                     },
        DELETING:   { action: "Delete", id: "#deleteItemDialog",
                        onOkayCall: () => {
                            var item = self.dialogItem();
                            var funcSuccess = () => self.removeItem(item);
                            self.onDeleteItem(item, funcSuccess);
                        }
                    }
    };

    self.dialogItem = ko.observable(null);
    self.dialogMode = ko.observable(self.dialogs.NONE);

    self.showDialog = function(item, dialog) {
        self.dialogItem(item);
        self.dialogMode(dialog);
        $(dialog.id).modal();        
    };

    self.addItem = function() {
        var newItem = new Item({});
        self.selectItem(null);
        self.showDialog(newItem, self.dialogs.ADDING);
    };

    self.editItem = function(item) {
        var itemClone = new Item({});
        ko.utils.clone(item, itemClone);
        self.showDialog(itemClone, self.dialogs.EDITING);
    };

    self.deleteItem = function(item) {
        self.showDialog(item, self.dialogs.DELETING);        
    };
  
    self.dialogOkay = function() {
        self.dialogMode().onOkayCall();
        self.dialogMode(self.dialogs.NONE);
        self.dialogItem(null);
    };
}
