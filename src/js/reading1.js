var data = [];

$(window).on("load",function(e)
{		
	var controller = new ScrollMagic();	
	var offset = 48;
	var ui = {};
	ui.blocks = $('.block');
	ui.prev = $('.prev .container');
	ui.next = $('.next .container');		
	ui.begin = $('.begin');		

	var navigation = {

		current:-1,
		animating:false,

		updateOnScroll:function(a,b,c)
		{
			if (this.animating) return;

			this.current = a.target.number;
			this.updateNavs();
		},

		updateNavs:function()
		{
			if (this.current == -1) ui.prev.css({"opacity":0.2});
			else ui.prev.css({"opacity":1});

			if (this.current == ui.blocks.length-1) ui.next.css({"opacity":0.2});
			else ui.next.css({"opacity":1});
		},

		prevClick:function(e)
		{
			e.preventDefault();
			if (this.current >= 0) 
			{
				this.current--;
				this.showBlock();
			}
		},

		nextClick:function(e)
		{
			e.preventDefault();
			if (this.current < ui.blocks.length-1) 
			{
				this.current++;
				this.showBlock();
			}
		},

		showBlock:function()
		{
			console.log(this.current);		
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
			    this.updateNavs();	
			}
		},

		doneAnimating:function()
		{	
			this.animating = false;
		},
	};

	ui.blocks.each(function(a,b)
	{
		var body = $(b).find('.block__body');
		var meta = $(b).find('.block__meta');		
		var bh = $(body).outerHeight(); console.log(bh);		
		var mh = $(meta).outerHeight();

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

	ui.prev.on('click',_.bind(navigation.prevClick,navigation));
	ui.next.on('click',_.bind(navigation.nextClick,navigation));
	navigation.updateNavs();

	ui.begin.on('click',function(e)
	{
		e.preventDefault();
		navigation.current = 0;
		navigation.showBlock();
	});

});

$(window).on("load",function(e)
{
	var ui = {};
	ui.close = $('.close');
	ui.notes = $('.notes a');

	ui.close.on('click',function(e)
	{
		e.preventDefault();
		$(this).closest('.block__notes').removeClass('showing');
	});	

	ui.notes.on('click',function(e)
	{
		e.preventDefault();
		$(this).closest('.block').find('.block__notes').addClass('showing');
	})
});