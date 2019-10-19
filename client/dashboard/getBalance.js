let balance = 0;
function getBal(){
    theUrl = "http://127.0.0.1:3000/ethBalance?accountIndex=0"
    doCall(theUrl, (res) => {
        document.getElementById('ethBalance').innerHTML = `<span class="count">${(res / 1000000000000000000).toFixed(8)}</span>`;
        document.getElementById('usdBalance').innerHTML = ((res * 200) / 100000000000000000000).toFixed(2);
    })
}

function populateDAI(){
    let ethVal = document.getElementById('ethToDaiEth').value;
    let daiVal = ethVal * 200;
    document.getElementById('ethToDaiDai').value = daiVal;
}

function doCall(theUrl, callback)
{
    var xmlHttp = new XMLHttpRequest();
    xmlHttp.onreadystatechange = function() { 
        if (xmlHttp.readyState == 4 && xmlHttp.status == 200)
            callback(xmlHttp.responseText);
    }
    xmlHttp.open("GET", theUrl, true); // true for asynchronous 
    xmlHttp.send(null);
}
getBal();