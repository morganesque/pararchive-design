var data = [];

$(window).on("load",function(e)
{		
	var controller = new ScrollMagic();	
	var offset = 48;
	var ui = {};
	ui.blocks = $('.block');
	// ui.prev = $('.prev .container');
	// ui.next = $('.next .container');		
	ui.begin = $('.begin');		

	var navigation = {

		current:-1,
		animating:false,

		updateOnScroll:function(a,b,c)
		{
			if (this.animating) return;
			this.current = a.target.number;
		},

		// prevClick:function(e)
		// {
		// 	e.preventDefault();
		// 	if (this.current >= 0) 
		// 	{
		// 		this.current--;
		// 		this.showBlock();
		// 	}
		// },

		// nextClick:function(e)
		// {
		// 	e.preventDefault();
		// 	if (this.current < ui.blocks.length-1) 
		// 	{
		// 		this.current++;
		// 		this.showBlock();
		// 	}
		// },

		showBlock:function()
		{
			this.animating = true;
			if (this.current < 0)
			{
				$('html, body').stop(true,false).animate({
			        scrollTop: 0,
			    }, 2000, 'easeOutQuint',_.bind(this.doneAnimating,this));
			} else {
				var dy = $(ui.blocks[this.current]).offset().top - offset;
				$('html, body').stop(true,false).animate({
			        scrollTop: dy,
			    }, 2000, 'easeOutQuint',_.bind(this.doneAnimating,this));
			    // this.updateNavs();	
			}
		},

		doneAnimating:function()
		{	
			this.animating = false;
			// $('html, body').off("scroll mousedown DOMMouseScroll mousewheel keyup");
		},
	};


	/*
		Only for 640 and up.
	*/		
	if ( Modernizr.mq('only screen and (min-width: 40em)') )
	{
		/*
			Create the sticky side panels for each block.
		*/		
		ui.blocks.each(function(a,b)
		{
			var body = $(b).find('.block__body');
			var meta = $(b).find('.block__meta');		
			var bh = $(body).outerHeight();
			var mh = $(meta).outerHeight();

			var ww = $(window).width();

			var o = new ScrollScene({
					triggerElement: body, 
					duration: bh-mh,
					triggerHook:0,
					offset:-offset,
				})
				.on('enter', _.bind(navigation.updateOnScroll,navigation))
				.setPin(meta[0],{pushFollowers:false})
				.addTo(controller);

			o.number = a;
		});	
	}


	// ui.prev.on('click',_.bind(navigation.prevClick,navigation));
	// ui.next.on('click',_.bind(navigation.nextClick,navigation));
	// navigation.updateNavs();

	/*
		When they click the Begin button at the top of the story.
	*/		
	ui.begin.on('click',function(e)
	{
		e.preventDefault();
		navigation.current = 0;
		navigation.showBlock();
	});

	/*
		Stop animation if the user starts to do something during it.
	*/		
	$('html, body').on("scroll mousedown DOMMouseScroll mousewheel keyup",function()
	{
		$('html, body').stop();
	});

});

$(window).on("load",function(e)
{
	var ui = {};
	ui.close = $('.close');
	ui.notes = $('.meta__notes a');
	ui.links = $('.meta__links a');
	ui.showlinks = $('.item__details .show-link');
	ui.stars = $('.meta__star a');

	ui.close.on('click',function(e)
	{
		e.preventDefault();
		$(this).closest('.meta__container').removeClass('notes');
		$(this).closest('.meta__container').removeClass('links');
	});	

	ui.notes.on('click',function(e)
	{
		e.preventDefault();
		$(this).closest('.block__meta').find('.meta__container').addClass('notes');
	})

	ui.links.on('click',function(e)
	{
		e.preventDefault();
		$(this).closest('.block__meta').find('.meta__container').addClass('links');		
	})

	ui.showlinks.on('click',function(e)
	{
		e.preventDefault();
		$(this).closest('.item__details').toggleClass('showing');
		$(this).find('.icon').toggleClass('icon-arrow-down');
		$(this).find('.icon').toggleClass('icon-arrow-up');
	});

	ui.stars.on("click",function(e)
	{
		e.preventDefault();
		$(this).find('.icon').toggleClass('icon-star-on');
		$(this).find('.icon').toggleClass('icon-star-off');
	});

	$('.fancybox').fancybox({
		padding:0,
		helpers : {
	        overlay : {locked:false},
	    },
	    afterShow:function()
        {
        	var close = $('.fancybox-close');
        	console.log(close);		
        	$('.fancybox-close').append('<span class="icon icon-close icon--circle icon--reverse"></span>');
        }
	});
});