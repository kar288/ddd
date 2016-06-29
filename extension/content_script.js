document.body.style.backgroundColor = 'red';
console.log('Turning ' + window.location.href + ' red!');
var iframe = document.createElement('iframe');
iframe.setAttribute('src', 'http://localhost:7007/start');
iframe.style.position = 'absolute';
iframe.style.top = '0';
document.body.appendChild(iframe);
