// global DetailsDisclosure, trapFocus, removeTrapFocus;
if (!customElements.get('course-drawer-disclosure')) {
  class CourseDrawerDisclosure extends DetailsDisclosure {
    constructor() {
      super();
      this.openBtn = this.querySelector('summary');
      this.closeBtn = this.querySelector('.js-close');
      this.overlay = document.getElementById('course-drawer').querySelector('.overlay');
    }

    /**
     * Handles 'click' events on the custom element.
     * @param {object} evt - Event object.
     */
    handleClick(evt) {
      if (!evt.target.matches('.js-close')) return;
      this.close();
    }

    /**
     * Opens the details element.
     */
    open() {
      this.overlay.classList.add('is-visible');
      super.open();
      trapFocus(this);

      // Create event handler variables (so the bound event listeners can be removed).
      this.clickHandler = this.clickHandler || this.handleClick.bind(this);
      this.keyupHandler = (evt) => evt.key === 'Escape' && this.close();

      // Add event listeners (for while disclosure is open).
      this.addEventListener('click', this.clickHandler);
      this.addEventListener('keyup', this.keyupHandler);
      this.overlay.addEventListener('click', this.clickHandler);
    }

    /**
     * Closes the details element.
     */
    close() {
      this.overlay.classList.remove('is-visible');
      super.close();
      removeTrapFocus(this.openBtn);

      this.removeEventListener('click', this.clickHandler);
      this.removeEventListener('keyup', this.keyupHandler);
      this.overlay.removeEventListener('click', this.clickHandler);
    }
  }

  customElements.define('course-drawer-disclosure', CourseDrawerDisclosure);
}

/* global SideDrawer */
if (!customElements.get('course-drawer')) {
  class CourseDrawer extends SideDrawer {
    constructor() {
      super();

      this.courseSummary = this.querySelector('.course-drawer__summary');
      this.init();
      this.bindEvents();
    }

    disconnectedCallback() {
      document.removeEventListener('dispatch:course-drawer:refresh', this.refreshHandler);
      document.removeEventListener('dispatch:course-drawer:open', this.openDrawerViaEventHandler);
      document.removeEventListener('dispatch:course-drawer:close', this.closeDrawerViaEventHandler);

      if (Shopify.designMode) {
        document.removeEventListener('shopify:section:select', this.sectionSelectHandler);
        document.removeEventListener('shopify:section:deselect', this.sectionDeselectHandler);
      }

      if (this.dcbLoadedHandler) {
        document.removeEventListener('shopify:payment_button:loaded', this.dcbLoadedHandler);
      }
    }

    init() {
      const previewBtns = document.querySelectorAll('.preview-button');
      if (previewBtns) {
        previewBtns.forEach((previewBtn) => {
          previewBtn.setAttribute('role', 'button');
          previewBtn.setAttribute('aria-haspopup', 'dialog');

          previewBtn.addEventListener('click', (evt) => {
            evt.preventDefault();
            let top_pro_all = document.querySelectorAll('.course-drawer__content .pad_l_r.top_pro');
            top_pro_all.forEach((top_pro_one) => {
              top_pro_one.classList.add('hidden');
              top_pro_one.querySelector('.c_acc_cart').classList.remove('active');
            });
            
            let pr = previewBtn.getAttribute('data-product');
            let top_pro = document.querySelector('.course-drawer__content .pad_l_r.top_pro[data-pid="'+pr+'"]');
            top_pro.classList.remove('hidden');
            top_pro.querySelector('.c_acc_cart').classList.add('active');
            this.open(previewBtn);
            // customVariantPicker();
          });
  
          previewBtn.addEventListener('keydown', (evt) => {
            if (evt.key !== ' ') return;
            evt.preventDefault();
            let top_pro_all = document.querySelectorAll('.course-drawer__content .pad_l_r.top_pro');
            top_pro_all.forEach((top_pro_one) => {
              top_pro_one.classList.add('hidden');
            });
            this.open(previewBtn);
          });
        });
      }
    }

    bindEvents() {
      if (Shopify.designMode) {
        this.sectionSelectHandler = this.handleSectionSelect.bind(this);
        this.sectionDeselectHandler = this.handleSectionDeselect.bind(this);
        document.addEventListener('shopify:section:select', this.sectionSelectHandler);
        document.addEventListener('shopify:section:deselect', this.sectionDeselectHandler);
      }

      this.openDrawerViaEventHandler = this.handleDrawerOpenViaEvent.bind(this);
      this.closeDrawerViaEventHandler = this.close.bind(this, null);
      document.addEventListener('dispatch:course-drawer:open', this.openDrawerViaEventHandler);
      document.addEventListener('dispatch:course-drawer:close', this.closeDrawerViaEventHandler);

      if (this.courseSummary.classList.contains('course-drawer--checkout--sticky-true')) {
        this.dcbLoadedHandler = this.dcbLoadedHandler || CourseDrawer.recalculateCssVarHeights;
        document.addEventListener('shopify:payment_button:loaded', this.dcbLoadedHandler);
      }

      this.refreshHandler = this.refresh.bind(this);
      document.addEventListener('dispatch:course-drawer:refresh', this.refreshHandler);
    }

    /**
     * Handle when the section is selected in the Theme Editor
     * @param {object} evt - Event object.
     */
    handleSectionSelect(evt) {
      if (evt.target === this.closest('.shopify-section')) this.open();
    }

    /**
     * Handle when the section is de-selected in the Theme Editor
     * @param {object} evt - Event object.
     */
    handleSectionDeselect(evt) {
      if (evt.target === this.closest('.shopify-section')) this.close();
    }

    /**
     * Handle when the drawer is opened via an event
     * @param {object} evt - Event object.
     */
    handleDrawerOpenViaEvent(evt) {
      this.open(evt.detail ? evt.detail.opener : null);
    }

    /**
     * Opens the drawer.
     * @param {Element} [opener] - Element that triggered opening of the drawer.
     * @param {Element} [elementToFocus] - Element to focus after drawer opened.
     */
    open(opener, elementToFocus) {
      // Get the quick add drawer web component, if it's currently open and close it
      const quickAddDrawer = document.querySelector('quick-add-drawer[aria-hidden="false"]');
      const overlay = document.querySelector('.js-overlay.is-visible');

      if (quickAddDrawer) {
        if (overlay) overlay.style.transitionDelay = '200ms';
        quickAddDrawer.close();
      }

      // If the course drawer is open, wait a few ms for a more optimal ux/animation
      setTimeout(() => {
        super.open(opener, elementToFocus, () => {
          if (this.courseSummary.classList.contains('course-drawer--checkout--sticky-true')) {
            CourseDrawer.recalculateCssVarHeights();
          }
        });

        if (this.courseSummary.classList.contains('course-drawer--checkout--sticky-true')) {
          CourseDrawer.recalculateCssVarHeights();
        }

        if (overlay) overlay.style.transitionDelay = '';
      }, quickAddDrawer ? 200 : 0);
      window.initLazyImages();
    }

    /**
     * Attempts to refresh any course items (if present). Failing that, it refreshes the entire course
     * drawer
     * @param {boolean} [dontRefreshCourseItems=false] - Prevents the refresh of course items, and does
     * a straight refresh of the whole course
     */
    async refresh(dontRefreshCourseItems) {
      try {
        const courseItems = this.querySelector('course-items');
        if (courseItems && !dontRefreshCourseItems) {
          courseItems.refresh();
        } else {
          const response = this.getSectionsToRender().map((section) => section.section);
          const courseResponse = await fetch(`?sections=${response.join(',')}`);
          const sections = await courseResponse.json();
          this.renderContents({ sections }, false);
        }
      } catch (error) {
        console.log(error); // eslint-disable-line
        this.dispatchEvent(new CustomEvent('on:course:error', {
          bubbles: true,
          detail: {
            error: this.errorMsg.textContent
          }
        }));
      }
    }

    /**
     * Renders the contents of the specified sections to update.
     * @param {object} data - Course data object.
     * @param {boolean} [openDrawer=true] - Open the course drawer after rendering sections.
     */
    async renderContents(data, openDrawer = true) {
      if (!this.scriptsLoaded) {
        if (!document.querySelector(`script[src="${theme.scripts.courseItems}"]`)) {
          await loadScript(theme.scripts.courseItems);
        }

        if (!document.querySelector(`script[src="${theme.scripts.shippingCalculator}"]`) && this.dataset.shippingCalculator) {
          await loadScript(theme.scripts.countryProvinceSelector);
          await loadScript(theme.scripts.shippingCalculator);
        }

        this.scriptsLoaded = true;
      }

      this.getSectionsToRender().forEach((section) => {
        const el = document.getElementById(section.id);
        if (el) {
          el.innerHTML = CourseDrawer.getElementHTML(
            data.sections[section.section],
            section.selector
          );
        }
      });

      if (openDrawer && this.getAttribute('open') === null) {
        setTimeout(() => this.open());
      }

      window.initLazyImages();
    }

    /**
     * Returns an array of objects containing required section details.
     * @returns {Array}
     */
    getSectionsToRender() {
      return [
        {
          id: 'course-drawer',
          section: this.closest('.shopify-section').id.replace('shopify-section-', ''),
          selector: 'course-drawer'
        },
        {
          id: 'course-icon-bubble',
          section: 'course-icon-bubble',
          selector: '.shopify-section'
        }
      ];
    }

    /**
     * Dispatches an event to recalculate the data-css-var-heights on the page. Useful for
     * updating the height of the sticky course buttons
     */
    static recalculateCssVarHeights() {
      window.requestAnimationFrame(() => {
        document.dispatchEvent(new CustomEvent('on:css-var-height:update'));
      });
    }

    /**
     * Gets the innerHTML of an element.
     * @param {string} html - Section HTML.
     * @param {string} selector - CSS selector for the element.
     * @returns {string}
     */
    static getElementHTML(html, selector) {
      const tmpl = document.createElement('template');
      tmpl.innerHTML = html;

      return tmpl.content.querySelector(selector).innerHTML;
    }
  }
/*
  $('.js-product-form-main').on('submit', function(event) {
  event.preventDefault(); // prevent default form submission
  $.ajax({
    type: 'POST',
    url: '/cart/add.js',
    data: $(this).serialize(),
    dataType: 'json',
    success: function(data) {
      // Do something on success (e.g. show a success message)
      console.log('Item added to cart successfully:', data);
      // You can add additional logic here, like updating the cart count or displaying a success message
    },
    error: function(xhr, status, error) {
      // Do something on error (e.g. show an error message)
      console.error('Error adding item to cart:', error);
      // You can add error handling logic here, like displaying an error message to the user
    }
  });
});
*/

  customElements.define('course-drawer', CourseDrawer);
}

