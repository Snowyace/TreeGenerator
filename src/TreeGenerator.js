/**
 * TreeGenerator - 2D Tree generation in JavaScript
 * Documentation in comments
 *
 * This requires a farily modern browser, at least with support for the canvas object.
 *
 * @author Alejandro U. Alvarez
 * @version 1.0
 */

/**
 * Documentation in the source code. Private methods are defined
 * as local functions, while exposed ones are members of the returned object tg.
 * @param {Object} canvas jQuery DOM object for the canvas element
 * @param {Object} opts   Settings array, see default values and explanation below
 */
var TreeGenerator = function (canvas, opts) {
	var tg = {};

	// Default settings
	var settings = {
		loss: 0.03, // Width loss per cycle
		minSleep: 10, // Min sleep time (For the animation)
		branchLoss: 0.8, // % width maintained for branches
		mainLoss: 0.8, // % width maintained after branching
		speed: 0.3, // Movement speed
		newBranch: 0.8, // Chance of not starting a new branch 
		colorful: false, // Use colors for new trees
		fastMode: true, // Fast growth mode
		fadeOut: true, // Fade slowly to black
		fadeAmount: 0.05, // How much per iteration
		autoSpawn: true, // Automatically create trees
		spawnInterval: 250, // Spawn interval in ms
		initialWidth: 10, // Initial branch width
		indicateNewBranch: false // Display a visual indicator when a new branch is born
	};

	settings = $.extend(settings, opts);

	// Initialize the canvas
	var canvas = {
		$el: canvas,
		ctx: canvas[0].getContext("2d"),
		WIDTH: canvas.width(),
		HEIGHT: canvas.height(),
		canvasMinX: canvas.offset().left,
		canvasMaxX: canvas.canvasMinX + canvas.WIDTH,
		canvasMinY: canvas.offset().top,
		canvasMaxY: canvas.canvasMinY + canvas.HEIGHT
	};

	resizeCanvas();

	var mouse = {
		s: { // Mouse speed
			x: 0,
			y: 0
		},
		p: { // Mouse position
			x: 0,
			y: 0
		}
	}

	// FPS counting system
	var fps = 0,
		now, lastUpdate = (new Date) * 1 - 1,
		fpsFilter = 100;

	// Generation intervals
	var intervals = {
		generation: null,
		fading: null
	}

	/**
	 * Start generating trees
	 * @return {void}
	 */
	tg.start = function () {
		// Start up
		branch(canvas.WIDTH / 2, canvas.HEIGHT, 0, -3, 10, 0, '#fff');
		intervals.generation = setInterval(function () {
			branch((Math.random() * 4) * canvas.WIDTH / 4, canvas.HEIGHT, 0, -Math.random() * 3, 10 * Math.random(), 30, 0, newColor());
		}, 50);
		intervals.fading = setInterval(function () {
			fade()
		}, 250);
	};

	/**
	 * Stop generating trees
	 * @return {void}
	 */
	tg.stop = function () {
		clearInterval(intervals.generation);
		clearInterval(intervals.fading);
	};

	/**
	 * Recursive function that generates the trees. This is the important part of the
	 * generator. At any given point it continues in a logical manner, creating something similar
	 * to a tree (at least using the default settings)
	 * Appropriate tweaking of the settings can produce quite interesting results.
	 * @param  {float} x           Current location, x coordinate
	 * @param  {float} y           Current location, y coordinate
	 * @param  {float} dx          Variation of the x coordinate, indicates where it will move
	 * @param  {float} dy          Variation of the y coordinate, indicates where it will move
	 * @param  {float} w           Current width
	 * @param  {float} growthRate  This branch's growth rate
	 * @param  {int} lifetime      Cycles that have already happened
	 * @param  {String} branchColor Branch color
	 * @return {void}
	 */
	function branch(x, y, dx, dy, w, growthRate, lifetime, branchColor) {
		canvas.ctx.lineWidth = w - lifetime * settings.loss;
		canvas.ctx.beginPath();
		canvas.ctx.moveTo(x, y);
		if (settings.fastMode) growthRate *= 0.5;
		// Calculate new coords
		x = x + dx;
		y = y + dy;
		// Change dir
		dx = dx + Math.sin(Math.random() + lifetime) * settings.speed;
		dy = dy + Math.cos(Math.random() + lifetime) * settings.speed;
		// Check if branches are getting too low
		if (w < 6 && y > canvas.HEIGHT - Math.random() * (0.3 * canvas.HEIGHT)) w = w * 0.8;
		// Draw the next segment of the branch
		canvas.ctx.strokeStyle = branchColor;
		canvas.ctx.lineTo(x, y);
		canvas.ctx.stroke();
		// Generate new branches
		// they should spawn after a certain lifetime has been met, although depending on the width
		if (lifetime > 5 * w + Math.random() * 100 && Math.random() > settings.newBranch) {
			setTimeout(function () {
				// Indicate the birth of a new branch
				if (settings.indicateNewBranch) {
					circle(x, y, w, 'rgba(255,0,0,0.4)');
				}
				branch(x, y, 2 * Math.sin(Math.random() + lifetime), 2 * Math.cos(Math.random() + lifetime), (w - lifetime * settings.loss) * settings.branchLoss, growthRate + Math.random() * 100, 0, branchColor);
				// When it branches, it looses a bit of width
				w *= settings.mainLoss;
			}, 2 * growthRate * Math.random() + settings.minSleep);
		}
		// Continue the branch
		if (w - lifetime * settings.loss >= 1) setTimeout(function () {
			branch(x, y, dx, dy, w, growthRate, ++lifetime, branchColor);
		}, growthRate);
	}

	// -------------------------------//
	//       Internal functions       //
	// -------------------------------//

	// Clear the canvas
	function clear() {
		ctx.clearRect(0, 0 - HEIGHT / 2, WIDTH, HEIGHT);
	}

	/**
	 * Draw a circle
	 * @param  {int} 	x     Center x coordinate
	 * @param  {int} 	y     Center y coordinate
	 * @param  {int} 	rad   Radius
	 * @param  {String} color HTML color
	 * @return {void}
	 */
	function circle(x, y, rad, color) {
		// Circulo
		ctx.lineWidth = 1;
		ctx.strokeStyle = color;
		ctx.beginPath();
		ctx.arc(x, y, rad, 0, Math.PI * 2, true);
		ctx.closePath();
		ctx.stroke();
	}

	/**
	 * Fade the canvas
	 * @return {void}
	 */
	function fade() {
		if (!settings.fadeOut) return true;
		canvas.ctx.fillStyle = "rgba(0,0,0," + settings.fadeAmount + ")";
		canvas.ctx.fillRect(0, 0, canvas.WIDTH, canvas.HEIGHT);
	}

	/**
	 * Resize the canvas to the window size
	 * @param  {Object} e Event object
	 * @return {void}
	 */
	function resizeCanvas(e) {
		canvas.WIDTH = window.innerWidth;
		canvas.HEIGHT = window.innerHeight;

		canvas.$el.attr('width', canvas.WIDTH);
		canvas.$el.attr('height', canvas.HEIGHT);
	}

	/**
	 * Return a new color, depending on the colorful setting
	 * @return {String} HTML color
	 */
	function newColor() {
		if (!settings.colorful) return '#fff';
		return '#' + Math.round(0xffffff * Math.random()).toString(16);
	}

	/**
	 * Update the mouse position data
	 * @param  {Object} e Event object
	 * @return {void}
	 */
	function mouseMove(e) {
		mouse.s.x = Math.max(Math.min(e.pageX - mouse.p.x, 40), -40);
		mouse.s.y = Math.max(Math.min(e.pageY - mouse.p.y, 40), -40);

		mouse.p.x = e.pageX - canvas.canvasMinX;
		mouse.p.y = e.pageY - canvas.canvasMinY;
	}

	/**
	 * Resize the canvas to fit the screen
	 * @return {void}
	 */
	function resizeCanvas() {
		canvas.WIDTH = window.innerWidth;
		canvas.HEIGHT = window.innerHeight;

		canvas.$el.attr('width', canvas.WIDTH);
		canvas.$el.attr('height', canvas.HEIGHT);
	}


	return tg;

};