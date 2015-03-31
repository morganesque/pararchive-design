$(document).on("ready",function(e)
{
	// fancybox is the lightbox library we're using
	// so this just enables it for the images on the page.
	$('.fancybox').fancybox({
		padding:0,
		arrows:false,
		nextClick:false,
		closeClick:true,
		helpers : {overlay : {locked:false}},
        afterLoad  : function () {
        	$('.fancybox-close').append('<span class="icon icon-close icon--circle icon--reverse"></span>');
            $.extend(this, {
                aspectRatio : false,
                type    : 'html',
                width   : '100%',
                height  : '100%',
                content : '<div class="fancybox-image" style="background-image:url(' + this.href + '); background-size:contain; background-position:50% 50%;background-repeat:no-repeat;height:100%;width:100%;" /></div>'
            });
        }
	});
});

var cutMustard = function()
{
	if ($('html').hasClass("lt-ie9")) return false;
	else return Modernizr.mq('only screen and (min-width:800px)');
};

$(window).on("load",function(e)
{		
	var controller = new ScrollMagic();	
	var offset = 62;
	var ui = {};
	ui.blocks = $('.block');
	ui.mcs = $('.media-container.image');

	// if we're going to resize all the images then we'll have to 
	// wait for that to finish before doing the superscroll thing.
	doSuperScroll = function()
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
					offset:-offset
				})
				// .on('enter', _.bind(navigation.updateOnScroll,navigation))
				.setPin(meta[0],{pushFollowers:false})
				.addTo(controller);

			o.number = a;
		});			
	};

	// just calling it now as soon as the page 
	// content is loaded only for 640 and up.
	if (cutMustard())
	{
		console.log('doing super scroll');		
		doSuperScroll();
	}

	// run through all the images and resize any landscape ones 
	// so that they look nice and neat (then do the superscroll thing).
	// var count = 0;
	// ui.mcs.each(function(i,el)
	// {
	// 	var mc = this;
	// 	if ($(el).hasClass('image'))
	// 	{
	// 		var url = $(el).find('a').attr('href');
	// 		var img = new Image();
	// 		img.onload = function()
	// 		{				
	// 			if (this.width > this.height) $(mc).css({"padding-bottom":(100*this.height/this.width)+'%'});
	// 			count++;
	// 			if (count == ui.mcs.length) doSuperScroll();
	// 		}
	// 		img.src = url;
	// 	}
	// });
});

$(document).on("ready",function(e)
{
	if (cutMustard())
	{
		$('.block').each(function(i,el)
		{
			var ui = {};
			ui.mc = $(el).find('.meta__container');
			ui.close = $(el).find('.close');
			ui.notes = $(el).find('.meta__notes.slide a');
			ui.links = $(el).find('.meta__links a');
			ui.showlink = $(el).find('.item__details .show-link');
			ui.star = $(el).find('.meta__star a');
			ui.showing = false;

			ui.notes.hide();
			ui.links.hide();

			$(window).on('load',function()
			{
				ui.notes.show();
				ui.links.show();
			});

			// enabling the slide out notes click shizzle.
			ui.notes.on('click',function(e)
			{
				e.preventDefault();
				ui.mc.removeClass('links');		
				ui.mc.toggleClass('notes');
			});

			// enabling the slide out styory links shizzle.
			ui.links.on('click',function(e)
			{
				e.preventDefault();
				ui.mc.removeClass('notes');
				ui.mc.toggleClass('links');		
			});

			// sliding those slide out panels back again fo sho!
			ui.close.on('click',function(e)
			{
				e.preventDefault();
				ui.mc.removeClass('notes');
				ui.mc.removeClass('links');
			});		

			//	the click which expands the item details below the item.
			ui.showlink.on('click',function(e)
			{
				e.preventDefault();
				$(this).closest('.item__details').toggleClass('showing');
				$(this).find('.icon').toggleClass('icon-arrow-down');
				$(this).find('.icon').toggleClass('icon-arrow-up');
			});

			// faking the fave star to be all clicked and that.
			ui.star.on("click",function(e)
			{
				e.preventDefault();
				$(this).find('.icon').toggleClass('icon-star-on');
				$(this).find('.icon').toggleClass('icon-star-off');
			});
		});	
	}
});