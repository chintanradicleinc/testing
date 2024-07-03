/* global SideDrawer */

if (!customElements.get('quick-add-drawer')) {
  class QuickAddDrawer extends SideDrawer {
    constructor() {
      super();
      this.form = this.querySelector('product-form.drawer-product-form');
      this.json = this.querySelector('#custom-product-json');
      this.notification = this.querySelector('.js-added-to-cart');
      this.openCartDrawerLinks = this.querySelectorAll('.js-open-cart-drawer');
      this.cartDrawer = document.querySelector('cart-drawer');
      this.fetch = null;
      this.fetchedUrls = [];
      this.quickAddButtonMouseEnterHandler = this.handleQuickAddButtonMouseEnter.bind(this);
      this.documentClickHandler = this.handleDocumentClick.bind(this);

      document.addEventListener('click', this.documentClickHandler);
      this.addEventListener('on:variant:change', this.handleVariantChange.bind(this));

      this.openCartDrawerLinks.forEach((link) => {
        link.addEventListener('click', this.handleOpenCartClick.bind(this));
      });

      if (theme.device.hasHover && theme.mediaMatches.md) {
        document.querySelectorAll('.js-quick-add').forEach((button) => {
          this.bindQuickAddButtonMouseEnter(button);
        });

        if ('MutationObserver' in window) {
          this.observer = new MutationObserver((mutations) => {
            mutations.forEach((mutation) => {
              // Add event listener to new buttons
              mutation.addedNodes.forEach((node) => {
                if (node.nodeType === Node.ELEMENT_NODE) {
                  node.querySelectorAll('.js-quick-add').forEach((button) => {
                    this.bindQuickAddButtonMouseEnter(button);
                  });
                }
              });

              // Remove event listener from removed buttons
              mutation.removedNodes.forEach((node) => {
                if (node.nodeType === Node.ELEMENT_NODE) {
                  node.querySelectorAll('.js-quick-add').forEach((button) => {
                    button.removeEventListener('mouseenter', this.quickAddButtonMouseEnterHandler);
                  });
                }
              });
            });
          });

          // Start observing changes to the DOM
          this.observer.observe(document.body, { childList: true, subtree: true });
        }
      }
    }

    disconnectedCallback() {
      document.removeEventListener('click', this.documentClickHandler);
      document.querySelectorAll('.js-quick-add').forEach((button) => {
        button.removeEventListener('mouseenter', this.quickAddButtonMouseEnterHandler);
      });
      if (this.observer) this.observer.disconnect();
    }

    /**
     * Bind a mouseenter event to a given quick add button if it's not already bound
     * @param {Element} button - The button element to bind the mouseenter event to.
     */
    bindQuickAddButtonMouseEnter(button) {
      if (!button.dataset.quickAddListenerAdded) {
        button.dataset.quickAddListenerAdded = 'true';
        button.addEventListener('mouseenter', this.quickAddButtonMouseEnterHandler);
      }
    }

    /**
     * Start the fetch on hover of a quick add button for perceived performance gains
     * @param {object} evt - Event object.
     */
    handleQuickAddButtonMouseEnter(evt) {
      if (!this.fetchedUrls.includes(evt.target.dataset.productUrl)) {
        this.fetch = {
          url: evt.target.dataset.productUrl,
          promise: fetch(evt.target.dataset.productUrl)
        };
        this.fetchedUrls.push(evt.target.dataset.productUrl);
      }
    }

    /**
     * Handles 'click' events on success notification's 'View cart' link
     * @param {object} evt - Event object.
     */
    handleOpenCartClick(evt) {
      // Open the cart drawer if available on the page
      if (this.cartDrawer) {
        evt.preventDefault();
        this.cartDrawer.open();
      } else if (window.location.pathname === theme.routes.cart) {
        evt.preventDefault();
        this.close();
      }
    }

    /**
     * Handles 'click' events on the document.
     * @param {object} evt - Event object.
     */
    handleDocumentClick(evt) {
      if (!evt.target.matches('.js-quick-add')) return;
      evt.preventDefault();

      // Close the cart drawer if it's open
      if (this.cartDrawer && this.cartDrawer.ariaHidden === 'false') {
        const overlay = document.querySelector('.js-overlay.is-visible');
        if (overlay) overlay.style.transitionDelay = '200ms';

        this.cartDrawer.close();

        // Wait a few ms for a more optimal ux/animation
        setTimeout(() => {
          // this.backBtn.hidden = false;
          this.open(evt.target);
          if (overlay) overlay.style.transitionDelay = '';
        }, 200);
      } else {
        this.open(evt.target);
      }
    }

    /**
     * Handles 'on:variant:change' events on the Quick Add drawer.
     * @param {object} evt - Event object.
     */
    handleVariantChange(evt) {
      let url = this.productUrl;

      if (evt.detail.variant) {
        const separator = this.productUrl.split('?').length > 1 ? '&' : '?';
        url += `${separator}variant=${evt.detail.variant.id}`;
      }

      this.querySelectorAll('.js-prod-link').forEach((link) => {
        link.href = url;
      });
    }

    /**
     * Opens the drawer and fetches the product details.
     * @param {Element} opener - Element that triggered opening of the drawer.
     */
    async open(opener) {
      opener.setAttribute('aria-disabled', 'true');

      if (this.notification) this.notification.hidden = true;
      this.productUrl = opener.dataset.productUrl;
      this.form.innerHTML = '';
      this.classList.add('is-loading');

      super.open(opener);

      if (!this.fetch || this.fetch.url !== opener.dataset.productUrl) {
        this.fetch = {
          url: opener.dataset.productUrl,
          promise: fetch(opener.dataset.productUrl)
        };
      }

      const response = await this.fetch.promise;
      if (response.ok) {
        const tmpl = document.createElement('template');
        tmpl.innerHTML = await response.text();
        this.productEl = tmpl.content.querySelector('.js-product');
        this.renderProduct(opener);
      }

      this.fetch = null;

      opener.removeAttribute('aria-disabled');
    }

    /**
     * Closes the cart drawer.
     */
    close() {
      super.close(() => {
        // this.backBtn.hidden = true;
      });
    }

    /**
     * Renders the product details.
     * @param {Element} opener - Element that triggered opening of the drawer.
     */
    renderProduct(opener) {
      // Replace instances of section id to prevent duplicates on the product page.
      const sectionId = this.productEl.dataset.section;
      this.productEl.innerHTML = this.productEl.innerHTML.replaceAll(sectionId, 'quickadd');
      // Prevent variant picker from updating the URL on change.
      const variantPicker = this.productEl.querySelector('variant-picker');
      if (variantPicker) variantPicker.dataset.updateUrl = 'false';

      // Remove size chart modal and link (if they exist).
      const sizeChartModal = this.productEl.querySelector('[data-modal="size-chart"]');
      if (sizeChartModal) {
        sizeChartModal.remove();
      }

      // this.updateContent();
      this.updateForm(opener);
      if (opener.dataset.selectedColor) {
        // Timeout to allow the VariantPicker to initialize
        setTimeout(this.setActiveVariant.bind(this, opener), 10);
      }
      this.classList.remove('is-loading');
    }

    /**
     * Set color variant to match the one selected in the card.
     * @param {Element} opener - Element that triggered opening of the drawer.
     */
    setActiveVariant(opener) {
      const colorOptionBox = this.querySelector(`.opt-btn[value="${opener.dataset.selectedColor}"]`);
      if (colorOptionBox) {
        this.querySelector(`.opt-btn[value="${opener.dataset.selectedColor}"]`).click();
      } else {
        const colorOptionDropdown = this.querySelector(
          `.custom-select__option[data-value="${opener.dataset.selectedColor}"]`
        );
        if (colorOptionDropdown) {
          const customSelect = colorOptionDropdown.closest('custom-select');
          customSelect.selectOption(colorOptionDropdown);
        }
      }
    }

    /**
     * Updates the Quick Add drawer form (buy buttons).
     */
    updateForm(opener) {
      const product_json = this.productEl.querySelector("#custom-product-json").innerHTML;
      this.json.innerHTML = product_json;
      const productForm = this.productEl.querySelector('product-form');
      if(this.productEl.querySelector('.product-info__add-button').getAttribute("data-membership_pro")){
        $(".quick-add-drawer .drawer__header h2").text("Quick View");
        $(".quick-add-drawer .bottom_pro").hide();
      }else{
        $(".quick-add-drawer .drawer__header h2").text("Quick View");
        $(".quick-add-drawer .bottom_pro").show();
      }

      // this.footer.classList.remove('quick-add__footer-message');

      // if (productForm) {
      this.form.innerHTML = productForm.innerHTML;
      if(this.form.querySelector('.product-info__sticky .product-info__title .product-title')){
        this.form.querySelector('.product-info__sticky .product-info__title .product-title').remove();
      }
      if(this.form.querySelector('.product-info__sticky .normal_content')){
        this.form.querySelector('.product-info__sticky .normal_content').remove();
      }
      // console.log(opener.getAttribute('data-added-variant'));
      if(opener.getAttribute('data-product-url').indexOf('op=change') > -1 ){
        this.form.querySelector('[type="submit"]').setAttribute("data-edit","true");
        this.form.querySelector('[type="submit"]').setAttribute("data-edit-variant",opener.getAttribute('data-added-variant'));
        this.form.querySelector('[type="submit"]').setAttribute("data-variant",opener.getAttribute('data-variant-id'));
        this.form.querySelector('[type="submit"]').setAttribute("data-state",opener.getAttribute('data-state'));
        this.form.querySelector('[type="submit"]').setAttribute("data-discipline",opener.getAttribute('data-discipline'));
        
        // Get the selected state and discipline values
        let select_state = opener.getAttribute('data-state');
        let select_discipline = opener.getAttribute('data-discipline');
        
        // Find the select elements
        let stateDropdown = document.getElementById('iFunction_2');
        let disciplineDropdown = document.getElementById('iOperation_2');
        
        // Set the selected state and discipline values
        stateDropdown.value = select_state;
        disciplineDropdown.value = select_discipline.toLowerCase();
      }
      var productInfo = this.form.querySelector('.product-info__sticky .goals-product');
      var summaryProduct = this.form.querySelector('.product-info__sticky .summary-product');
      var tagline_txt = this.form.querySelector('.product-info__sticky .tagline_txt');

      if (productInfo) {
          productInfo.remove();
      }
      if (summaryProduct) {
          summaryProduct.remove();
      }
      if(tagline_txt){
          tagline_txt.remove();
      }
      this.form.init();
      if (Shopify && Shopify.PaymentButton) {
        Shopify.PaymentButton.init();
      }
    }

    /**
     * Gets the innerHTML of an element within the product element.
     * @param {string} selector - CSS selector for the element.
     * @returns {?string}
     */
    getElementHtml(selector) {
      const el = this.productEl.querySelector(selector);
      return el ? el.innerHTML : '';
    }

    /**
     * Shows an "Added to cart" message in the drawer.
     */
    addedToCart() {
      if (this.notification) {
        setTimeout(() => {
          this.notification.hidden = false;
        }, 300);
        setTimeout(() => {
          this.notification.hidden = true;
        }, this.notification.dataset.visibleFor);
      }
    }
  }

  customElements.define('quick-add-drawer', QuickAddDrawer);
}
