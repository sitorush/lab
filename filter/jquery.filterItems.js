;(function($){
	
	/**
	 * 
	 * @example
	 * $('#content-parent').filterItems('#list a', { 
	 * 		itemIndex : 0 
	 * });
	 * 
	 * @author Tom Marulak
	 * @created 25/06/2012
	 * @version 0.1
	 */

	var FilterItems = function(parent, elms, options){
	
		this.settings = $.extend({
			attribute : 'data-category', 				// this attribute will be the item, toggler anchor value will match this value
			pagination : true,  						// if false, no paging will be created
			limit : 5,									// maximum number of item in 1 page
			pageContainerId : '#faq-page-container',
			pageBtnClass : 'faq-paging',
			faqHeadingId : 'faq-heading',
			itemIndex : 0								// default index of toggler
		}, options);
		
		this.parentContent = parent;
		this.togglers = $(elms);
		this.items = $('[' + this.settings.attribute + ']');
		
		this.itemsInCurrentCategory;
		this.pageIndex = 0;
		
		this.keywords = this.retrieveKeywords();

		$(elms).bind('click', $.proxy(this.clickHandler, this));
		
		$($(elms)[this.settings.itemIndex]).trigger('click');

	}
	
	FilterItems.prototype = {
			
		clickHandler : function(event){
			var str = $(event.target).attr('href').slice(1);
	
			//TODO : make this more dynamic. no ul hardcoded, class name hardcoded
			$(event.target).parents('ul').find('a').removeClass('active');
			$(event.target).addClass('active')
			
			this.index = this.togglers.index(event.target);
			this.pageIndex = 0;
			
			this.doFilter(str);
			
			event.preventDefault();
		},
		
		/**
		 * 
		 */
		doFilter : function(string){
	
			var _this = this,
				search = string
	
			this.itemsInCurrentCategory = $.grep(this.items, function(el){
				if($(el).attr(_this.settings.attribute).match(search, 'g') !== null || $.inArray(search, _this.keywords) === -1) {	
					return el;
				}
			});
			
			this.items.hide();
			this.createHeading();
	
			if(this.settings.pagination === true && this.itemsInCurrentCategory.length > this.settings.limit){
				this.showVisibleItems().createPagination();
			} else {
				$(this.itemsInCurrentCategory).show();
				this.removePagination();
			}
			
		},
		
		/**
		 * Create a heading <h3 /> text based on toggler title attribute 
		 */
		createHeading : function(){
			var $heading = $('#' + this.settings.faqHeadingId),
				headingText = $($(this.togglers).get(this.index)).attr('title');
	
			if($heading.length){
				$heading.text(headingText);
			} else {
				var $heading = $(document.createElement('h3')).text(headingText).attr('id', this.settings.faqHeadingId);
				$(this.parentContent).prepend($heading);
			}
		},
		
		/**
		 * 
		 */
		createPagination : function(){
			var a = document.createElement('a'),
				list = [],
				$container = $(document.createElement('div')).attr('id', this.settings.pageContainerId.substring(1)),
				$pageContainer = $(this.settings.pageContainerId),
				active,
				i;
	
			for(i = 0; i < (this.itemsInCurrentCategory.length % this.settings.limit + 1); i++){
				active = i == 0 ? ' active' : '';
				list.push('<a href="#" data-paging-index= "' + i + '" class="' + this.settings.pageBtnClass + active + '">'+ (i+1) +'</a>');
			}
	
			if($pageContainer.length){
				$pageContainer.html("").prepend(list.join(""))
			} else {
				$(this.parentContent).prepend(
					$container.prepend(list.join(""))
				);
			}
	
			$('.' + this.settings.pageBtnClass).bind('click', $.proxy(this.attachPageToggler, this));
	
		},
		
		/**
		 * Show visible items in the current category
		 * @return Object
		 */
		showVisibleItems : function(){
			var length = this.itemsInCurrentCategory.length,
				visibleItems = this.itemsInCurrentCategory.slice(this.pageIndex * this.settings.limit, this.pageIndex * this.settings.limit + 5);
	
			$(this.itemsInCurrentCategory).hide();
			$(visibleItems).fadeIn('fast');
			
			return this;
		},
		
		/**
		 * Remove/empty paging items 
		 * @return Object
		 */
		removePagination : function(){
			var $container = $(this.settings.pageContainerId);
			$container.length > 0 && $container.html("");
			return this;
		},
		
		/**
		 * @return Object
		 */
		attachPageToggler : function(event){
			this.pageIndex = $(event.target).attr('data-paging-index');
			$('.'+this.settings.pageBtnClass).removeClass('active');
			$(event.target).addClass('active');
			
			this.showVisibleItems();
			event.preventDefault();
			
			return this;
		},
		
		/**
		 * Retrieves list of keyword based on attribute in item element 
		 * @return Array keywords
		 */
		retrieveKeywords : function(){
			var keywords = [],
				_this = this;
			
			$.each(this.items, function(i, el){
				keywords.push($(el).attr(_this.settings.attribute).split(" "));
			});
			
			keywords = $.map(keywords, function(n){ return n; });
			keywords = $.unique(keywords);
			
			return keywords;
		},
	}
	/**
	 * Reset constructor 
	 */
	FilterItems.prototype.constructor = FilterItems;
	
	$.fn.filterItems = function(elms, options){
		return this.each(function(i){
			new FilterItems(this, elms, options);
		});
	}
		
})(jQuery);