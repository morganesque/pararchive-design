var data = [];

$(document).on("ready",function(e)
{		
	var blocks = $('.block');
	var current = 0;
	var prev = $('.prev .container');
	var next = $('.next .container');
	var meta = $('.block__meta');
	var prog = $('.block__meta .progress');
	var star = $('.block__meta .star');
	var notes = $('.block__meta .notes a');
	var links = $('.block__meta .links a');
	var places = $('.block__meta .places a');
	var timer;

	var controller = new ScrollMagic();		

	blocks.each(function(i,v){
		data[i] = {
			star:Math.round(Math.random()*1),
			notes:1 + Math.floor(Math.random()*5),
			links:1 + Math.floor(Math.random()*5),
			places:1 + Math.floor(Math.random()*3),
		};
	});

	function updateBox(a)
	{
		console.log(a.type,a.target.number);		
		current = a.target.number;				
		updateNavs();

		if (a.type == 'leave')				
		{
			meta.addClass('change');	
		}
		
		if (a.type == 'enter')				
		{
			// clearTimeout(timer);
			timer = setTimeout(function()
			{
				prog.text((current+1)+'/'+blocks.length);
				star.toggleClass('showing',!!data[current].star);
				notes.text(data[current].notes+' notes');
				links.text(data[current].links+' links');
				places.text(data[current].places+' places');
				meta.removeClass('change');				
			},300);
		}
	}

	blocks.each(function(i,v)
	{
		var h = $(v).height();
		var t = new ScrollScene({triggerElement:$(v), duration:h})
					.on("enter leave", updateBox)
					.addTo(controller);
		t.number = i;
	});

	var showBlock = function()
	{
		var dy = $(blocks[current]).offset().top - (24*6);

		$('html, body').animate({
	        scrollTop: dy,
	    }, 2000, 'easeOutQuint');
	}

	var updateNavs = function()
	{
		if (current == 0) prev.css({"opacity":0.2});
		else prev.css({"opacity":1});

		if (current == blocks.length-1) next.css({"opacity":0.2});
		else next.css({"opacity":1});
	}

	prev.on('click',function(e)
	{
		e.preventDefault();
		if (current > 0) 
		{
			current--;
			showBlock();
		}
	});

	next.on('click',function(e)
	{
		e.preventDefault();
		if (current < blocks.length-1) 
		{
			current++;
			showBlock();
		}
	});

	updateNavs();
});

$(window).on('load', function(){
	setTimeout(function(){
    	$('html body').scrollTop(0);
    },10);
    
});
