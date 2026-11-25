/**
 * jspsych-dots-choice
 *
 * One question of the "red dots" task from Dean & Neligh (2023), "Experimental Tests of
 * Rational Inattention," Journal of Political Economy 131(12). The screen shows
 *   - a reminder of how likely each number of red dots is (the prior),
 *   - 100 dots, some red and some blue, laid out in a 10 x 10 grid, and
 *   - a table of options whose payoffs depend on how many of the dots are red. Each column
 *     of the table is a payoff-relevant state: a single number of red dots (e.g. "Pay if
 *     there are 49 red dots") or a group of numbers that every option pays the same in
 *     (e.g. "Pay if there are 50 or fewer red dots").
 * The participant picks an option with a radio button (or by clicking its row) and clicks
 * Submit. There is no time limit and no feedback.
 *
 * The dots are drawn onto a canvas and shown as one image, so the number of red dots
 * cannot be read off the page by searching it or inspecting it element by element.
 *
 * Parameters
 *   layout        String with one character per dot, row by row: 'R' red, 'B' blue.
 *                 plugin.randomLayout() makes one.
 *   reminder      HTML shown under "Remember:", describing how likely each number of red
 *                 dots is. plugin.priorHTML() makes the standard bullet list.
 *   columns       Header text of each payoff column, e.g. ['Pay if there are 49 red dots',
 *                 'Pay if there are 51 red dots']. Shown as text.
 *   options       Rows of the table: [{label: 'A', pay: [40, 0]}, ...], where pay[c] is
 *                 what the option pays in column c, in dollars. The table shows it as
 *                 "$40" (plugin.money()).
 *   pay_column    Index (0-based) of the column that applies to this question: the
 *                 payoff-relevant state that the true number of red dots belongs to.
 *   title         Optional heading shown at the top of the screen (e.g. "Example Question").
 *   button_label  Text of the submit button. Default "Submit".
 *
 * Data recorded
 *   choice   label of the chosen option
 *   payoff   what the chosen option pays in column pay_column, in dollars
 *   correct  1 if no other option pays more in column pay_column, 0 otherwise
 *   rt       milliseconds from the screen appearing to the click on Submit
 *
 * The HTML helpers (dotsImageHTML, priorHTML, tableHTML, money) are exposed on the plugin so
 * that instruction pages can show exactly what the questions look like.
 */

jsPsych.plugins['dots-choice'] = (function() {

  var plugin = {};

  /* grid geometry, in CSS pixels at full size: dots are spaced more widely across than
     down, as in the screenshots of the original interface */
  var COLS = 10;
  var PITCH_X = 56;
  var PITCH_Y = 34;
  var RADIUS = 15;
  var MIN_SCALE = 0.6;   // never shrink the grid below this to fit a short window

  /* [highlight edge, body, rim] for each colour */
  var COLOURS = {
    R: ['#ff6b6b', '#f00000', '#a80000'],
    B: ['#6b6bff', '#0000f0', '#0000a8']
  };

  var table_count = 0;   // gives each table's radio buttons their own group name

  function pct(p) {
    return (Math.round(p * 1000) / 10) + '%';
  }

  /* option labels come from the experiment's config file, so they are shown as text */
  function escapeHTML(s) {
    return String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
                    .replace(/"/g, '&quot;').replace(/'/g, '&#39;');
  }

  /* --------------------------------------------------------------------------------
     helpers
     -------------------------------------------------------------------------------- */

  /* A dollar amount as shown to participants: "$40", or "$12.50" if it has cents. */
  plugin.money = function(x) {
    return '$' + (Math.round(x) === x ? String(x) : x.toFixed(2));
  };

  /* A random arrangement of n_red red dots among n_total. */
  plugin.randomLayout = function(n_red, n_total) {
    var cells = [];
    for (var k = 0; k < n_total; k++) {
      cells.push(k < n_red ? 'R' : 'B');
    }
    return jsPsych.randomization.shuffle(cells).join('');
  };

  /* An <img> of the grid described by `layout`. */
  plugin.dotsImageHTML = function(layout) {
    var rows = Math.ceil(layout.length / COLS);
    var w = COLS * PITCH_X;
    var h = rows * PITCH_Y;
    var res = 2;   // drawn at twice the display size so it stays sharp on high-DPI screens

    var canvas = document.createElement('canvas');
    canvas.width = w * res;
    canvas.height = h * res;
    var ctx = canvas.getContext('2d');
    ctx.scale(res, res);

    for (var k = 0; k < layout.length; k++) {
      var c = COLOURS[layout.charAt(k)] || COLOURS.B;
      var cx = (k % COLS + 0.5) * PITCH_X;
      var cy = (Math.floor(k / COLS) + 0.5) * PITCH_Y;
      var g = ctx.createRadialGradient(cx - 0.2 * RADIUS, cy - 0.2 * RADIUS, 0.05 * RADIUS,
                                       cx, cy, RADIUS);
      g.addColorStop(0, '#ffffff');
      g.addColorStop(0.25, c[0]);
      g.addColorStop(0.7, c[1]);
      g.addColorStop(1, c[2]);
      ctx.beginPath();
      ctx.arc(cx, cy, RADIUS, 0, 2 * Math.PI);
      ctx.fillStyle = g;
      ctx.fill();
    }

    return '<img class="dots-grid" src="' + canvas.toDataURL('image/png') + '" width="' + w +
           '" height="' + h + '" alt="" draggable="false">';
  };

  /* The bullet-point reminder of how likely each number of red dots is. */
  plugin.priorHTML = function(states, prior) {
    var html = '<ul class="dots-prior">';
    for (var s = 0; s < states.length; s++) {
      html += '<li>With ' + pct(prior[s]) + ' probability there will be ' + states[s] +
              ' red dots</li>';
    }
    return html + '</ul>';
  };

  /* The table of options. `columns` is the header text of each payoff column.
     opts.selectable makes the radio buttons live; opts.checked is the index of an option to
     show as already chosen. */
  plugin.tableHTML = function(columns, options, opts) {
    opts = opts || {};
    var name = 'dots-choice-' + (table_count++);
    var html = '<table class="dots-options' + (opts.selectable ? ' dots-selectable' : '') +
               '"><thead><tr><th></th><th>Option</th>';
    for (var c = 0; c < columns.length; c++) {
      html += '<th>' + escapeHTML(columns[c]) + '</th>';
    }
    html += '</tr></thead><tbody>';
    for (var i = 0; i < options.length; i++) {
      html += '<tr data-option="' + i + '"><td><input type="radio" name="' + name +
              '" value="' + i + '"' + (opts.selectable ? '' : ' disabled') +
              (opts.checked === i ? ' checked' : '') + '></td><td>' + escapeHTML(options[i].label) +
              '</td>';
      for (var t = 0; t < columns.length; t++) {
        html += '<td>' + plugin.money(options[i].pay[t]) + '</td>';
      }
      html += '</tr>';
    }
    return html + '</tbody></table>';
  };

  /* Shrink the grid (down to MIN_SCALE) if the whole question does not fit in the window,
     so that on a small laptop screen the options and Submit button are still in view. */
  function fitGridToWindow(display_element) {
    var img = display_element.find('img.dots-grid');
    var overflow = $(document).height() - $(window).height();
    if (img.length === 0 || overflow <= 0) {
      return;
    }
    var w = img.width();
    var h = img.height();
    var new_h = Math.max(h * MIN_SCALE, h - overflow - 8);
    img.css({width: Math.round(w * new_h / h) + 'px', height: Math.round(new_h) + 'px'});
  }

  /* --------------------------------------------------------------------------------
     the trial
     -------------------------------------------------------------------------------- */

  plugin.trial = function(display_element, trial) {

    trial.title = (typeof trial.title === 'undefined') ? '' : trial.title;
    trial.button_label = trial.button_label || 'Submit';

    // if any trial variables are functions, this evaluates them and replaces them with
    // their output
    trial = jsPsych.pluginAPI.evaluateFunctionParameters(trial);

    display_element.html(
      '<div class="dots-page">' +
      (trial.title ? '<h2>' + trial.title + '</h2>' : '') +
      '<p class="dots-remember">Remember:</p>' +
      trial.reminder +
      '<div class="dots-grid-wrap">' + plugin.dotsImageHTML(trial.layout) + '</div>' +
      '<p>Please select from the following options:</p>' +
      plugin.tableHTML(trial.columns, trial.options, {selectable: true}) +
      '<div class="dots-submit-row"><button type="button" id="dots-submit" class="jspsych-btn" ' +
      'disabled>' + trial.button_label + '</button></div>' +
      '</div>'
    );

    // a new question always starts at the top, even if the last one was scrolled down
    window.scrollTo(0, 0);
    fitGridToWindow(display_element);

    var choice = -1;
    var rows = display_element.find('table.dots-options tbody tr');
    var submit = display_element.find('#dots-submit');

    function select(i) {
      choice = i;
      rows.removeClass('dots-selected');
      rows.eq(i).addClass('dots-selected').find('input[type="radio"]').prop('checked', true);
      submit.prop('disabled', false);
    }

    // clicking anywhere on a row picks it; the change handler covers keyboard selection
    rows.on('click', function() {
      select(parseInt($(this).attr('data-option'), 10));
    });
    rows.find('input[type="radio"]').on('change', function() {
      select(parseInt($(this).val(), 10));
    });

    submit.on('click', function() {
      if (choice < 0) {
        return;
      }
      submit.off('click').prop('disabled', true);
      var rt = (new Date()).getTime() - start_time;

      var pays = [];
      for (var i = 0; i < trial.options.length; i++) {
        pays.push(trial.options[i].pay[trial.pay_column]);
      }
      var best = Math.max.apply(null, pays);

      var trial_data = {
        choice: trial.options[choice].label,
        payoff: pays[choice],
        correct: (pays[choice] === best) ? 1 : 0,
        rt: rt
      };

      display_element.html('');
      jsPsych.finishTrial(trial_data);
    });

    var start_time = (new Date()).getTime();
  };

  return plugin;
})();
