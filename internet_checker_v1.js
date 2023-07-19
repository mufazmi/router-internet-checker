class InternetChecker {
  isFirst = true;
  retryTimeout = null;
  delayBeforeConnect = 5000;
  googleRequest = null;

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
      const controller = new AbortController();
      const timeoutId = setTimeout(() => {
        controller.abort();
        this.log('INTERNET CONNECTION REQUEST TIMED OUT', 'error');
        this.connect();
      }, 5000);

      const response = await fetch('https://www.google.com', { signal: controller.signal });
      clearTimeout(timeoutId);

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
    if (this.googleRequest && this.googleRequest.status !== 'completed') {
      this.log('Google request is already pending. Waiting for it to complete.', 'warning');
      return;
    }

    try {
      this.googleRequest = {
        status: 'pending',
        abortController: new AbortController()
      };

      const timeoutId = setTimeout(() => {
        this.googleRequest.abortController.abort();
        this.googleRequest.status = 'timed_out';
        console.error('Failed to connect to Google: Request timed out');
      }, 5000);

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
        credentials: 'include',
        signal: this.googleRequest.abortController.signal
      });

      clearTimeout(timeoutId);
      this.googleRequest.status = 'completed';
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
