if (!customElements.get('product-form')) {
  class ProductForm extends HTMLElement {
    constructor() {
      super();
      if (this.hasChildNodes()) this.init();
    }
    init() {
      let href = window.location.href;
      this.form = this.querySelector('.js-product-form');
      if (this.form) {
        this.form.querySelector('[name="id"]').disabled = false;
        this.cartDrawer = document.querySelector('cart-drawer');
        this.submitBtn = this.querySelector('[name="add"]');
        if (theme.settings.afterAtc !== 'no-js') {
          this.addEventListener('submit', this.handleSubmit.bind(this));
        }
        this.updateProfessionVariant();
        let drops = document.querySelectorAll('.new_category select');
        for(const select of drops){
          select.addEventListener('change', () => this.updateProfessionVariant());
        }
        this.updateStates();
      }else{
        return;
      }
    }
  
    /**
     * Handles submission of the product form.
     * @param {object} evt - Event object.
     */
    async handleSubmit(evt) {
      if (evt.target.id === 'product-signup_form') return;

      evt.preventDefault();
      if (this.submitBtn.getAttribute('aria-disabled') === 'true') return;
  
      if (theme.settings.vibrateOnATC && window.navigator.vibrate) {
        window.navigator.vibrate(100);
      }
  
      this.errorMsg = null;
      this.setErrorMsgState();
  
      // Disable "Add to Cart" button until submission is complete.
      this.submitBtn.setAttribute('aria-disabled', 'true');
      this.submitBtn.classList.add('is-loading');
  
      const formData = new FormData(this.form);
      let sections = 'cart-icon-bubble';
      if (this.cartDrawer) {
        sections += `,${this.cartDrawer.closest('.shopify-section').id.replace('shopify-section-', '')}`;
      }
      formData.append('sections_url', window.location.pathname);
      formData.append('sections', sections);
      // let jsonA = JSON.parse(document.getElementById('custom-product-json').textContent);
      let jsonA = "";
      if(this.form.closest('.product-main') !== null){
        jsonA = JSON.parse(this.form.closest('.product-main').querySelector("#custom-product-json").textContent);
      }else{
        jsonA = JSON.parse(this.form.closest("quick-add-drawer").querySelector("#custom-product-json").textContent);
      }
      let selectedVariant = '';
      for (const [key, value] of formData.entries()) {
        if(key == "id") {
          selectedVariant = value;
        }
      }
      let data = jsonA[selectedVariant];
      let state = formData.get("iFunction_2");
      let discipline = formData.get("iOperation_2");

      for (var key in data) {
        let pro_type = data['product_type'];
        if ((data.hasOwnProperty(key)) && (key != "bundle_hours") && (key != "iOperation_2") && (key != "iFunction_2") && (key != "text_course_hours") && (key != "video_course_hours") && (key != "webinar_course_hours") && (key != "contact_hours") && (key != "extension_duration") && (key != "product_type")) {
          if((key == "profession") && (data[key] != "") ){
            if((data[key][state] != "") && (data[key][state] != null) && (data[key][state] != undefined) && (state != null) && (state != undefined) && (data[key][state][discipline] != "") && (data[key][state] != null) && (data[key][state][discipline] != undefined) && (discipline != null) && (discipline != undefined)){
              if((data[key][state][discipline]['profession'] != "") && (data[key][state][discipline]['profession'] != undefined) && (data[key][state][discipline]['profession'] != null)){
                formData.append('properties[_profession]', data[key][state][discipline]['profession']);
              }
              formData.append('properties[_education_type]', 'CE');
              if((pro_type == "Webinar") || (pro_type == "webinar")){
                // if((data[key][state][discipline]['start_date'] != "") && (data[key][state][discipline]['start_date'] != null) && (data[key][state][discipline]['start_date'] != undefined)){
                //   formData.append('properties[_start_date]', data[key][state][discipline]['start_date']);
                // }
                // if((data[key][state][discipline]['end_date'] != "") && (data[key][state][discipline]['end_date'] != null) && (data[key][state][discipline]['end_date'] != undefined)){                
                //   formData.append('properties[_end_date]', data[key][state][discipline]['end_date']);
                // }  
                if((data[key][state][discipline]['extension_duration'] != "") && (data[key][state][discipline]['extension_duration'] != null) && (data[key][state][discipline]['extension_duration'] != undefined)){                
                  formData.append('properties[_extension_duration]', data[key][state][discipline]['extension_duration']);
                }
              }
              if((data[key][state]['code'] != "") && (data[key][state]['code'] != null) && (data[key][state]['code'] != undefined)){                
                formData.append('properties[_state]', data[key][state]['code']);
              }
            }
          }else if(key == "delivery_method"){
            formData.append('properties[_delivery_method]', data[key]);
          }else if(key == "start_date"){
            if((pro_type == "Webinar") || (pro_type == "webinar")){
              formData.append('properties[_start_date]', data[key]);
            }
          }else if(key == "end_date"){
            if((pro_type == "Webinar") || (pro_type == "webinar")){
              formData.append('properties[_end_date]', data[key]);
            }
          }else{
            formData.append('properties['+key+']', data[key]);
          }
          let meta_discipline_tmp = "";
          if(discipline == "ot"){
            meta_discipline_tmp = "occupational-therapy-continuing-education";
          }else if(discipline == "pt"){
            meta_discipline_tmp = "physical-therapy-continuing-education";
          }else if(discipline == "slp"){
            meta_discipline_tmp = "speech-language-pathologist-continuing-education";
          }else if(discipline == "atc-lat"){
            meta_discipline_tmp = "athletic-training-continuing-education";
          }else if(discipline == "mt-lmt"){
            meta_discipline_tmp = "massage-therapy-continuing-education";
          }else if((discipline == "cscs") || (discipline == "cscs-nsca-cpt")){
            meta_discipline_tmp = "certified-strength-and-conditioning-specialist-continuing-education";
          }else if(discipline == "ota"){
            meta_discipline_tmp = "occupational-therapy-assistant-continuing-education";
          }else if(discipline == "pta"){
            meta_discipline_tmp = "physical-therapy-assistant-continuing-education";
          }

          formData.append('properties[_current_collection]', meta_discipline_tmp+"-"+state.toLowerCase());
          formData.append('properties[_admin_state]', state);
          formData.append('properties[_admin_discipline]', discipline);
        }
      }
      let j = 1;
      let tempdata = [];
      let removeData = [];
      for (const [key, value] of formData.entries()) {
        if (key.indexOf('tempcourse') > -1) {
          const newKey = j;
          removeData.push(key);
          tempdata.push(value);
          j++;
        }
      }
      /* this code is commented because they are using shopify bundlers to have products.
      if(tempdata){
        for (const key in tempdata) {
          let new_key = Number(key)+1;
          formData.append('properties[Course '+new_key+']', tempdata[key]);
        }
      }
      */
      if(removeData){
        for (const key in removeData) {
          formData.delete(removeData[key]);
        }
      }

      // for (const [key, value] of formData.entries()) {
      //   console.log(key, value);
      // }
      // return false;
      // if(this.submitBtn.getAttribute('data-edit') === "true"){
      //   console.log(this.submitBtn.getAttribute('data-edit'));
      // }
      const fetchRequestOpts = {
        method: 'POST',
        headers: {
          Accept: 'application/javascript',
          'X-Requested-With': 'XMLHttpRequest'
        },
        body: formData
      };
  
      try {
        const oldCartResponse = await fetch(`${theme.routes.cart}.js`);
        if (!oldCartResponse.ok) throw new Error(oldCartResponse.status);
        const oldCartData = await oldCartResponse.json();
        if(this.submitBtn.getAttribute('data-added-variant')){
          const c_data_res = await fetch('/cart/change.js', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json'
            },
            body: JSON.stringify({ line: parseInt(this.submitBtn.getAttribute('data-added-variant')), quantity: 0 })
          });
        }

        const response = await fetch(theme.routes.cartAdd, fetchRequestOpts);
        const data = await response.json();
        let error = typeof data.description === 'string' ? data.description : data.message;
        if (data.errors && typeof data.errors === 'object') {
          error = Object.entries(data.errors).map((item) => item[1].join(', '));
        }
  
        if (data.status) this.setErrorMsgState(error);
  
        if (!response.ok) throw new Error(response.status);
  
        if (theme.settings.afterAtc === 'page') {
          // Allow the tick animation to complete
          setTimeout(() => {
            window.location.href = theme.routes.cart;
          }, 300);
        } else {
          // Update cart icon count.
          ProductForm.updateCartIcon(data);
  
          // If item was added from Quick Add drawer, show "Added to cart" message.
          const quickAddDrawer = this.closest('quick-add-drawer');
          if (quickAddDrawer) quickAddDrawer.addedToCart();
  
          setTimeout(() => {
            // Update cart drawer contents.
            if (this.cartDrawer) {
              this.cartDrawer.renderContents(data, theme.settings.afterAtc === 'drawer');
              // this.cartDrawer.renderContents(data, !quickAddDrawer && theme.settings.afterAtc === 'drawer');
            } else if (window.location.pathname === theme.routes.cart) {
              const cartItems = document.querySelector('cart-items');
              if (cartItems) {
                if (cartItems.dataset.empty === 'true') {
                  window.location.reload();
                } else {
                  cartItems.refresh();
                }
              }
            }
          }, 700);
        }
  
        const newCartResponse = await fetch(`${theme.routes.cart}.js`);
        if (!newCartResponse.ok) throw new Error(newCartResponse.status);
        const newCartData = await newCartResponse.json();
        const itemInOldCart = oldCartData.items.filter(
          (item) => item.variant_id === data.variant_id
        )[0];


        // Check if product was already in the cart
        if (itemInOldCart) {
          this.dispatchEvent(new CustomEvent('on:line-item:change', {
            bubbles: true,
            detail: {
              cart: newCartData,
              variantId: data.variant_id,
              oldQuantity: itemInOldCart.quantity,
              newQuantity: (itemInOldCart.quantity === data.quantity)
                ? itemInOldCart.quantity : data.quantity
            }
          }));
        } else {
          this.dispatchEvent(new CustomEvent('on:cart:add', {
            bubbles: true,
            detail: {
              cart: newCartData,
              variantId: data.variant_id
            }
          }));
        }
      } catch (error) {
        this.dispatchEvent(new CustomEvent('on:cart:error', {
          bubbles: true,
          detail: {
            error: this.errorMsg.textContent
          }
        }));
      } finally {
        // Re-enable 'Add to Cart' button.
        if(this.submitBtn.getAttribute('data-added-variant')){
          if (window.location.pathname === theme.routes.cart) {
            location.reload();
          }else{
            const cartItems = document.querySelector('cart-items');
            cartItems.refresh();
          }
        }

        this.submitBtn.classList.add('is-success');
        this.submitBtn.removeAttribute('aria-disabled');
        setTimeout(() => {
          this.submitBtn.classList.remove('is-loading');
          this.submitBtn.classList.remove('is-success');
          this.submitBtn.setAttribute('data-edit', true);
          this.submitBtn.setAttribute('data-state', state);
          this.submitBtn.setAttribute('data-discipline', discipline);
          this.submitBtn.setAttribute('data-variant', selectedVariant);
          this.submitBtn.setAttribute('data-added-variant', document.querySelector("cart-items .preview_c[data-variant-id='"+selectedVariant+"']").getAttribute('data-added-variant'));
          this.submitBtn.classList.add('dis_btn');
          this.submitBtn.classList.add('btn--cyan');
          this.submitBtn.innerText = "In cart";
          let drawer = document.querySelector('cart-items');
          var currentUrl = window.location.href;
          if (currentUrl.includes('cart')) {
            window.location.reload();
          }
        }, 1400);
      }
    }
  
    /**
     * Updates the cart icon count in the header.
     * @param {object} response - Response JSON.
     */
    static updateCartIcon(response) {
      const cartIconBubble = document.getElementById('cart-icon-bubble');
      if (cartIconBubble) {
        cartIconBubble.innerHTML = response.sections['cart-icon-bubble'];
      }
    }
  
    /**
     * Shows/hides an error message.
     * @param {string} [error=false] - Error to show a message for.
     */
    setErrorMsgState(error = false) {
      this.errorMsg = this.errorMsg || this.querySelector('.js-form-error');
      if (!this.errorMsg) return;
  
      this.errorMsg.hidden = !error;
      if (error) {
        this.errorMsg.innerHTML = '';
        const errorArray = Array.isArray(error) ? error : [error];
        errorArray.forEach((err, index) => {
          if (index > 0) this.errorMsg.insertAdjacentHTML('beforeend', '<br>');
          this.errorMsg.insertAdjacentText('beforeend', err);
        });
      }
    }

    async updateProfessionVariant(){
      let jsonA = "";
      if(this.form.closest('.product-main') !== null){
        jsonA = JSON.parse(this.form.closest('.product-main').querySelector("#custom-product-json").textContent);
      }else{
        jsonA = JSON.parse(this.form.closest("quick-add-drawer").querySelector("#custom-product-json").textContent);
      }

      let selectedVariant = "";
      if(window.location.pathname.indexOf('/pages/ce-requirements') > -1){
        let local_state = localStorage.getItem('selectedStateRequirement');
        if((local_state !== null) && (local_state !== "") && (local_state !== undefined)){
          local_state = local_state[0].toUpperCase() + local_state.slice(1);
          this.form.querySelector("#iFunction_2").value = local_state;
        }
        let local_disc = localStorage.getItem('selectedDisciplineRequirement');
        if((local_disc !== null) && (local_disc !== "") && (local_disc !== undefined)){
          if(local_disc == 'physical-therapy'){
            local_disc = 'pt';
          } else if(local_disc == 'occupational-therapy'){
            local_disc = 'ot';
          } else if(local_disc == 'massage-therapy'){
            local_disc = 'mt-lmt';
          } else if(local_disc == 'athletic-training'){
            local_disc = 'atc-lat';
          } else if(local_disc == 'speech-language-pathology'){
            local_disc = 'slp';
          }
        }
        this.form.querySelector("#iOperation_2").value = local_disc;
      }
      const formData = new FormData(this.form);
      for (const [key, value] of formData.entries()) {
        if (key == "id") {
          selectedVariant = value;
        }
      }
      let data = jsonA[selectedVariant];
      let state = formData.get("iFunction_2");
      let discipline = formData.get("iOperation_2");
      for(const key in data){
        if((key == "bundle_hours") && (data[key] != "") && (state) && (discipline)){
          if(data[key][state] && data[key][state][discipline] && data[key][state][discipline]['hours']){
            for(const format in data[key][state][discipline]['hours']){
              let format_hours = document.querySelector('.product_list_bundle .product-info__block[data-format="'+format+'"]');
              if(format_hours !== null){
                format_hours.setAttribute('data-product-format-hours', data[key][state][discipline]['hours'][format]);
              }
            }
          }
        }
      }
      await this.updateDisciplines(state);
      state = this.form.querySelector("#iFunction_2").value;
      discipline = this.form.querySelector("#iOperation_2").value;
      if((state === "") || (discipline === "")){
        this.form.querySelector('.new_category').classList.add('show_select');
      }
    }
    async updateStates(){
      let json_selector = null;
      if(this.form.closest('.product-main') !== null){
        json_selector = this.form.closest('.product-main').querySelector("#custom-product-json");
      }else{
        json_selector = this.form.closest("quick-add-drawer").querySelector("#custom-product-json");
      }
      if(json_selector){
        let jsonB = JSON.parse(json_selector.textContent);
        let name_id = this.form.querySelector("[name='id']").value;
        let state_drop = this.form.querySelector("#iFunction_2");
        let dis_drop = this.form.querySelector("#iOperation_2");
        if((state_drop != null) && (dis_drop != null)){
          let states = [];
          if(jsonB[name_id]['profession']){
            for(const i in jsonB[name_id]['profession']){
              let temp_array = Object.keys(jsonB[name_id]['profession'][i]);
              let disciplines = [];
              for(const j of temp_array){
                if((j !== "code") && (jQuery.inArray(j, disciplines) == -1)){
                  disciplines.push(j);
                }
              }
              states[i] = disciplines;
            }
          }
          for (let i = 0; i < state_drop.options.length; i++) {
            let option = state_drop.options[i];
            if(jQuery.inArray(option.value, Object.keys(jsonB[name_id]['profession'])) == -1){
              option.disabled = true;
            }else{
              option.disabled = false;
            }
          }
          if(state_drop.querySelector('option[value="'+state_drop.value+'"]').getAttribute('disabled') !== null){
            state_drop.value = "";
          }
          await this.updateDisciplines(state_drop.value);
        }
      }
    }
    async updateDisciplines(value){
      let states = [];
      let name_id = this.form.querySelector("[name='id']").value;
      let json_selector = null;
      if(this.form.closest('.product-main') !== null){
        json_selector = this.form.closest('.product-main').querySelector("#custom-product-json");
      }else{
        json_selector = this.form.closest("quick-add-drawer").querySelector("#custom-product-json");
      }
      if(json_selector){
        let jsonB = JSON.parse(json_selector.textContent);
        let dis_drop = this.form.querySelector("#iOperation_2");
        let val = $(dis_drop).val();
        let has_val = false;
        if(jsonB[name_id]['profession']){
          for(const i in jsonB[name_id]['profession']){
            let temp_array = Object.keys(jsonB[name_id]['profession'][i]);
            let disciplines = [];
            for(const j of temp_array){
              if((j !== "code") && (jQuery.inArray(j, disciplines) == -1)){
                disciplines.push(j);
              }
            }
            states[i] = disciplines;
          }
        }
        let total_dis = states[value];
        if(total_dis !== undefined){
          for (let i = 0; i < dis_drop.options.length; i++) {
            let option = dis_drop.options[i];
            if(option.value){
              if(jQuery.inArray(option.value, total_dis) == -1){
                option.disabled = true;
              }else{
                if(option.value == val){
                  has_val = true;
                }
                option.disabled = false;
              }
            }
          }
        }
        if(has_val == false){
          if(total_dis !== undefined){
            if(total_dis.length == 1){
              $(dis_drop).val(total_dis[0]);
            }else if(total_dis.length == 2){
              $(dis_drop).val(total_dis[0]);
            }else{
              $(dis_drop).val("");
            }
          }
        }
      }
    }
  }

  customElements.define('product-form', ProductForm);
}