$( document ).ready(function() { 
    
    $(".bundle_products .bundle-item").click(function() {
       $(this).toggleClass('active');  
     });
     
   
    $(".product-form__submit").click(function(event) {
     event.preventDefault();  
      
     let arr = [];
     let i = 0;
     $('.bundle_products .bundle-item.active').each(function(){ 
       arr[i++] = $(this).attr('data-id');
        });

        let items=arr.map((element)=>{
              return {id:element,quantity:1}
          
        })
     

      fetch(window.Shopify.routes.root + 'cart.js').then(response => response.json())
      .then(data => {
           if(data.items.length>0){
                                      const hasMatchingVariant=data.items.filter(function(item) {
                                                  return arr.includes(item.variant_id.toString());
                                      });
                                       
                                      const hasNotMatchingVariant=arr.filter(function(item) {
                                                  const numValue = Number(item);
                                                  return !data.items.some(item => item.variant_id === numValue);
                                      });
                                       
                                    const isPackage=data.items.some(item => item.product_type.toString() === "Package");
                                     if(hasNotMatchingVariant.length>0){
                                         let items=hasNotMatchingVariant.map((element)=>{
                                              return {id:element,quantity:1}
                                         })
                                       console.log("hasNotMatchingVariant",hasNotMatchingVariant)
                                        let formData = {
                                            'items': items
                                          };
                                             fetch(window.Shopify.routes.root + 'cart/add.js', {
                                                  method: 'POST',
                                                  headers: {
                                                    'Content-Type': 'application/json'
                                                  },
                                                  body: JSON.stringify(formData)
                                                })
                                                .then(response => {
                                                   window.location.href = "/cart"
                                                })
                                                .catch((error) => {
                                                  console.error('Error:', error);
                                                });
                                     }
                                   
                                    if (isPackage === true){
                                        
                                        if(hasMatchingVariant.length>0){
                                       let updates = {};
                                      var transformedArray = hasMatchingVariant.forEach(item => {
                                            let variantId = item.variant_id;
                                            updates[variantId] = 1;
                                          });
                                    
                                       fetch(window.Shopify.routes.root + 'cart/update.js', {
                                                    method: 'POST',
                                                    headers: {
                                                      'Content-Type': 'application/json'
                                                    },
                                                    body: JSON.stringify({updates})
                                                  })
                                                    .then(response => {
                                                       window.location.href = "/cart"
                                                      return response.json();
                                                    })
                                                    .catch((error) => {
                                                      console.error('Error:', error);
                                                    });
                                     
                                     }else{
                                      let formData = {
                                       'items': items
                                      };
                                   fetch(window.Shopify.routes.root + 'cart/add.js', {
                                        method: 'POST',
                                        headers: {
                                          'Content-Type': 'application/json'
                                        },
                                        body: JSON.stringify(formData)
                                      })
                                      .then(response => {
                                         window.location.href = "/cart"
                                      })
                                      .catch((error) => {
                                        console.error('Error:', error);
                                      });
                                     }        
                                    }
                                    else{
                                      let formData = {
                                       'items': items
                                      };
                                   fetch(window.Shopify.routes.root + 'cart/add.js', {
                                        method: 'POST',
                                        headers: {
                                          'Content-Type': 'application/json'
                                        },
                                        body: JSON.stringify(formData)
                                      })
                                      .then(response => {
                                         window.location.href = "/cart"
                                      })
                                      .catch((error) => {
                                        console.error('Error:', error);
                                      });
                                    }
                                     
                                 }
           else{
               let formData = {
                 'items': items
                };
             fetch(window.Shopify.routes.root + 'cart/add.js', {
                  method: 'POST',
                  headers: {
                    'Content-Type': 'application/json'
                  },
                  body: JSON.stringify(formData)
                })
                .then(response => {
                   window.location.href = "/cart"
                })
                .catch((error) => {
                  console.error('Error:', error);
                });
           }

      
            })
     
      }); 
      });
     
     //  var newvalue = newstr;
      
     //  Shopify.queue = [];
     //    var quantity =1;
     //    var newArray = newvalue.toString().split(',');
     //    for (var i = 0; i < newArray.length; i++) {
     //      product = newArray[i];
     //      Shopify.queue.push({
     //        variantId: product,
     //      });
     //    }
       
      
     //    Shopify.moveAlong = function() {
       
     //    if (Shopify.queue.length) {
     //      var request = Shopify.queue.shift();
     //      var data = 'id='+ request.variantId + '&quantity=1'

     //      $.ajax({
     //          url: '/cart.js',
     //          type: 'GET',
     //          dataType: 'json', // Change the datatype according to your response type
     //          success: function(data) {
     //              console.log(data);
     //          },
     //          error: function(xhr, status, error) {
     //              console.error(status + ': ' + error);
     //          }
     //      });

          
     //      $.ajax({
     //        type: 'POST',
     //        url: '/cart/add.js',
     //        dataType: 'json',
     //        data: data,
     //        success: function(res){
     //          Shopify.moveAlong();
              
     //          //submit form after sucess 
     //             // setTimeout(function(){
     //             //    // $('.product-form').submit();
     //             //   window.location.href = "/cart";
     //             // }, 1500);
                
              
     //       },
     //           error: function(){
     //       // if it's not last one Move Along else update the cart number with the current quantity
            
     //        }
     //         });
          // }
       // If the queue is empty, we add 1 to cart
      /*else {
        quantity += 1;
        addToCartOk(quantity);
       } */
          
         // };
      // Shopify.moveAlong();
    
     