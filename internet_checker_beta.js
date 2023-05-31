let isFirst = true;
const MESSAGES = {
  INTERNET_ACTIVE : 'INTERNET CONNECTION IS ACTIVE',
  INTERNET_NOT_ACTIVE : 'INTERNET CONNECTION IS NOT ACTIVE',
  INTERNET_CONNECTING : 'CONNECTING TO THE INTERNET'
}

const TYPES ={
  SUCCESS : 'success',
  INFO : 'info',
  ERROR : 'error',
  WARNING : 'warning',
}

const log = (message, color) => {
    color = color || "black";

    switch (color) {
        case TYPES.SUCCESS:  
             color = "Blue"; 
             break;
        case TYPES.INFO:     
                color = "DodgerBlue";  
             break;
        case TYPES.ERROR:   
             color = "Red";     
             break;
        case TYPES.WARNING:  
             color = "Orange";   
             break;
        default: 
             color = color;
    }
    message = message + ' ===> '+ new Date();
    console.log("%c" + message, "color:" + color);
}

const checkInternet = async () => {
  try {
    const html = await fetchInternet();
    const diagnosticParaValues = extractDiagnosticParaValues(html);

    const status = diagnosticParaValues[2]

    if(status === 53)
    {
      log(MESSAGES.INTERNET_ACTIVE,TYPES.SUCCESS);
      isFirst = true;
      clearTimeout(retryTimeout);
    }else {
      log(MESSAGES.INTERNET_NOT_ACTIVE,TYPES.ERROR);
      connect();
    }
    console.log(diagnosticParaValues);
  } catch (error) {
    console.error('Error:', error);
  }
};

const fetchInternet = async () => {
  const response = await fetch(
    'http://192.168.1.1/userRpm/PingIframeRpm.htm?ping_addr=google.com&doType=ping&isNew=new&sendNum=4&pSize=64&overTime=800&trHops=20',
    {
      headers: {
        accept: 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.7',
        'accept-language': 'en-US,en;q=0.9',
        authorization: 'Basic VW1haXI6VW1haXI=',
        'upgrade-insecure-requests': '1'
      },
      referrer: 'http://192.168.1.1/userRpm/DiagnosticRpm.htm',
      referrerPolicy: 'strict-origin-when-cross-origin',
      body: null,
      method: 'GET',
      mode: 'cors',
      credentials: 'include'
    }
  );

  return response.text();
};

const extractDiagnosticParaValues = (html) => {
  const regex = /var diagnostic_para = new Array\(([^)]+)\)/;
  const match = html.match(regex);

  if (match && match.length > 1) {
    return match[1]
      .split(',')
      .map((value) => value.trim().replace(/^['"]|['"]$/g, ''));
  }

  return [];
};


const checkInternetConnection = () => {
  const xhr = new XMLHttpRequest();
  const timeout = 2000; 

  xhr.onload = () => {
    if (xhr.status >= 200 && xhr.status < 300) {
      log(MESSAGES.INTERNET_ACTIVE,TYPES.SUCCESS);
      isFirst = true;
      clearTimeout(retryTimeout);
    } else {
      log(MESSAGES.INTERNET_NOT_ACTIVE,TYPES.ERROR);
      connect();
    }
  };

  xhr.onerror = () => {
    log(MESSAGES.INTERNET_NOT_ACTIVE,TYPES.ERROR);
    connect();
  };

  xhr.ontimeout = () => {
    log(MESSAGES.INTERNET_NOT_ACTIVE,TYPES.ERROR);
    connect();
  };

  xhr.timeout = timeout;

  xhr.open('GET', 'https://www.google.com', true);
  xhr.send();
};

let retryTimeout = null; 
const delayBeforeConnect = 5000;

const connect = () => {
  if (isFirst) {
    log(MESSAGES.INTERNET_CONNECTING,TYPES.INFO);
    isFirst = false;
    makeConnect();
  } else {
    log(`SCHEDULED TO CONNECT TO THE INTERNET AFTER ${delayBeforeConnect / 1000} SECONDS ====> `, new Date(),TYPES.WARNING);
    clearTimeout(retryTimeout); 
    retryTimeout = setTimeout(makeConnect, delayBeforeConnect); 
  }
};

const makeConnect = async () => {
  await fetch("http://192.168.1.1/userRpm/StatusRpm.htm?Connect=Connect&wan=1", {
    headers: {
      accept: "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.7",
      "accept-language": "en-US,en;q=0.9",
      authorization: "Basic VW1haXI6VW1haXI=",
      "upgrade-insecure-requests": "1"
    },
    referrer: "http://192.168.1.1/userRpm/StatusRpm.htm",
    referrerPolicy: "strict-origin-when-cross-origin",
    body: null,
    method: "GET",
    mode: "cors",
    credentials: "include"
  });
};

setInterval(checkInternet, 2000);
