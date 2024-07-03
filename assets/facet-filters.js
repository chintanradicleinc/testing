/* global SideDrawer, debounce, initLazyImages */

if (!customElements.get('facet-filters')) {
  class FacetFilters extends SideDrawer {
    connectedCallback() {
      this.init();
    }

    disconnectedCallback() {
      window.removeEventListener('popstate', this.historyChangeHandler);

      if (this.breakpointChangeHandler) {
        window.removeEventListener('on:breakpoint-change', this.breakpointChangeHandler);
      }
    }

    init() {
      this.filteringEnabled = this.dataset.filtering === 'true';
      this.sortingEnabled = this.dataset.sorting === 'true';
      this.form = document.getElementById('facets');
      this.heading = document.querySelector('#banner_heading');
      this.heading_count = document.querySelector('#banner_count');
      this.breadcrumbs = document.querySelector("#collection_breadcrumbs");
      this.result_count = document.querySelector('.active-results-count');
      // this.result_filters = document.querySelector('.active-filters');
      this.results = document.getElementById('filter-results');
      if (this.filteringEnabled) {
        this.filters = this.querySelector('.facets__filters');
        this.activeFilters = this.querySelector('.facets__active-filters');
        this.activeFiltersList = this.querySelector('.active-filters');
        this.activeFiltersHeader = this.querySelector('.active-filters-header');
        this.footer = this.querySelector('.facets__footer');
      }

      if (this.sortingEnabled) {
        this.mobileSortByOptions = this.querySelectorAll('.js-drawer-sort-by');
        this.desktopSortBy = document.querySelector('.products-toolbar__sort');
      }

      this.handleBreakpointChange();
      this.addListeners();
    }

    addListeners() {
      if (this.filteringEnabled) {
        this.breakpointChangeHandler = this.breakpointChangeHandler || this.handleBreakpointChange.bind(this);
        this.filters.addEventListener('click', this.handleFiltersClick.bind(this));
        this.filters.addEventListener('input', debounce(this.handleFilterChange.bind(this), 500));
        this.activeFilters.addEventListener('click', this.handleActiveFiltersClick.bind(this));
        window.addEventListener('on:breakpoint-change', this.breakpointChangeHandler);
      }

      if (this.sortingEnabled) {
        this.desktopSortBy.addEventListener('change', this.handleFilterChange.bind(this));
      }

      this.keyword = document.querySelector('.keyword_search');
      this.promocode = document.querySelector('.promo_code');
      let temp = this;
      this.keyword.addEventListener('keyup', this.handleKeywords((evt) => {
        this.handleFilterChange(evt);
      }, 1000).bind(this));
      this.promocode.addEventListener('keyup', this.handleKeywords((evt) => {
        this.handleFilterChange(evt);
      }, 1000).bind(this));

      this.i_state = document.querySelector('#i_state');
      this.idiscipline = document.querySelector('#idiscipline');
      
      this.i_state.addEventListener('change', this.handleFilterChange.bind(temp));
      this.idiscipline.addEventListener('change', this.handleFilterChange.bind(temp));

      this.historyChangeHandler = this.historyChangeHandler || this.handleHistoryChange.bind(this);
      window.addEventListener('popstate', this.historyChangeHandler);
    }

    handleKeywords(callback, wait){
      let timeout;
      return (...args) => {
          clearTimeout(timeout);
          timeout = setTimeout(function () { callback.apply(this, args); }, wait);
      };
    }
    /**
     * Handles viewport breakpoint changes.
     */
    handleBreakpointChange() {
      if (theme.mediaMatches.lg) {
        this.setAttribute('open', '');
        this.setAttribute('aria-hidden', 'false');
        this.removeAttribute('aria-modal');
        this.removeAttribute('role');
      } else {
        this.close();
        this.setAttribute('role', 'dialog');
        this.setAttribute('aria-modal', 'true');
        this.setAttribute('aria-hidden', 'true');
        this.hidden = false;
      }
    }

    /**
     * Handles 'input' events on the filters and 'change' events on the sort by dropdown.
     * @param {object} evt - Event object.
     */
    handleFilterChange(evt) {
      if(evt.target.classList.contains('discipline') && (($('#i_state').val() == null) || ($('#idiscipline').val() == null) || ($('#i_state').val() == "") || ($('#idiscipline').val() == ""))){
        return false;
      }
      const formData = new FormData(this.form);
      const searchParams = new URLSearchParams(formData);
      // console.log(searchParams);
     
      const emptyParams = [];

      if (this.sortingEnabled) {
        let currentSortBy = searchParams.get('sort_by');

        // Keep the mobile facets form sync'd with the desktop sort by dropdown
        if (evt.target.tagName === 'CUSTOM-SELECT') {
          this.mobileSortByOptions.forEach((option) => {
            option.checked = option.value === evt.detail.selectedValue;
            currentSortBy = evt.detail.selectedValue;
          });
        }

        // Set the 'sort_by' parameter.
        searchParams.set('sort_by', currentSortBy);
      }

      // Get empty parameters.
      searchParams.forEach((value, key) => {
        if (!value) emptyParams.push(key);
      });

      // Remove empty parameters.
      emptyParams.forEach((key) => {
        searchParams.delete(key);
      });

      this.applyFilters(searchParams.toString(), evt);
    }

    /**
     * Handles 'click' events on the filters.
     * @param {object} evt - Event object.
     */
    handleFiltersClick(evt) {
      const { target } = evt;

      // Filter 'clear' button clicked.
      if (target.matches('.js-clear-filter')) {
        evt.preventDefault();
        this.applyFilters(new URL(evt.target.href).searchParams.toString(), evt);
      }

      // Filter 'show more' button clicked.
      // if (target.matches('.js-show-more')) {
      //   const filter = target.closest('.filter');
      //   target.remove();

      //   filter.querySelectorAll('li').forEach((el) => {
      //     el.classList.remove('js-hidden');
      //   });
      // }
    }

    /**
     * Handles 'click' events on the active filters.
     * @param {object} evt - Event object.
     */
    handleActiveFiltersClick(evt) {
      if (evt.target.tagName !== 'A') return;
      evt.preventDefault();
      this.applyFilters(new URL(evt.target.href).searchParams.toString(), evt);
    }

    /**
     * Handles history changes (e.g. back button clicked).
     * @param {object} evt - Event object.
     */
    handleHistoryChange(evt) {
      if (evt.state !== null) {
        let searchParams = '';

        if (evt.state && evt.state.searchParams) {
          ({ searchParams } = evt.state);
        }

        this.applyFilters(searchParams, null, false);
      }
    }

    /**
     * Fetches the filtered/sorted page data and updates the current page.
     * @param {string} searchParams - Filter/sort search parameters.
     * @param {object} evt - Event object.
     * @param {boolean} [updateUrl=true] - Update url with the selected options.
     */
    async applyFilters(searchParams, evt, updateUrl = true) {
      const customPagination = document.querySelector('custom-pagination');
      if (customPagination) customPagination.dataset.pauseInfiniteScroll = 'true';

      this.results.classList.add('is-loading');

      // Disable "Show X results" button until submission is complete.
      const closeBtn = this.querySelector('.js-close-drawer-mob');
      closeBtn.ariaDisabled = 'true';
      closeBtn.classList.add('is-loading');

      // Fetch filtered products markup.
      let ajax_url = `${window.location.pathname}?${searchParams}`;
      let search_ajax_url = `/search?type=product&${searchParams}`;
      let search_ajax_url_1 = search_ajax_url;
      let search_ajax_url_2 = search_ajax_url;
      let new_link = window.location.pathname.split('?')[0].split('collections/')[1];
      let search_new_link = window.location.pathname.split('?')[0].split('collections/')[1];
      let col_handle = '';
      let catTagDis = '';
      let sortBy = 'title-ascending';
      
      if(searchParams){
        let allflts = searchParams.split('&');
        if(allflts){
          let meta_state = '';
          let meta_discipline = '';
          allflts.forEach(function(a,f){
            let akey = a.split('=')[0];
            if(akey == "i_state"){
              meta_state = a.split('=')[1];
            }
            if(akey == "idiscipline"){
              meta_discipline = a.split('=')[1];
            }
            if(akey == "sort_by"){
              sortBy = a.split('=')[1];
            }
            // if(akey == "promo_codes"){
            //   ajax_url.replace(a, "");
            // }
            // if(akey == "filter.p.m.colibri.promo_codes"){
            //   ajax_url.replace(a, "");
            // }
          });
          if((meta_discipline != '') && (meta_state != '')){
            col_handle = meta_discipline+'-'+meta_state;
            let meta_discipline_tmp = meta_discipline;
            if(meta_discipline == "occupational-therapy-continuing-education"){
              meta_discipline_tmp = "ot";
            }else if(meta_discipline == "physical-therapy-continuing-education"){
              meta_discipline_tmp = "pt";
            }else if(meta_discipline == "speech-language-pathologist-continuing-education"){
              meta_discipline_tmp = "slp";
            }else if(meta_discipline == "athletic-training-continuing-education"){
              meta_discipline_tmp = "atc-lat";
            }else if(meta_discipline == "massage-therapy-continuing-education"){
              meta_discipline_tmp = "mt-lmt";
            }else if(meta_discipline == "certified-strength-and-conditioning-specialist-continuing-education"){
              meta_discipline_tmp = "cscs";
            }else if(meta_discipline == "occupational-therapy-assistant-continuing-education"){
              meta_discipline_tmp = "ota";
            }else if(meta_discipline == "physical-therapy-assistant-continuing-education"){
              meta_discipline_tmp = "pta";
            }
            catTagDis = meta_discipline_tmp+'-'+meta_state;
            localStorage.setItem('selectedState',meta_state);
            localStorage.setItem('selectedDiscipline',meta_discipline);
          }
        }
      }
      if(col_handle !== ""){
        if(window.location.pathname != "/collections/"+col_handle){
          let allflts = searchParams.split('&');
          allflts.forEach(function(a,f){
            let akey = a.split('=')[0];
            if(akey.indexOf("filter.p.m.colibri") > -1){
              allflts = allflts.filter(item => item !== a);
            }
          });
          ajax_url = ajax_url.replace(searchParams, allflts.join('&'));
          search_ajax_url = search_ajax_url.replace(searchParams, allflts.join('&'));
          search_ajax_url_1 = search_ajax_url_1.replace(searchParams, allflts.join('&'));
          search_ajax_url_2 = search_ajax_url_2.replace(searchParams, allflts.join('&'));
        }
        ajax_url = ajax_url.replace(new_link, col_handle);
      }
      if(this.promocode.value !== ""){
        if((this.keyword.value == "") || (this.keyword.value == null)){
          ajax_url = ajax_url+"&filter.p.m.colibri.promo_codes="+this.promocode.value;
        }
        search_ajax_url = search_ajax_url+"&filter.p.m.colibri.promo_codes="+this.promocode.value;
      }
      if(this.keyword.value !== ""){
        search_ajax_url_1 += "&filter.p.m.colibri.additional_tags_1="+catTagDis;
        search_ajax_url_2 += "&filter.p.m.colibri.additional_tags_2="+catTagDis;
        search_ajax_url = search_ajax_url+"&filter.p.tag="+catTagDis;
      }
      let main_url = ajax_url.replace("&filter.p.m.colibri.promo_codes="+this.promocode.value);
      window.history.pushState('new_link', document.getElementsByTagName("title")[0].innerHTML, main_url);
      const response = await fetch(ajax_url);

      if(response.status == 404){
        window.location.href = window.location.href;
      }
      if (response.ok) {
        // if($(document).width() > 1023){
        //   document.querySelector('facet-filters').removeAttribute('open');
        // }
        const tmpl = document.createElement('template');
        tmpl.innerHTML = await response.text();
        this.heading.innerText = tmpl.content.querySelector('#banner_heading').innerText;
        this.breadcrumbs.innerHTML = tmpl.content.querySelector('#collection_breadcrumbs').innerHTML;
        this.heading_count.innerText = tmpl.content.querySelector('#banner_count').innerText;
        this.activeFiltersList.innerHTML = tmpl.content.querySelector('.active-filters').innerHTML;
        if(tmpl.content.querySelector('.active-results-count')){
          this.result_count.innerText = tmpl.content.querySelector('.active-results-count').innerText;
        }
        let keyword_filterable_data = tmpl.content.querySelectorAll('#filter-results .card--product');

        // Update the filters.
        if (this.filteringEnabled) this.updateFilters(tmpl.content, evt);

        // Update the label of the mobile filter button
        closeBtn.innerText = tmpl.content.querySelector('.js-close-drawer-mob').innerText;

        if(this.keyword.value !== ""){
          let search_response = await fetch(search_ajax_url);
          let search_results_grid = null;
          if (search_response.ok) {
            let search_tmpl = document.createElement('template');
            search_tmpl.innerHTML = await search_response.text();
            let count = Number(search_tmpl.content.querySelector('[data-num-results]').getAttribute('data-num-results'));
            if(count > 0){
              search_results_grid = search_tmpl.content.getElementById('products_grid').innerHTML;
            }
            let search_response_1 = await fetch(search_ajax_url_1);
            if (search_response_1.ok) {
              let search_tmpl_1 = document.createElement('template');
              search_tmpl_1.innerHTML = await search_response_1.text();
              if(this.keyword.value !== ""){
                tmpl.content.querySelector('.keyword_search').setAttribute("value", this.keyword.value);
              }
              count += Number(search_tmpl_1.content.querySelector('[data-num-results]').getAttribute('data-num-results'));
              if((count > 0) && (search_tmpl_1.content.getElementById('products_grid').innerHTML !== null)){
                search_results_grid += search_tmpl_1.content.getElementById('products_grid').innerHTML;
              }
              let search_response_2 = await fetch(search_ajax_url_2);
              if (search_response_2.ok) {
                let search_tmpl_2 = document.createElement('template');
                search_tmpl_2.innerHTML = await search_response_2.text();
                if(this.keyword.value !== ""){
                  tmpl.content.querySelector('.keyword_search').setAttribute("value", this.keyword.value);
                }
                count += Number(search_tmpl_2.content.querySelector('[data-num-results]').getAttribute('data-num-results'));
                if(count > 0){
                  if(search_tmpl_2.content.getElementById('products_grid').innerHTML !== null){
                    search_results_grid += search_tmpl_2.content.getElementById('products_grid').innerHTML;
                  }
                  // code for sorting start
                  if((sortBy == "title-ascending") || (sortBy == "title-descending") || (sortBy == "price-ascending") || (sortBy == "price-descending")){
                    const parser = new DOMParser();
                    const doc = parser.parseFromString(search_results_grid, 'text/html');
                    const productElements = doc.querySelectorAll('.js-pagination-result');
                    const products = [];
                    productElements.forEach((productElement) => {
                      const titleElement = productElement.querySelector('.card__title');
                      const priceElement = productElement.querySelector('.price__current');
                      const priceText = Number(priceElement.textContent.trim().replace('$',''));
                      const titleText = titleElement.textContent.trim();
                      const text = (sortBy.indexOf("price") > -1) ? priceText : titleText;
                      products.push({ title: text, element: productElement });
                    });
                    if((sortBy == "title-ascending") || (sortBy == "price-ascending")){
                      products.sort(compareTitlesAsc);
                    }else if((sortBy == "title-descending") || (sortBy == "price-descending")){
                      products.sort(compareTitlesDesc);
                    }
                    search_results_grid = "";
                    products.map((productElement)=>{
                      search_results_grid += productElement.element.outerHTML;
                    });
                  }
                  // code for sorting end
                  tmpl.content.getElementById('products_grid').innerHTML = search_results_grid;
                  let items = tmpl.content.getElementById('products_grid').querySelectorAll('.js-pagination-result');
                  if(count > 24){
                    for(const item of items){
                      item.classList.add('hidden');
                    }
                    tmpl.content.querySelector('[aria-label="Pagination"]').innerHTML = `<div class="custom_pagination pagination--modern ml-auto mr-auto w-full text-center mb-10 custom_ajax_pagination">
                        <span class="custom_pagination-message">Showing 24 of `+count+`</span>
                        <div class="pagination__bar relative mt-4"></div>
                        <a onclick="loadmore()" href="#" class="btn custom_see_more btn--secondary mt-8">
                          Show more
                        </a>
                    </div>`;
                  }
                }else{
                  tmpl.content.getElementById('products_grid').remove();
                  const para = document.createElement("ul");
                  para.setAttribute('id',"products_grid");
                  const node = document.createTextNode("No courses found.");
                  para.appendChild(node);
                  tmpl.content.querySelector('.main-products-grid__results').appendChild(para);
                }
              }
            }
            this.heading_count.innerText = "("+count+" Courses)";
            this.result_count.innerText = "("+count+" Results)";
            if(this.keyword.value !== ""){
              tmpl.content.querySelector('.keyword_search').setAttribute("value", this.keyword.value);
            }
            if(tmpl.content.querySelector('.ajax_pagination') !== null){
              tmpl.content.querySelector('.ajax_pagination').remove();
            }
          }
        }
        if(this.promocode.value !== ""){
          tmpl.content.querySelector('.promo_code').setAttribute("value", this.promocode.value);
        }

        this.filters.innerHTML = tmpl.content.querySelector('.facets__filters').innerHTML;
        if($(document).width() > 1023){
          $('.drawer__content').hide();
          setTimeout(function(){ $('.drawer__content').show(); } ,200);
        }

        // update accreditations for cards
        if(ajax_url.indexOf('?') > -1){
          searchParams = ajax_url.split('?')[1];
        }
        let allflts = searchParams.split('&');
        allflts.forEach(function(a,f){
          let akey = a.split('=');
          if(akey[0].indexOf("filter.p.m.colibri") > -1){
            let input = document.querySelector("input[name='"+akey[0]+"'][value='"+akey[1]+"']");
            if(input !== null){
              input.checked = true;
            }
          }
        });

        if(allflts){
          let meta_state = '';
          let meta_discipline = '';
          allflts.forEach(function(a,f){
            let akey = a.split('=')[0];
            if(akey == "i_state"){
              meta_state = a.split('=')[1];
            }
            if(akey == "idiscipline"){
              meta_discipline = a.split('=')[1];
            }
          });
          let all_cards = tmpl.content.querySelectorAll('product-card');
          if((all_cards) && (all_cards.length > 0)){
            let temp_collection = '/collections/'+meta_discipline+'-'+meta_state;
            if((meta_discipline !== '') && (meta_state !== '')){
              for(const c of all_cards){
                let a_url = c.querySelector('a').getAttribute('href');
                let c_preview = c.querySelector('.preview_c').getAttribute('data-product-url');
                if(!a_url.includes(temp_collection) && !c_preview.includes(temp_collection)){
                  if(c.querySelector('a').classList.contains('membership_card')){
                    c.querySelector('a').setAttribute('href', a_url);
                    c.querySelector('.preview_c').setAttribute('data-product-url',temp_collection+c_preview);
                  }else{
                    c.querySelector('a').setAttribute('href',temp_collection+a_url);
                    c.querySelector('.preview_c').setAttribute('data-product-url',temp_collection+c_preview);
                  }
                }
              }
            }
          }
        }

        // Update the results.
        this.results.innerHTML = tmpl.content.getElementById('filter-results').innerHTML;
        // Reinitialize lazyload images after filters applied.
        if (typeof initLazyImages === 'function') initLazyImages();

        // Reinitialize any custom pagination
        if (customPagination && customPagination.reload) customPagination.reload();

        // Update the URL.

        if (updateUrl) FacetFilters.updateURL(searchParams);
        // $("li.js-pagination-result:hidden").slice(0,24).removeClass('hidden');
        if($(".custom_pagination") && $(".custom_pagination").length > 0){
          let intersectingTimer = null;
          const customPaginationObserver = new IntersectionObserver((entries) => {
              entries.forEach(entry => {
                  if(entry.isIntersecting) {
                    loadmore();
                    intersectingTimer = setInterval(loadmore(), 1000);
                  } else {
                    clearInterval(intersectingTimer);
                  }
              });
          }, { rootMargin: `${window.innerHeight * 1.5}px 0px` });
          customPaginationObserver.observe($(".custom_pagination")[0]);
        }
        // Scroll to the top of the results if needed
        if (this.results.getBoundingClientRect().top < 0) {
          // If the header is sticky, compensate for it when scrolling to elements
          let headerHeight = 0;
          if (document.querySelector('store-header[data-is-sticky="true"]')) {
            headerHeight = Number.parseInt(
              getComputedStyle(this.parentElement)
                .getPropertyValue('--header-height')
                .replace('px', ''),
              10
            ) || 0;
          }
          if(col_handle !== ""){
            window.scrollTo({
              top: this.results.getBoundingClientRect().top + window.scrollY - headerHeight - 45,
              behavior: 'smooth'
            });
          }
        }

        // Enable the "Show X results" button
        closeBtn.classList.remove('is-loading');
        closeBtn.removeAttribute('aria-disabled');

        // Renable infinite scroll
        if (customPagination) customPagination.dataset.pauseInfiniteScroll = 'false';

        // Broadcast the update for anything else to hook into
        document.dispatchEvent(new CustomEvent('on:facet-filters:updated'), { bubbles: true });
      }
      // console.log(response,"=== response");

      this.results.classList.remove('is-loading');
    }

    /**
     * Updates the filters with the fetched data.
     * @param {string} html - HTML of the fetched document.
     * @param {object} evt - Event object.
     */
    updateFilters(html, evt) {
      document.querySelectorAll('.filter').forEach((filter) => {
        const { index } = filter.dataset;
        const fetchedFilter = html.querySelector(`.filter[data-index="${index}"]`);

        if (filter.dataset.type !== 'sort') {
          if (filter.dataset.type === 'price_range') {
            FacetFilters.updateFilter(filter, fetchedFilter, false);

            if (!evt || evt.target.tagName !== 'INPUT') {
              filter.querySelectorAll('input').forEach((input) => {
                input.value = html.getElementById(input.id).value;                
              });
            }
          } else if (evt && evt.target.tagName === 'INPUT') {
            const changedFilter = evt.target.closest('.filter');

            if (changedFilter && changedFilter.dataset) {
              FacetFilters.updateFilter(
                filter,
                fetchedFilter,
                filter.dataset.index !== changedFilter.dataset.index
              );
            }
          } else {
            FacetFilters.updateFilter(filter, fetchedFilter, true);
          }
        }
      });

      
      // Update active filters.
      this.updateActiveFilters(html);

      // Update '[x] results' button (mobile only).
      const footerEl = html.querySelector('.facets__footer');
      this.footer.innerHTML = footerEl.innerHTML;
    }

    /**
     * Updates a filter.
     * @param {Element} filter - Filter element.
     * @param {Element} fetchedFilter - Fetched filter element.
     * @param {boolean} updateAll - Update all filter markup or just toggle/header.
     */
    static updateFilter(filter, fetchedFilter, updateAll) {
      // this is not in use as we are updating entire page HTML
      // if (fetchedFilter) {
      //   filter.hidden = false;
      //   if (updateAll) {
      //     filter.innerHTML = fetchedFilter.innerHTML;
      //   } else {
      //     // Update toggle and header only.
      //     filter.replaceChild(
      //       fetchedFilter.querySelector('.filter__toggle'),
      //       filter.querySelector('.filter__toggle')
      //     );
      //     filter.querySelector('.filter__header').innerHTML = fetchedFilter.querySelector('.filter__header').innerHTML;
      //   }
      // } else {
      //   filter.hidden = true;
      // }
    }

    /**
     * Updates the active filters.
     * @param {string} html - HTML of the fetched page.
     */
    updateActiveFilters(html) {
      const activeFiltersList = html.querySelector('.active-filters');
      const activeFiltersHeader = html.querySelector('.active-filters-header');
      

      this.activeFiltersList.innerHTML = activeFiltersList.innerHTML;
      this.activeFiltersHeader.innerHTML = activeFiltersHeader.innerHTML;
      this.activeFilters.hidden = !this.activeFiltersList.querySelector('.active-filter');
    }

    /**
     * Updates the url with the current filter/sort parameters.
     * @param {string} searchParams - Filter/sort parameters.
     */
    static updateURL(searchParams) {
      window.history.pushState(
        { searchParams },
        '',
        `${window.location.pathname}${searchParams && '?'.concat(searchParams)}`
      );
      // console.log(searchParams,"searchParams -- 350");         
    }
    
  }

  customElements.define('facet-filters', FacetFilters);
}

function loadmore() {
  // Log the first 3 visible elements for debugging

  // Select the first 3 hidden elements and remove the 'hidden' class
  $("li.js-pagination-result:hidden").slice(0, 24).removeClass('hidden');
  let total = $("li.js-pagination-result").length;
  let open = $("li.js-pagination-result:not(.hidden)").length;
  $('.custom_pagination-message').text('Showing '+open+' out of'+total);
  // Check if there are no more hidden elements and remove the pagination control if true
  if ($("li.js-pagination-result:hidden").length == 0) {
    $(".custom_ajax_pagination").remove();
  }
}
// code for sorting start
function compareTitlesAsc(a, b) {
  // Sort ascending by default
  if (a.title < b.title) {
    return -1;
  } else if (a.title > b.title) {
    return 1;
  }
  // If titles are equal, return 0
  return 0;
}
function compareTitlesDesc(a, b) {
  // Sort descending by default
  if (a.title < b.title) {
    return 1;
  } else if (a.title > b.title) {
    return -1;
  }
  // If titles are equal, return 0
  return 0;
}

// code for sorting end
