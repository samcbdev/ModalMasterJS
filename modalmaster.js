/**
 * ModalMaster.js
 * Lightweight, stackable, and customizable jQuery modal plugin.
 *
 * Features:
 * - Stackable modals with independent settings
 * - ESC and outside click close
 * - Scroll lock and animation support
 * - AJAX content loading
 * - Custom lifecycle event hooks
 *
 * Author: Samcbdev
 * License: MIT
 * Requires: jQuery 3.5+
 * Version: 1.0.0
 *
 * GitHub: https://github.com/samcbdev/modalmaster (optional)
 * Documentation: See ModalMaster_Documentation.md
 */
(function ($) {
  const ModalMaster = {
    stack: [],
    config: {
      outsideClickClose: false,
      scrollLock: true,
      escToClose: false,
      animation: false,
      animationSpeed: 300,
      zIndexBase: 1000,
    },
    callbacks: {},

    setGlobalConfig(options = {}) {
      Object.assign(ModalMaster.config, options);
    },

    registerCallbacks(modalClass, cb = {}) {
      ModalMaster.callbacks[modalClass] = cb;
    },

    invokeCallback(modalClass, hook, $modal) {
      const cb = ModalMaster.callbacks[modalClass]?.[hook];
      if (typeof cb === 'function') cb($modal);
    },

    getConfig($modal, key) {
      const attrKey = key.replace(/([A-Z])/g, '-$1').toLowerCase();
      let value = $modal.data(attrKey);

      if (typeof value === 'string') {
        if (value === 'true') return true;
        if (value === 'false') return false;
        const num = parseFloat(value);
        if (!isNaN(num)) return num;
      }

      return typeof value !== 'undefined' ? value : ModalMaster.config[key];
    },

    open(modalClass) {
      const $modal = $('.customModal.' + modalClass);
      if ($modal.length) $modal.modalOpen();
    },

    close(modalClass) {
      const $modal = $('.customModal.' + modalClass);
      if ($modal.length) $modal.modalClose();
    },

    openAjax(modalClass, url) {
      const $modal = $('.customModal.' + modalClass);
      if (!$modal.length) return;

      $modal.trigger('modal:ajaxLoad');
      ModalMaster.invokeCallback(modalClass, 'onAjaxLoad', $modal);

      $modal.find('.ajaxTarget').load(url, function (res, status) {
        if (status === 'error') {
          $modal.trigger('modal:ajaxError');
          ModalMaster.invokeCallback(modalClass, 'onAjaxError', $modal);
        } else {
          ModalMaster.invokeCallback(modalClass, 'onAjaxSuccess', $modal);
          $modal.modalOpen();
        }
      });
    },

    on(modalClass, eventName, callback) {
      $('.customModal.' + modalClass).on(eventName, callback);
    },

    init() {
      $(document).on('click', '.openModalTrigger', function () {
        const target = $(this).data('modal-target');
        if (target) ModalMaster.open(target);
      });

      $(document).on('click', '[data-close-modal]', function (e) {
        e.stopPropagation();
        const $modal = $(this).closest('.customModal');
        if ($modal.length) $modal.modalClose();
      });

      // Store mousedown origin
      $(document).on('mousedown.modalOutside', function (e) {
        $(document).data('ModalMaster_mouseDownTarget', e.target);
      });

      // Handle outside click
      $(document).on('mouseup.modalOutside', function (e) {
        const mouseDownTarget = $(document).data('ModalMaster_mouseDownTarget');
        $('.customModal.showModal').each(function () {
          const $modal = $(this);
          const allowOutside = ModalMaster.getConfig($modal, 'outsideClickClose');
          if (!allowOutside) return;

          const justOpened = (Date.now() - ($modal.data('ModalMaster_openTime') || 0)) < 150;
          if (justOpened) return;

          const isOutsideStart = !$(mouseDownTarget).closest('.modalContent').length;
          const isOutsideEnd = !$(e.target).closest('.modalContent').length;

          if (isOutsideStart && isOutsideEnd) {
            $modal.modalClose();
          }
        });
      });

      // Handle ESC key
      $(document).off('keydown.modalEsc').on('keydown.modalEsc', function (e) {
        if (e.key !== 'Escape') return;

        const $last = ModalMaster.stack[ModalMaster.stack.length - 1];
        if (!$last?.length) return;

        const allowEscClose = ModalMaster.getConfig($last, 'escToClose');
        if (allowEscClose) {
          $last.modalClose();
        }
      });

    }
  };

  $.fn.modalOpen = function () {
    const $modal = this;
    const modalClass = $modal.attr('class').split(/\s+/).find(cls => cls !== 'customModal');
    const isStackable = $modal.is('[data-modal-stack]');
    const lockScroll = ModalMaster.getConfig($modal, 'scrollLock') === true || ModalMaster.getConfig($modal, 'scrollLock') === 'true';
    const animation = ModalMaster.getConfig($modal, 'animation');
    const animationSpeed = parseInt(ModalMaster.getConfig($modal, 'animationSpeed'), 10) || 0;

    $modal.trigger('modal:beforeOpen');
    ModalMaster.invokeCallback(modalClass, 'beforeOpen', $modal);

    if (isStackable && !ModalMaster.stack.includes($modal)) {
      const zIndex = ModalMaster.config.zIndexBase + ModalMaster.stack.length;
      $modal.css('z-index', zIndex);
      ModalMaster.stack.push($modal);
      $modal.trigger('modal:stacked');
    }

    if (lockScroll) {
      $('body').addClass('modalOpen stopScroll');
    }

    $modal.data('ModalMaster_openTime', Date.now());

    const finalizeOpen = () => {
      $modal.addClass('showModal').trigger('modal:open');
      ModalMaster.invokeCallback(modalClass, 'onOpen', $modal);
    };

    // Show modal before any animation, to guarantee visibility
    $modal.css('display', 'block');

    if (animation === 'fade') {
      $modal.hide().fadeIn(animationSpeed, finalizeOpen);
    } else if (animation === 'slide') {
      $modal.hide().slideDown(animationSpeed, finalizeOpen);
    } else {
      finalizeOpen();
    }

    return $modal;
  };

  $.fn.modalClose = function () {
    const $modal = this;
    const modalClass = $modal.attr('class').split(/\s+/).find(cls => cls !== 'customModal');

    // ✅ Skip if not open
    if (!$modal.hasClass('showModal') && !$modal.is(':visible')) return this;

    // ✅ Prevent double-close
    if ($modal.data('ModalMaster_isClosing')) return this;
    $modal.data('ModalMaster_isClosing', true);

    const isStackable = $modal.is('[data-modal-stack]');
    const lockScroll = ModalMaster.getConfig($modal, 'scrollLock') === true || ModalMaster.getConfig($modal, 'scrollLock') === 'true';
    const animation = ModalMaster.getConfig($modal, 'animation');
    const animationSpeed = parseInt(ModalMaster.getConfig($modal, 'animationSpeed'), 10) || 0;

    $modal.trigger('modal:beforeClose');
    ModalMaster.invokeCallback(modalClass, 'beforeClose', $modal);

    if (isStackable) {
      ModalMaster.stack = ModalMaster.stack.filter(m => !m.is($modal));
      $modal.trigger('modal:unstacked');
    }

    const finalizeClose = () => {
      $modal.removeClass('showModal').trigger('modal:close');
      ModalMaster.invokeCallback(modalClass, 'onClose', $modal);
      $modal.removeData('ModalMaster_openTime');
      $modal.removeData('ModalMaster_isClosing');
      $modal.css('display', 'none');

      if (lockScroll && ModalMaster.stack.length === 0) {
        $('body').removeClass('modalOpen stopScroll');
      }
    };

    if (animation === 'fade') {
      $modal.fadeOut(animationSpeed, finalizeClose);
    } else if (animation === 'slide') {
      $modal.slideUp(animationSpeed, finalizeClose);
    } else {
      finalizeClose();
    }

    return $modal;
  };

  ModalMaster.closeAll = function () {
    while (ModalMaster.stack.length > 0) {
      const $top = ModalMaster.stack.pop();
      $top.modalClose();
    }
  };

  window.ModalMaster = ModalMaster;
  $(document).ready(ModalMaster.init);
})(jQuery);
