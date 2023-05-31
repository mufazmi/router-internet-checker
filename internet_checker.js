class InternetChecker {
    isFirst = true;
    retryTimeout = null;
    delayBeforeConnect = 5000;
  
    log = (message, type) => {
      const colors = {
        success: 'White',
        info: 'DodgerBlue',
        error: 'Red',
        warning: 'Orange',
        default: 'black'
      };
  
      const color = colors[type] || colors.default;
      const formattedMessage = `${message} ===> ${new Date()}`;
      console.log(`%c${formattedMessage}`, `color: ${color}`);
    };
  
    checkInternetConnection = async () => {
      try {
        const response = await fetch('https://www.google.com');
        if (response.ok) {
          this.log('INTERNET CONNECTION IS ACTIVE', 'success');
          this.isFirst = true;
          clearTimeout(this.retryTimeout);
        } else {
          this.log('INTERNET CONNECTION IS NOT ACTIVE', 'error');
          this.connect();
        }
      } catch (error) {
        this.log('INTERNET CONNECTION IS NOT ACTIVE', 'error');
        this.connect();
      }
    };
  
    connect = () => {
      if (this.isFirst) {
        this.log('CONNECTING TO THE INTERNET', 'info');
        this.isFirst = false;
        this.makeConnect();
      } else {
        this.log(`SCHEDULED TO CONNECT TO THE INTERNET AFTER ${this.delayBeforeConnect / 1000} SECONDS`, 'warning');
        clearTimeout(this.retryTimeout);
        this.retryTimeout = setTimeout(this.makeConnect, this.delayBeforeConnect);
      }
    };
  
    makeConnect = async () => {
      try {
        await fetch('http://192.168.1.1/userRpm/StatusRpm.htm?Connect=Connect&wan=1', {
          headers: {
            accept: 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.7',
            'accept-language': 'en-US,en;q=0.9',
            authorization: 'Basic VW1haXI6VW1haXI=',
            'upgrade-insecure-requests': '1'
          },
          referrer: 'http://192.168.1.1/userRpm/StatusRpm.htm',
          referrerPolicy: 'strict-origin-when-cross-origin',
          body: null,
          method: 'GET',
          mode: 'cors',
          credentials: 'include'
        });
      } catch (error) {
        console.error('Failed to connect to the internet:', error);
      }
    };
  
    startChecking = () => {
      setInterval(this.checkInternetConnection, 2000);
    };
  }
  
  const internetChecker = new InternetChecker();
  internetChecker.startChecking();
  