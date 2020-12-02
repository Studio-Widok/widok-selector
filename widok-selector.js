/**
 * singleElement '.select-option'
 *
 * @param {function} settings.onSelect
 */

const $ = require('cash-dom');
require('widok');

class Select {
  constructor(obj, id, settings) {
    this.obj = $(obj);
    this.wrap = this.obj.parent();
    this.settings = settings;
    this.identifier = this.obj.attr('id');
    this.id = id;
    this.expanded = false;
    this.overlay = $(document.createElement('div')).addClass('select-overlay');
    this.overlay.on('click', event => {
      this.expand();
    });
    this.obj.append(this.overlay);
    this.adjuster = $(document.createElement('div')).addClass(
      'select-adjuster'
    );
    this.obj.prepend(this.adjuster);
    this.sumH = 0;
    this.timeouts = [];

    this.obj.find('.arrow-down').on('click', () => {
      if (!this.expanded) {
        this.expand();
      }
    });

    this.initOptions();
  }

  initOptions() {
    this.selected = 0;

    this.options = this.obj
      .find('.select-option')
      .map((index, element) => new Option(element, this, index));

    this.options.map((index, element) => {
      if (element.obj.hasClass('checked')) {
        this.select(element.id, true);
      }
    });

    this.resize();
  }

  resize() {
    this.sumH = 0;
    this.options.map(function (i, e) {
      e.resize();
    });
    this.shrink();
  }

  select(id, init = false) {
    if (!init) this.obj.addClass('selected');
    this.options[this.selected].obj.removeClass('checked');
    const previous = this.selected;
    this.selected = id;
    this.options[this.selected].obj.addClass('checked');
    this.shrink();
    if (this.settings.onSelect !== undefined) {
      this.settings.onSelect.call(
        this,
        this,
        this.options[this.selected],
        previous
      );
    }
  }

  adjust() {
    this.obj.css({
      height: this.options[this.selected].height,
    });
    this.wrap.css({
      height: this.options[this.selected].height,
    });
    this.adjuster.css({
      marginTop: -this.options[this.selected].offset,
    });
  }

  expand() {
    this.obj.css({
      height: this.sumH,
    });
    this.adjuster.css({
      marginTop: 0,
    });
    this.obj.addClass('expanded');
    clearTimeout(this.timeouts[0]);
    this.timeouts[0] = setTimeout(() => {
      $(document).on('click.f3Selector' + this.id, () => this.shrink());
    }, 300);
    this.expanded = true;
  }

  shrink() {
    clearTimeout(this.timeouts[1]);
    this.timeouts[1] = setTimeout(() => {
      this.obj.removeClass('expanded');
      $(document).off('.f3Selector' + this.id);
    }, 300);
    this.adjust();
    this.expanded = false;
  }
}

class Option {
  constructor(obj, parent, id) {
    this.obj = $(obj);
    this.identifier = this.obj.data('value');
    this.papa = parent;
    this.id = id;
    this.height = 0;
    this.offset = 0;

    this.obj.on('click', () => this.papa.select(this.id));
  }

  resize() {
    this.height = this.obj.outerHeight();
    this.offset = this.papa.sumH;
    this.papa.sumH += this.height;
  }
}

function resize() {
  selects.map(e => {
    e.resize();
  });
}

window.addEventListener('layoutChange', resize);

const selects = [];
function createSelector(selector, settings = {}) {
  const select = new Select(selector, selects.length, settings);
  selects.push(select);
  return select;
}

module.exports = createSelector;
