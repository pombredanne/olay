(function () {
  'use strict';

  var $ = window.jQuery;
  var chai = window.chai;
  var mocha = window.mocha;
  var Olay = window.Olay;

  mocha.setup('bdd');
  chai.should();

  var after = window.after;
  var before = window.before;
  var describe = window.describe;
  var it = window.it;

  var $el = $('<div>hi</div>');
  var olay = new Olay($el, {
    transitionDuration: 0
  });

  describe('Constructor', function () {
    it('creates a jQuery $container element', function () {
      olay.should.have.property('$container');
      olay.$container.should.be.instanceOf($);
    });

    it('creates a jQuery $table element', function () {
      olay.should.have.property('$table');
      olay.$table.should.be.instanceOf($);
    });

    it('creates a jQuery $cell element', function () {
      olay.should.have.property('$cell');
      olay.$cell.should.be.instanceOf($);
    });

    it('creates a jQuery $content element', function () {
      olay.should.have.property('$content');
      olay.$content.should.be.instanceOf($);
    });

    it('creates a jQuery $el element', function () {
      olay.should.have.property('$el');
      olay.$el.should.be.instanceOf($);
    });

    it('gives the $el element the passed in $el', function () {
      olay.$el.html().should.equal('hi');
      olay.$el.should.equal($el);
    });

    it('inherits options', function () {
      olay.transitionDuration.should.equal(0);
    });
  });

  describe('Accessibility', function () {
    it('gives the $content element the correct ARIA role', function () {
      olay.$content.attr('role').should.equal('alertdialog');
    });
  });

  describe('Callbacks', function () {
    it('trigger `olay:show` after append', function (done) {
      olay.$el.one('olay:show', function () {
        $('.js-olay-container').length.should.equal(1);
        done();
      });
      olay.show();
    });

    it('trigger `olay:hide` when `hide` is invoked', function (done) {
      olay.$el.one('olay:hide', function () {
        $('.js-olay-container').length.should.equal(0);
        done();
      });
      olay.hide();
    });
  });

  describe('DOM Manipulation', function () {
    it('appends to the DOM on show', function () {
      olay.show();
      $('.js-olay-container').should.have.length(1);
    });

    it('removes from the DOM on hide', function () {
      olay.hide();
      $('.js-olay-container').should.have.length(0);
    });
  });

  describe('Hide Options', function () {
    it('hides when ESC is pressed', function () {
      olay.show();
      $(document).trigger({type: 'keydown', which: 27});
      $('.js-olay-container').should.have.length(0);
    });

    it('hides when $container is clicked, but not $content', function () {
      olay.show().$el.click(function () { $(this).detach(); }).click();
      $('.js-olay-container').should.have.length(1);
      olay.$content.append(olay.$el);
      olay.$container.click();
      $('.js-olay-container').should.have.length(0);
    });

    it('does not hide if `hideOnClick` is `false`', function () {
      olay.hideOnClick = false;
      olay.show().$content.click();
      $('.js-olay-container').should.have.length(1);
      olay.$container.click();
      $('.js-olay-container').should.have.length(1);
      olay.hide();
      olay.hideOnClick = true;
    });

    it('hides after a defined duration', function (done) {
      olay.duration = 1;
      olay.show();
      setTimeout(function () {
        $('.js-olay-container').should.have.length(0);
        done();
      }, 1);
      olay.duration = 0;
    });
  });

  describe('Tab Locking', function () {
    var $input;

    before(function () {
      $input = $('<input>')
        .addClass('js-test-input')
        .attr('tabindex', 1)
        .appendTo('body');
    });

    it('blurs the active element on show', function () {
      $input.focus();
      olay.show();
      $input.is(':focus').should.not.be.ok;
    });

    it('locks when an olay is shown', function () {
      $input.attr('tabindex').should.equal('-1');
    });

    it('restores when an olay is hidden', function () {
      olay.hide();
      $input.is(':focus').should.be.ok;
    });

    after(function () {
      $input.remove();
    });
  });

  describe('Preserve', function () {
    before(function () {
      olay.preserve = true;
      olay.$el.data('test', true);
    });

    it('stores jQuery data on show and hide', function () {
      olay.show().hide();
      olay.$el.data('test').should.be.ok;
    });

    it('does not double up hide events', function () {
      var hidden = 0;
      olay.show().hide();
      var hide = olay.hide;
      olay.hide = function () {
        ++hidden;
        return hide.apply(olay, arguments);
      };
      olay.show().$container.click();
      hidden.should.equal(1);
    });

    it('wipes data when `destroy`ed', function () {
      olay.destroy();
      (olay.$el.data('test') === void 0).should.be.ok;
      olay.$el.data('test', true);
    });

    it('wipes data when `false`d', function () {
      olay.preserve = false;
      olay.show().hide();
      (olay.$el.data('test') === void 0).should.be.ok;
      olay.$el.data('test', true);
    });

    after(function () {
      olay.$el.removeData('test');
      olay.preserve = false;
    });
  });

  describe('Set Element', function () {
    it('allows for an empty constructor', function () {
      var olay = new Olay();
      olay.setElement('<div>late bloomer</div>');
      olay.show();
      $('.js-olay-container').text().should.equal('late bloomer');
      olay.hide();
    });
  });

  mocha.run();
})();
