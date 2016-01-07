void function(exports,$,_,Backbone){exports.ES_NavView=Backbone.View.extend({events:{"mousedown .es-next":function(){this.rootView.slides.next().set("active",true)},"mousedown .es-prev":function(){this.rootView.slides.prev().set("active",true)}},ready:function(options){this.listenTo(this.model,"change",this.setStyle);this.listenTo(this.superView.model,"change:slides.active",this.setContent);this.delay(this.setStyle,25)},setStyle:function(){var enable=this.model.get("enable");if(!enable||this.rootView.model.get("slides").length==1)return this.$el.hide();var style=this.model.get("style");var template=ES_Nav.templates[style];this.$el.show();this.$el.attr("class","es-nav es-nav-buttons es-nav-"+style);this.$(".es-next").html(template.next);this.$(".es-prev").html(template.prev);this.setContent()},setContent:function(){var self=this;var next=this.rootView.slides.next();var prev=this.rootView.slides.prev();new Promise(function(resolve,reject){var content=self.$(".es-next div").length?self.$(".es-next div"):self.$(".es-next");var width=content.width();var height=content.height();$.getImageThumb(next.get("background.image.src"),width,height,function(src1){next.thumbSource=src1;$.getImageThumb(prev.get("background.image.src"),width,height,function(src2){prev.thumbSource=src2;resolve(src1,src2)})})}).then(function(nextSrc,prevSrc){self.$(".es-next img").attr("src",nextSrc);self.$(".es-prev img").attr("src",prevSrc)});this.$(".es-next .es-name").text(next.get("name")||"");this.$(".es-prev .es-name").text(prev.get("name")||"")}});exports.ES_PaginationView=Backbone.CollectionView.extend({modelEvents:{change:"change"},ready:function(){this.model||this.setModel(this.superView.model.get("pagination"));this.listenTo(this.collection,"add",this.reset);this.listenTo(this.collection,"sort",this.reset);this.listenTo(this.collection,"reset",this.reset);this.listenTo(this.collection,"remove",this.reset);this.delay(this.change,25)},change:function(){var enable=this.model.get("enable");if(!enable||this.rootView.model.get("slides").length==1)return this.$el.parent().hide();var style=this.style=this.model.get("style");var size=this.model.get("size")||"";var spacing=this.model.get("spacing");this.$el.parent().show().attr("class","es-nav es-nav-pagination dotstyle dotstyle-"+style);this.$("li").width(size).height(size).css("margin","0 "+spacing/2+"px")},itemView:Backbone.View.extend({events:{mousedown:function(e){this.model.set("active",true)}},modelEvents:{change:"change","change:active":"setActive"},ready:function(){this.change();this.setActive()},change:function(){this.$("a").text(this.model.get("name")||this.$el.index()+1)},setActive:function(){if(this.model.index()<this.superView.lastIndex)this.$el.attr("class","current-from-right");else this.$el.attr("class","");this.delay(function(){if(this.model.get("active"))this.$el.addClass("current");else this.$el.removeClass("current");this.superView.lastIndex=this.model.index()},25)}})});exports.ES_SelectionsView=Backbone.CollectionView.extend({itemView:exports.ES_SelectionView=Backbone.View.extend({constructor:function ES_SelectionView(){Backbone.View.apply(this,arguments)},events:{select:"select",deselect:"deselect",mousedown:"mousedown",dblclick:"dblclick",dragstart:"draggable_start",drag:"draggable_drag",dragstop:"draggable_stop",dragmultiple:"setPosition",resizestart:"resizable_start",resize:"resizable_resize",resizestop:"resizable_stop"},modelEvents:{remove:"remove","change:aspectRatio":"setAspectRatio"},bindings:[{type:"class",attr:{locked:"locked",selected:"selected",hidden:"hidden",visible:"style.visible"}},{type:"style",attr:{visibility:"style.visible",zIndex:"index",left:"style.position.x",top:"style.position.y"},parse:function(value,key){switch(key){case"visibility":return value?"visible":"hidden";case"left":case"top":return value*100+"%";default:return value}}},{selector:".selection-offset",type:"class",attr:{"ui-selected":"selected"}},{selector:".selection-offset",type:"style",attr:{left:"style.offset.x",top:"style.offset.y",width:"style.width",height:"style.height"}}],initialize:function(){this.model.selectionView=this},ready:function(){this.appView=this.superView.superView;this.itemsView=this.appView.itemsView;this.$offset=this.$(".selection-offset");this.$offset.draggable({distance:5});this.$offset.resizable({distance:5,handles:"all",aspectRatio:this.model.get("aspectRatio")})},select:function(){this.model.set("selected",true)},deselect:function(){this.model.set("selected",false)},mousedown:function(e){e.stopPropagation();if(e.metaKey||e.ctrlKey){this.model.set("selected",!this.model.get("selected"))}else if(!this.model.get("selected")){this.model.set("selected",true);_(this.model.collection.without(this.model)).invoke("set","selected",false)}$("body").trigger($.Event("mousedown",e))},dblclick:function(e){e.stopPropagation();this.model.itemView.editContent(e)},setAspectRatio:function(){var option=_.extend(this.$offset.resizable("option"),{aspectRatio:this.model.get("aspectRatio")});this.$offset.resizable("destroy");this.$offset.resizable(option)},setMinResizable:function(){this.model.itemView.setMinResizable()},getSize:function(){return _(window.getComputedStyle(this.$offset.get(0))).chain().pick("width","height").mapObject(function(value){return parseFloat(value)}).value()},saveSize:function(e,ui){var position=ui&&ui.position?ui.position:this.getPosition();var size=ui&&ui.size?ui.size:this.getSize();this.model.get("style").set({width:size.width,height:size.height,offset:{x:position.left,y:position.top}});return this},getPosition:function(){return _(window.getComputedStyle(this.$offset.get(0))).chain().pick("top","left").mapObject(function(value){return parseFloat(value)}).value()},setPosition:function(e,ui){var snap=1;var grid=this.model.root.get("grid");if(grid.get("show"))snap=parseInt(grid.get("size"))/parseInt(grid.get("gutter"));var pos=this.$el.position();if(ui.position){ui.position.left=Math.floor((ui.position.left+pos.left)/snap)*snap-pos.left;ui.position.top=Math.floor((ui.position.top+pos.top)/snap)*snap-pos.top;this.model.itemView.$offset.css(_.mapObject(ui.position,function(value){return Math.round(value)}))}if(ui.size){ui.size.width=Math.ceil(ui.size.width/snap)*snap;ui.size.height=Math.ceil(ui.size.height/snap)*snap;this.model.itemView.$offset.css(ui.size)}},getPosition:function(){},savePosition:function(e,ui){this.model.get("style").set("offset",{x:ui.position.left,y:ui.position.top})},resizable_start:function(e,ui){},resizable_resize:function(e,ui){this.setPosition(e,ui)},resizable_stop:function(e,ui){this.saveSize(e,ui)},draggable_start:function(e,ui){this.$el.siblings(".selected").find(".selection-offset").addClass("ui-draggable-dragging");this._position=ui.position},draggable_drag:function(e,ui){this.setPosition(e,ui);var moveX=ui.position.left-this._position.left;var moveY=ui.position.top-this._position.top;this._position=ui.position;this.$el.siblings(".selected").find(".selection-offset").each(function(){var pos=$(this).position();pos.left+=moveX;pos.top+=moveY;$(this).css(pos).trigger("dragmultiple",{position:pos})})},draggable_stop:function(e,ui){this.$el.siblings(".selected").find(".selection-offset").removeClass("ui-draggable-dragging");this.savePosition(e,ui)}})})}(this,jQuery,_,JSNES_Backbone);