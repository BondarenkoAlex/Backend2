/*
 tableAjaxProduct - jQuery plugin
 Author: Bondarenko Aleksey
 Homepage: http://alexbond.ru/
 */
(function (root, factory) {
    if (typeof define === 'function' && define.amd) {
        // AMD. Register as an anonymous module.
        define(['jquery'], factory);
    } else if (typeof exports === 'object') {
        // Node. Does not work with strict CommonJS, but
        // only CommonJS-like environments that support module.exports,
        // like Node.
        module.exports = factory(require('jquery'));
    } else {
        // Browser globals (root is window)
        root.tableAjaxProduct = factory(root.jQuery);
    }
}(this, function ($) {
    function TableAjaxProduct(options) {
        //this.album = [];
        //this.currentImageIndex = void 0;
        //this.init();
        var self = this;
        // options
        this.options = $.extend({}, this.constructor.defaults);
        // запрос категорий товара

        this.sendAjax("GET","php/categories/",null,function(data){
            self.categories = data;
            //установить атегории вв всплывающем окне
            var categorySelect = $(self.options.modalProduct).find(self.options.category);
            $.each(self.categories, function (key, value) {
                categorySelect.append(
                    "<option value=" + value.product_id + ">" + value.category + "</option>"
                );
            });
            //загрузка всех товаров
            self.sendAjax("GET","php/products/",null,function(data){
                for(var index in data) {
                    var rowTable = self.buildRowTable(data[index]);
                    self.table.append(rowTable);
                }
            });
        });
        this.init();
        //this.option(options);
    }

    TableAjaxProduct.defaults = {
        table: "#table-product tbody",
        modalProduct: "#myModal",
        id: "#inputTextId",
        name: "#inputTextName",
        category: "#inputSelectCategory",
        weight: "#inputTextWeight",

        //buttonOk: "",
        //buttonCancel: "",
        modalProductDel: "#myModalDel",
        tableRowPrefix: "table-row-",
        rowId: "id",
        rowName: "name",
        rowCategory: "category",
        rowWeight: "weight",
        rowButton: "button",
        rowButtonDel: "del",
        rowButtonEdit: "edit"
    };
    TableAjaxProduct.prototype.constant = {
        ACTION: {ADD: "add", DELETE: "delete", EDIT: "edit"}
    }
    //var options = $.extend(defaults, options);
    TableAjaxProduct.prototype.categories = []; // категории, после загрузки с сервера
    TableAjaxProduct.prototype.product = {
        id : 0,
        name : "",
        category : 0,
        weight : ""
    }

    TableAjaxProduct.prototype.productModal = {};
    TableAjaxProduct.prototype.productModalDel = {};
    TableAjaxProduct.prototype.table = undefined;
    TableAjaxProduct.prototype.modalSubmit = undefined;
    TableAjaxProduct.prototype.modalSubmitDel = undefined;
    TableAjaxProduct.prototype.modalAdd = undefined;

    TableAjaxProduct.prototype.getCategoryByIdCategory = function(idCategory) {
        var category = "";
        for(var index in this.categories) {
            if (this.categories[index].id == id )  {
                category = this.categories[index].category;
                break;
            }
        }
        return category;
    }
    TableAjaxProduct.prototype.init = function() {
        this.productModal.id = $(this.options.modalProduct).find(this.options.id);
        this.productModal.name = $(this.options.modalProduct).find(this.options.name);
        this.productModal.category = $(this.options.modalProduct).find(this.options.category);
        this.productModal.weight = $(this.options.modalProduct).find(this.options.weight);
        this.table = $(this.options.table);
        this.modalSubmit = $(this.options.modalProduct + " form");
        this.modalSubmitDel = $(this.options.modalProductDel + " form");
        //this.modalAdd = $(this.options.table + " .add");
        this.ClickAddButton();
    }

    TableAjaxProduct.prototype.createRowTable = function () {
        var table =
            $("<tr>" +
                "<td class='" + this.options.tableRowPrefix + this.options.rowId + "'></td>" +
                "<td class='" + this.options.tableRowPrefix + this.options.rowName + "'></td>" +
                "<td class='" + this.options.tableRowPrefix + this.options.rowCategory + "'></td>" +
                "<td class='" + this.options.tableRowPrefix + this.options.rowWeight + "'></td>" +
                "<td class='" + this.options.tableRowPrefix + this.options.rowButton + "'>" +
                "<button type='button' class='btn btn-danger " + this.options.tableRowPrefix + this.options.rowButtonDel + "'>Удалить</button>" + " " +
                "<button type='button' class='btn btn-primary " + this.options.tableRowPrefix + this.options.rowButtonEdit + "'>Редактировать</button>" +
                "</td>" +
                "</tr>");
        return table;
    }

    TableAjaxProduct.prototype.updateRowTable = function (rowTable, data) {
        rowTable.attr('id', this.options.tableRowPrefix + data.id);
        rowTable.find("." + this.options.tableRowPrefix + this.options.rowId).text(data.id);
        rowTable.find("." + this.options.tableRowPrefix + this.options.rowName).text(data.name);
        rowTable.find("." + this.options.tableRowPrefix + this.options.rowCategory).text(data.category);
        rowTable.find("." + this.options.tableRowPrefix + this.options.rowWeight).text(data.weight);
        return rowTable;
    }

    TableAjaxProduct.prototype.updateClickEditButton = function (rowTable, data) {
        var self = this;
        rowTable.find("." + this.options.tableRowPrefix + this.options.rowButtonEdit).unbind();
        rowTable.find("." + this.options.tableRowPrefix + this.options.rowButtonEdit).click( {data: data}, function (e) {
            self.showModal(e.data.data, self.constant.ACTION.EDIT);
        });
        return rowTable;
    }

    TableAjaxProduct.prototype.updateClickDeleteButton = function (rowTable, data) {
        var self = this;
        rowTable.find("." + this.options.tableRowPrefix + this.options.rowButtonDel).unbind();
        rowTable.find("." + this.options.tableRowPrefix + this.options.rowButtonDel).click( {data: data}, function (e) {
            self.showModal(e.data.data, self.constant.ACTION.DELETE);
        });
        return rowTable;
    }

    TableAjaxProduct.prototype.ClickAddButton = function () {
        var self = this;
        $(this.options.table + " .add").click( {data: this.product}, function (e) {
            self.showModal(e.data.data, self.constant.ACTION.ADD);
        });
    }

    TableAjaxProduct.prototype.buildRowTable = function(data){
        var rowTable = this.createRowTable();
        rowTable = this.updateRowTable(rowTable, data);
        rowTable = this.updateClickEditButton(rowTable, data);
        rowTable = this.updateClickDeleteButton(rowTable, data);
        return rowTable;
    }

    TableAjaxProduct.prototype.showModal = function (data, action) {
        if (action == this.constant.ACTION.EDIT) {
            this.updateModalProduct(data);
            $(this.options.modalProduct).modal('show'); // показываем всплывающее окно
            this.modalSubmit.unbind("submit").submit( function(e){
                var d = $(this).serialize();
                tableAjaxProduct.sendAjax("PUT","php/products/", d, tableAjaxProduct.callbackSubmitEdit );
                return false;
            });
        }
        else if (action == this.constant.ACTION.DELETE) {
            $(this.options.modalProductDel).modal('show');
            this.modalSubmitDel.unbind("submit").submit( function(e){
                var d = $.param(data);
                tableAjaxProduct.sendAjax("DELETE","php/products/", d, tableAjaxProduct.callbackSubmitDelete );
                return false;
            });
        }
        else if (action == this.constant.ACTION.ADD) {
            this.updateModalProduct(data); // пустой продукт
            $(this.options.modalProduct).modal('show'); // показываем всплывающее окно
            this.modalSubmit.unbind("submit").submit( function(e){
                var d = $(this).serialize();
                tableAjaxProduct.sendAjax("POST","php/products/", d, tableAjaxProduct.callbackSubmitAdd );
                return false;
            });
        }
    }

    TableAjaxProduct.prototype.updateModalProduct = function (data) {
        this.productModal.id.val(data.id);
        this.productModal.name.val(data.name);
        this.productModal.category.find("option:selected").removeAttr("selected");
        this.productModal.category.find("option[value=" + data.category + "]").attr("selected", "selected");
        this.productModal.weight.val(data.weight);
    }

    TableAjaxProduct.prototype.sendAjax = function (type, url, data, callback) {
        $.ajax({
            type: type,
            url: url,
            data: data
        }).done( callback );
    }
    TableAjaxProduct.prototype.callbackSubmitDelete = function(data) {
        var rowTable = $(tableAjaxProduct.options.table + " #" + tableAjaxProduct.options.tableRowPrefix + data.id );
        rowTable.remove();
        $(tableAjaxProduct.options.modalProductDel).modal('hide');
    }
    TableAjaxProduct.prototype.callbackSubmitEdit = function(data) {
        var rowTable = $(tableAjaxProduct.options.table + " #" + tableAjaxProduct.options.tableRowPrefix + data.id );
        rowTable = tableAjaxProduct.updateRowTable(rowTable,data);
        rowTable = tableAjaxProduct.updateClickEditButton(rowTable, data);
        rowTable = tableAjaxProduct.updateClickDeleteButton(rowTable, data);
        $(tableAjaxProduct.options.modalProduct).modal('hide');
    }
    TableAjaxProduct.prototype.callbackSubmitAdd = function(data) {
        var rowTable = tableAjaxProduct.buildRowTable(data);
        tableAjaxProduct.table.append(rowTable);
        $(tableAjaxProduct.options.modalProduct).modal('hide');
    }

    //TableAjaxProduct.prototype.loadProduct = function (type, url, data, callback) {
    //    this.sendAjax("GET","php/products/",null,function(data){
    //        this.categories = data;
    //    });
    //}



    return new TableAjaxProduct();
}));
