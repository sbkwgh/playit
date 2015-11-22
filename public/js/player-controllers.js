document.querySelector('#player-controller_buttons-play_pause').addEventListener('click', function(ev) {
	ev.target.parentElement.classList.toggle('play');
	ev.target.parentElement.classList.toggle('pause');
	ev.target.classList.toggle('fa-pause');
	ev.target.classList.toggle('fa-play');
})

document.body.addEventListener('mouseover', function(ev) {
	if(ev.target.classList.contains('album')) {
		ev.target.classList.toggle('album-play');
	}
});
document.body.addEventListener('mouseout', function(ev) {
	if(ev.target.classList.contains('album')) {
		ev.target.classList.toggle('album-play')
		var i = ev.target.querySelector('i');
	}
});

function Slider(el) {
	var self = this;

	this.el = {
		slider: el,
		drag: el.querySelector('.slider-drag'),
		completed: el.querySelector('.slider-completed'),
		full: el.querySelector('.slider-full'),
		songTotal: el.querySelector('.slider-song_total'),
		songCompleted: el.querySelector('.slider-song_completed')
	};
	this.coords = {};
	this.completed = {
		get px() {
			return self.coords.x - Math.round(self.el.completed.getBoundingClientRect().left);
		},
		get percent() {
			return self.el.completed.clientWidth / self.el.full.clientWidth * 100;
		}
	};
	this.songLength = {
		_: {},
		get total() {
			return self.songLength._.total;
		},
		set total(val) {
			if(!self.el.songCompleted || !self.el.songTotal) return;

			var timeStr = Math.floor(val / 60) + ':';

			if(val%60 < 10) timeStr += '0';

			timeStr += val%60;

			self.songLength._.total = val;
			self.el.songTotal.innerHTML = timeStr;
		},
		get completed() {
			return Math.round((self.songLength.total * self.completed.percent) / 100);
		},
		set completed(val) {
			if(!self.el.songCompleted || !self.el.songTotal) return;

			var percent = val / self.songLength.total;
			var totalPx = self.el.full.clientWidth;
			var timeStr = Math.floor(val / 60) + ':';

			if(val%60 < 10) timeStr += '0';
			timeStr += val%60;

			self.el.songCompleted.innerHTML = timeStr;

			self.el.drag.style.left = Math.round(totalPx * percent) + 'px';
			self.el.completed.style.width = Math.round(totalPx * percent) + 'px';
		},
		updateCompletedString: function() {
			if(!self.el.songCompleted || !self.el.songTotal) return;

			var percent = self.completed.px / self.el.full.clientWidth;
			var totalLength = self.songLength.total;
			var completedLength = Math.round(percent * totalLength);

			var timeStr = Math.floor(completedLength / 60) + ':';

			if(completedLength%60 < 10) timeStr += '0';
			timeStr += completedLength%60;

			self.el.songCompleted.innerHTML = timeStr;
		}
	};
	this.dragging = false;

	self.el.drag.addEventListener('mousedown', function(ev) {
		self.dragging = true;
		self.el.drag.classList.add('slider-drag_focus');
	})
	self.el.drag.addEventListener('dragstart', function(ev) {
		ev.preventDefault();
	})
	document.body.addEventListener('mouseup', function() {
		self.dragging = false;
		self.el.drag.classList.remove('slider-drag_focus');
	})
	document.body.addEventListener('mousemove', function(ev) {
		self.coords.x = ev.clientX;
		self.coords.y = ev.clientY;

		var completedPx = self.completed.px;
		var completedPercent = self.completed.percent;

		if(self.dragging && completedPx >= 0 && completedPx <= self.el.full.clientWidth) {
			self.el.drag.style.left = completedPx + 'px';
			self.el.completed.style.width = completedPx + 'px';

			self.songLength.updateCompletedString();
		}
	})
	self.el.full.addEventListener('mousedown', function(ev) {
		var completedPx = self.completed.px;
		var completedPercent = self.completed.percent;

		if(completedPx >= 0 && completedPx <= self.el.full.clientWidth) {
			self.el.drag.style.left = completedPx-6 + 'px';
			self.el.completed.style.width = completedPx-6 + 'px';
			self.songLength.updateCompletedString();
		}
	})
};

var slider = new Slider(document.querySelector('#player-slider'))
var volume = new Slider(document.querySelector('#player-volume-slider'))

slider.songLength.total = 320
slider.songLength.completed = 0;