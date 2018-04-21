var proxy = require('express-http-proxy');
var app = require('express')();
var port = process.env.PORT || '4000';

 
var HTMLParser = require('fast-html-parser');


app.use('/knrequests', proxy('https://www.kn.kz', {
  proxyReqPathResolver: function(req) {
	console.log('i am done first ---- krisha');
	return new Promise(function (resolve, reject) {
	  setTimeout(function () {   // simulate async
		// in this case I expect a request to /proxy => localhost:12345/a/different/path
		var resolvedPathValue = req.originalUrl.split('knrequests')[1];
		console.log(resolvedPathValue);
		resolve(resolvedPathValue);
	  }, 200);
	});
  },
  userResDecorator: function(proxyRes, proxyResData) {
    return new Promise(function(resolve) {	  
      setTimeout(function() {	
		var doc = HTMLParser.parse(proxyResData.toString('utf8'));
		var o = {};
		o.hrefs = [];
		o.imgs = [];
		o.descs = [];
		o.ishot = [];
		var ar = doc.querySelectorAll('li.results-item.object-row');

		if(ar.length !== 0){
			for(var i=0; i<ar.length; i++){
				var atag = ar[i].querySelector('.wr a').rawAttrs.split(" ")[1];
				o.hrefs.push(atag);      
				
				var imgtag = ar[i].querySelector('.wr noindex').childNodes[1];
				if(imgtag.tagName === "img"){
					imgtag = imgtag.rawAttrs.split(" ")[0];
				}
				if(imgtag.tagName === "div"){
					imgtag = imgtag.rawAttrs;
				}
				o.imgs.push(imgtag);
				
				
				var titletag = ar[i].querySelector('.results-item-wrapper').childNodes[1].childNodes[0].rawText.replace(/\n|\s{2,}/g,"");
				
				
				var pricetag = ar[i].querySelector('.results-item-price').childNodes; 
				
				var len = pricetag.length - 1;
				pricetag = 'за ' + pricetag[len].rawText.replace(/\n|\s{2,}/g,"");

				var subtitletag = ar[i].querySelector('.results-item-descr').childNodes[0].rawText.replace(/\n|\s{2,}/g,"");
				
				
				
				var hottag = ar[i].querySelector(".object-lifted-block-img");
				var toptag = "";
				if(hottag){
					toptag = "Было поднято";
				}else{
					toptag = "";
				}
				

				var mas = [];
				mas.push(titletag);
				mas.push(pricetag);
				mas.push(subtitletag);
				var strdesc = mas.join(" ");
				o.descs.push(strdesc);
				o.ishot.push(toptag);	
			}
			console.log(o)
			console.log('**************************************');
			resolve(o);
		}else{
			console.log("Увы, нет таких объявлений");
			console.log('**************************************');
			resolve("Увы, нет таких объявлений");
		}
      }, 200);
    });
  }
}));


app.listen(port);