if(window.ConsoleNavService){(function(i){var u="nav_CSATSurvey";var f=function(){return new Date().getTime()},r=f(),x=i("#awsc-mezz-locale").attr("content"),A=ConsoleNavService.Model.currentService,m=(A?A.id:null),F,B,h,j,D=200,z="&#9734;",c="&#9733;",y=10000,w=10000,p="custsat-prompt",q=false,e;if(window.AWSC&&AWSC.Clog&&AWSC.Clog.log){e=AWSC.Clog.log}else{e=function(){}}e("custsat-js-loaded",1);if(!x){e("custsat-locale-not-found",1);return}if(!m){e("custsat-console-not-found",1);return}var s=function(G){G.type="POST";G.contentType="application/x-www-form-urlencoded";G.data=JSON.stringify(G.data);i.ajax(G)};var l=function(){i(window).trigger("resize")};var C=function(){B.html(z)};var d=function(){F=i("#awsc-custsat");B=i(".awsc-custsat-star");h=i("#awsc-custsat-close");j=i("#awsc-custsat-morefeedback");e({pageId:u,key:"view_survey"});C();B.on({"mouseenter.custsat":o,"focus.custsat":o,"mouseleave.custsat":a,"click.custsat":g});h.on({"click.custsat":v});j.on({"click.custsat":E});F.slideDown({duration:D,complete:l})};var k=function(){F.slideUp({duration:D,complete:function(){F.remove();l()}})};var v=function(){n(0);var G=q?"click_close":"click_dismiss";e({pageId:u,key:G});k()};var o=function(){C();i(this).prevAll().andSelf().html(c)};var a=function(){C()};var g=function(){var G=i(this).attr("data-awsc-custsat-rating");e({pageId:u,key:"click_rating",value:G});q=true;n(G);b()};var E=function(){i("#feedback").click();e({pageId:u,key:"click_feedback"});return false};var n=function(H){var G=f(),J=G-r,I="https://"+AWSC.NavUrl.getRegionlessDomain()+"/feedback/custsat/1/rate/"+H;s({url:I,data:{locale:x,service:m},xhrFields:{withCredentials:true},timeout:w});e("custsat-rate-time",J);n=function(){}};var b=function(){F.addClass("thanks").removeClass("prompt")};var t=function(){var G="https://"+AWSC.NavUrl.getRegionlessDomain()+"/feedback/custsat/1/popquestion";if(location.search){G+=location.search}i.ajax({url:G,type:"GET",data:{locale:x,service:m},xhrFields:{withCredentials:true},dataType:"json",timeout:y,cache:false,success:function(H){if(H&&H.prompt===true&&H.question&&H.thanks){i("#awsc-custsat-question").html(H.question);i("#awsc-custsat-thanks").html(H.thanks);i(function(){d();e(p,1)})}else{e(p,0)}},error:function(){e(p,0)}})};t()})(ConsoleNavService.jQuery)};