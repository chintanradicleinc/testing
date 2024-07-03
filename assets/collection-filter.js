$(window).on('load', function() {
  let url = window.location.pathname;
  // Generic logic
  function defaultDropdown(){
    let state_selected = $('#iFunction').val();
    let disc_selected = $('#iOperation').val();
    if((state_selected == "") || (state_selected == null)){
      document.getElementById("iOperation").disabled=true;
      document.getElementById("button1").disabled=true;
    }else{
      document.getElementById("iOperation").disabled=false;
      if((state_selected != "") && (state_selected != null) && (disc_selected != "") || (disc_selected != null)){
        document.getElementById("button1").disabled=false;
      }else{
        document.getElementById("button1").disabled=true;
      }
    }
  }
  if(url != "/"){
    if(localStorage.getItem('selectedStateRequirement')) {
     $('.template-metaobject_ce_requirements #iFunction, .template-page_ce-requirements #iFunction').val(localStorage.getItem('selectedStateRequirement'));
    }
    if(localStorage.getItem('selectedDisciplineRequirement') == 'pt' || localStorage.getItem('selectedDisciplineRequirement') == 'physical-therapy'){  
     $('.template-metaobject_ce_requirements #iOperation, .template-page_ce-requirements #iOperation').val('physical-therapy')
    } 
    else if(localStorage.getItem('selectedDisciplineRequirement') == 'ot' || localStorage.getItem('selectedDisciplineRequirement') == 'occupational-therapy'){  
     $('.template-metaobject_ce_requirements #iOperation, .template-page_ce-requirements #iOperation').val('occupational-therapy')
    } 
    else if(localStorage.getItem('selectedDisciplineRequirement') == 'slp' || localStorage.getItem('selectedDisciplineRequirement') == 'speech-language-pathology'){  
     $('.template-metaobject_ce_requirements #iOperation, .template-page_ce-requirements #iOperation').val('speech-language-pathology')
    } 
    else if(localStorage.getItem('selectedDisciplineRequirement') == 'atc-lat' || localStorage.getItem('selectedDisciplineRequirement') == 'athletic-training'){  
     $('.template-metaobject_ce_requirements #iOperation, .template-page_ce-requirements #iOperation').val('athletic-training')
    } 
    else if(localStorage.getItem('selectedDisciplineRequirement') == 'mt-lmt' || localStorage.getItem('selectedDisciplineRequirement') == 'massage-therapy'){  
     $('.template-metaobject_ce_requirements #iOperation, .template-page_ce-requirements #iOperation').val('massage-therapy')
    }
    // if(localStorage.getItem('selectedDisciplineRequirement') == '' || localStorage.getItem('selectedDisciplineRequirement') == null ){ 
    //   document.getElementById("iOperation").disabled=false;
    //   document.getElementById("button1").disabled=false;
    // }
 }
  if(document.getElementById("iOperation")){
    defaultDropdown();
  }
  $('#iFunction').on('change', function() {
    defaultDropdown();
  });
});


function disabledBtn(){
  if(document.getElementById("iOperation").value != ""){
     document.getElementById("button1").disabled=false;
  }else{
    document.getElementById("button1").disabled=true;
  }
}

$(window).on('load', function() {
  var toggleDropdown_2 = function(iFunction_2) {
    var hasOwner_2 = typeof iFunction_2 !== typeof undefined && iFunction_2;
    $('.new_category #iOperation_2').prop('disabled', !hasOwner_2).val('');
    $('.new_category #button1').prop('disabled', !hasOwner_2).val('');
  }
});


