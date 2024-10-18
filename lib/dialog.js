"use strict";

const core = require('@lumjs/core');
const {isObj} = core.types;
const {reposition} = require('./ui');

/**
 * A really simple helper class for working with <dialog/> elements
 * @alias module:@lumjs/web-core/dialog
 */
class DialogHelper
{
  constructor(elem, opts={})
  {
    if (!(elem instanceof HTMLDialogElement))
    {
      console.error({elem});
      throw new TypeError("Invalid <dialog/> element");
    }

    this.element = elem;
    this.options = opts;

    this.useModal  = opts.modal ?? false;
    this.autoReset = opts.reset ?? false;

    core.events.register(this, opts.eventRegistry);
  }

  show(opts={})
  {
    const elem = this.element;

    if (opts instanceof Event)
    {
      opts = {at: opts};
    }

    this.emit('preShow', opts);

    if (this.useModal)
    {
      elem.showModal();
    }
    else
    {
      elem.show();
    }

    if (isObj(opts.at))
    { // Move it!
      reposition(elem, opts.at, opts);
    }

    this.emit('postShow', opts);

    return this;
  }

  close(opts={})
  {
    const elem = this.element;
    const reset = opts.reset ?? this.autoReset;

    this.emit('preClose', opts);

    elem.close();

    if (reset)
    {
      elem.style = null;
    }

    this.emit('postClose', opts);

    return this;
  }

}

module.exports = DialogHelper;
