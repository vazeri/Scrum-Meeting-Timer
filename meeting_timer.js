var timers = [];
var container = "meetingTimer";

var configTimers = [
	{name: "Erick", time: 110},
	{name: "ScrumMaster", time: 110},
	{name: "Product Owner", time: 110},
	{name: "Client", time: 110}
];

var configTimersExtra = [
        {name: "<span style='font-weight: bold; color: #661100; font-style: italic'>EXTRA</span>", time: 180}
];


var TICKS_PER_SECOND = 10;
var PROGRESS_COLORS = [ "red", "yellow", "green" ];
var TIME_COLORS = [ 8 * TICKS_PER_SECOND, 20 * TICKS_PER_SECOND, Number.MAX_SAFE_INTEGER ];
var RANDOMIZE_ORDER = true;

$(document).ready(function() {

	if (RANDOMIZE_ORDER)
	{
		shuffle(configTimers);
	}
	
	if (configTimersExtra)
	{
		configTimers = configTimers.concat(configTimersExtra);
	}
	
	for (var i in configTimers)
	{
		var t = configTimers[i];
		var personTimer = new PersonTimer(i, t.name, t.time);
		timers.push(personTimer);
		personTimer.render(container);
	}

	setInterval(tickTimers, 1000 / TICKS_PER_SECOND);
});


function getPersonTimer(id)
{
	for (var i in timers)
	{
		if (timers[i].id == id)
		{
			return timers[i];
		}
	}
	return null;
}


function startTimer(button)
{
	var timer = getPersonTimer($(button).parent().parent().parent().attr('id'));
	if (timer)
	{
		timer.start();
	}
}


function pauseTimer(button)
{
	var timer = getPersonTimer($(button).parent().parent().parent().attr('id'));
	if (timer)
	{
		timer.pause();
	}
}


function resetTimer(button)
{
	var timer = getPersonTimer($(button).parent().parent().parent().attr('id'));
	if (timer)
	{
		timer.reset();
	}
}


function deleteTimer(button)
{
	var id = $(button).parent().parent().parent().attr('id');;
	for (var i in timers)
	{
		if (timers[i].id == id)
		{
			var t = timers[i];
			t.active = false;
			$("#" + t.id).remove();
			timers.splice(i, 1);
			break;
		}
	}
}

function tickTimers()
{
	timers.forEach(function(t) { t.tick() } );
}


function PersonTimer(number, name, time)
{
	this.id = "pt__" + number;
	this.name = name;
	this.time = time;
	this.remainingTime = time * TICKS_PER_SECOND;
	this.active = false;
	this.pgcolor = "green"; 
	
	this.render = function(container)
	{
		$("#" + container).append(`
			<div id="${this.id}" class="eight wide computer eight wide tablet sixteen wide mobile column">
				<div class="ui segment timer">
					<div style="float: right"><a href="#" onclick="deleteTimer(this);return false"><i class="trash icon red"></i></a></div>
					<div class="data">
						<span class="time">${this.formatRemainingTime()}</span>
						<span class="name"><div>${this.name}</div></span>
						<button class="start ui positive big labeled icon button" onclick="startTimer(this)"><i class="play icon"></i> Start</button>
						<button class="pause ui negative big labeled icon button" onclick="pauseTimer(this)" style="display:none"><i class="pause icon"></i> Pause</button>
						<button class="reset ui basic big labeled icon button" onclick="resetTimer(this)"><i class="undo icon"></i> Reset</button>
					</div>
					<div id="pg_${this.id}" class="ui progress green small pgtimer">
						<div class="bar"></div>
					</div>
				</div>
			</div>`);
		
		$("#pg_" + this.id).progress({percent: 100, precision: 10});		
	}
	
	
	this.formatRemainingTime = function()
	{
		return getMinutesSeconds( Math.round(this.remainingTime / TICKS_PER_SECOND) );
	}
	
	
	this.tick = function()
	{
		if (this.active)
		{
			this.remainingTime--;
			if (this.remainingTime < 0)
			{
				this.remainingTime = 0;
				this.active = false;
				$("#" + this.id + " .pause").prop("disabled",true);
				$("#" + this.id).removeClass("active");
			}
			
			for (var i in TIME_COLORS)
			{
				if (this.remainingTime < TIME_COLORS[i])
				{
					if (this.pgcolor != PROGRESS_COLORS[i])
					{
						this.pgcolor = PROGRESS_COLORS[i];
						$("#pg_" + this.id).removeClass(PROGRESS_COLORS.join(' ')).addClass(this.pgcolor);
					}
					break;
				}
			}
						
			var pct = 0;
			if (this.time > 0)
			{
				pct = this.remainingTime / (this.time * TICKS_PER_SECOND) * 100;
			}
			$("#pg_" + this.id).progress('set percent', pct);

			$("#" + this.id + " .time").html(this.formatRemainingTime());
		}
	}


	this.start = function()
	{
		this.active = true;
		$("#" + this.id + " .start").hide();
		$("#" + this.id + " .pause").prop("disabled",false).show();
		$("#" + this.id).addClass("active");
	}


	this.pause = function()
	{
		this.active = false;
		$("#" + this.id + " .pause").hide();
		$("#" + this.id + " .start").show();
		$("#pg_" + this.id).progress('remove active');
		$("#" + this.id).removeClass("active");
	}


	this.reset = function()
	{
		this.active = false;
		this.remainingTime = this.time * TICKS_PER_SECOND;
		$("#" + this.id + " .pause").hide();
		$("#" + this.id + " .start").show();
		$("#" + this.id + " .time").html(this.formatRemainingTime());
		$("#pg_" + this.id).progress('set success').progress('set percent', 100).progress('remove active');
		$("#" + this.id).removeClass("active");
	}

}

// Get minutes and seconds representation (00:00) of a number of seconds
function getMinutesSeconds(totalSeconds)
{
	var minutes = Math.floor(totalSeconds / 60);
	var seconds = Math.floor(totalSeconds - minutes * 60);
	return pad(minutes,2) + ":" + pad(seconds,2);
}

// Pad numbers to specified width
function pad(n, width, z)
{
	z = z || '0';
	n = n + '';
	return n.length >= width ? n : new Array(width - n.length + 1).join(z) + n;
}


function shuffle(array)
{
	var currentIndex = array.length, temporaryValue, randomIndex;

	// While there remain elements to shuffle...
	while (0 !== currentIndex) {

		// Pick a remaining element...
		randomIndex = Math.floor(Math.random() * currentIndex);
		currentIndex -= 1;

		// And swap it with the current element.
		temporaryValue = array[currentIndex];
		array[currentIndex] = array[randomIndex];
		array[randomIndex] = temporaryValue;
	}

	return array;
}