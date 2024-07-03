document.addEventListener("DOMContentLoaded", function () {
  let productHours = parseInt(document.querySelector(".product-info__block.product_list_bundle").getAttribute("data-product-hours"));
  let checkboxes = document.querySelectorAll(".bundle_input");
  checkboxes.forEach(function (checkbox) {
    checkbox.addEventListener("change", function () {
      let totalHours = 0;
      productHours = this.parentElement.parentElement.getAttribute("data-product-format-hours");
      let format = this.parentElement.parentElement.getAttribute("data-format");
      let variant_id = document.querySelector('.price-with-addcart [name="id"]').value;
      bundle_courses(variant_id);
      // let bundle_courses_validation = bundle_courses(variant_id);
      // let group = [];
      // let group_hours = 0;
      // let total_group_hours = 0;
      // if(bundle_courses_validation){
      //   group = bundle_courses_validation['group'];
      //   group_hours = bundle_courses_validation['group_hours'];
      // }
      checkboxes.forEach(function (cb) {
        if (cb.getAttribute("data-format") == format) {
          if (cb.checked) {
            totalHours += parseInt(cb.getAttribute("data-hours"));
          }
        }
        // if(group_hours > 0){
        //   if(jQuery.inArray(format.toLowerCase(), group) !== -1){
        //     if (cb.checked) {
        //       total_group_hours += parseInt(cb.getAttribute("data-hours"));
        //     }
        //   }
        // }
      });
      let remaining = productHours - totalHours;
      // let group_remaining = group_hours - total_group_hours;
      // console.log(totalHours, total_group_hours, group_remaining);
      if (totalHours > productHours) {
        checkbox.checked = false;
      }
      checkboxes.forEach(function (cb) {
        if (cb.getAttribute("data-format") == format) {
          if ((cb.checked == false && parseInt(cb.getAttribute("data-hours")) > remaining) || (totalHours >= productHours && !cb.checked)) {
            cb.disabled = true;
          } else {
            cb.disabled = false;
          }
        }
        // if(group_hours > 0){
        //   if(jQuery.inArray(cb.getAttribute("data-format").toLowerCase(), group) !== -1){
        //     if (cb.checked == false && (parseInt(total_group_hours) >= parseInt(group_hours))) {
        //       cb.disabled = true;
        //     }else{
        //       cb.disabled = false;
        //     }
        //   }
        // }
      });
    });
  });

  // Function to check if any checkbox is checked
  function checkIfAnyChecked() {
    if ($(".bundle_input:checked").length > 0) {
      $(".js-product-form-main .product-form__submit").prop("disabled", false);
    } else {
      $(".js-product-form-main .product-form__submit").prop("disabled", true);
    }
  }

  // Attach event listener to each checkbox input
  $(".bundle_input").on("change", function () {
    checkIfAnyChecked();
  });

  // Initially check if any checkbox is checked
  checkIfAnyChecked();
});

function bundle_courses(variant_id) {
  let jsonA = JSON.parse(document.getElementById("custom-product-json").textContent);
  let metaData = jsonA[Number(variant_id)];
  let group = [];
  let group_hours = 0;
  if (jQuery("#iFunction_2").val() && jQuery("#iOperation_2").val()) {
    let format_hours_list =
      metaData["bundle_hours"][jQuery("#iFunction_2").val()][jQuery("#iOperation_2").val()]["hours"];
    let c_hours = Number(metaData["contact_hours"]);
    let t_hours = 0;
    let v_hours = 0;
    let w_hours = 0;
    let txt = "You can choose ";
    for (let key in format_hours_list) {
      if (key.split("-").length > 1) {
        group = key.split("-");
        group_hours = format_hours_list[key];
      } else {
        if (key == "text") {
          t_hours = Number(format_hours_list[key]);
          txt += t_hours;
        }
        if (key == "video") {
          v_hours = Number(format_hours_list[key]);
          txt += v_hours;
        }
        if (key == "webinar") {
          w_hours = Number(format_hours_list[key]);
          txt += w_hours;
        }
        txt += " Hours from " + key + ", ";
      }
    }
    if (group.length > 0) {
      for (const key of group) {
        if (key == "text") {
          t_hours = Number(group_hours);
        }
        if (key == "video") {
          v_hours = Number(group_hours);
        }
        if (key == "webinar") {
          w_hours = Number(group_hours);
        }
      }
      txt += group_hours + " Hours from " + group.join(", ");
    }
    jQuery(".product-info__block .format_hours").text(txt);
    jQuery("#courseHours").text(c_hours);
    jQuery(".product-form-cart .product_list_bundle").attr(
      "data-product-hours",
      c_hours
    );
    jQuery(
      ".product-form-cart .product_list_bundle .product-info__block[data-format='Text']"
    ).attr("data-product-format-hours", t_hours);
    jQuery(
      ".product-form-cart .product_list_bundle .product-info__block[data-format='Text'] #formatHours"
    ).text(t_hours);
    jQuery(
      ".product-form-cart .product_list_bundle .product-info__block[data-format='Video']"
    ).attr("data-product-format-hours", v_hours);
    jQuery(
      ".product-form-cart .product_list_bundle .product-info__block[data-format='Video'] #formatHours"
    ).text(v_hours);
    jQuery(
      ".product-form-cart .product_list_bundle .product-info__block[data-format='Webinar']"
    ).attr("data-product-format-hours", w_hours);
    jQuery(
      ".product-form-cart .product_list_bundle .product-info__block[data-format='Webinar'] #formatHours"
    ).text(w_hours);
  }
  // return {group, group_hours};
}

$(function(){
  let variant_id = document.querySelector('.price-with-addcart [name="id"]').value;
  console.log(variant_id);
  bundle_courses(variant_id);
})