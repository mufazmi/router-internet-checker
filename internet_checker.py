import requests
from datetime import datetime

class InternetChecker:
    def __init__(self):
        self.is_first = True
        self.retry_timeout = None
        self.delay_before_connect = 5  # seconds
  
    def log(self, message, type):
        colors = {
            'success': 'White',
            'info': 'DodgerBlue',
            'error': 'Red',
            'warning': 'Orange',
            'default': 'black'
        }
  
        color = colors.get(type, colors['default'])
        formatted_message = f'{message} ===> {datetime.now()}'
        print(f'\033[0;{color}m{formatted_message}\033[0m')
  
    def check_internet_connection(self):
        try:
            response = requests.get('https://www.google.com')
            if response.ok:
                self.log('INTERNET CONNECTION IS ACTIVE', 'success')
                self.is_first = True
                self.clear_retry_timeout()
            else:
                self.log('INTERNET CONNECTION IS NOT ACTIVE', 'error')
                self.connect()
        except requests.exceptions.RequestException as error:
            self.log('INTERNET CONNECTION IS NOT ACTIVE', 'error')
            self.connect()
  
    def connect(self):
        if self.is_first:
            self.log('CONNECTING TO THE INTERNET', 'info')
            self.is_first = False
            self.make_connect()
        else:
            self.log(f'SCHEDULED TO CONNECT TO THE INTERNET AFTER {self.delay_before_connect} SECONDS', 'warning')
            self.clear_retry_timeout()
            self.retry_timeout = self.set_retry_timeout(self.make_connect, self.delay_before_connect)
  
    def make_connect(self):
        try:
            requests.get('http://192.168.1.1/userRpm/StatusRpm.htm?Connect=Connect&wan=1', headers={
                'accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.7',
                'accept-language': 'en-US,en;q=0.9',
                'authorization': 'Basic VW1haXI6VW1haXI=',
                'upgrade-insecure-requests': '1'
            })
        except requests.exceptions.RequestException as error:
            print(f'Failed to connect to the internet: {error}')
  
    def start_checking(self):
        self.check_internet_connection()
        while True:
            self.check_internet_connection()
  
    def clear_retry_timeout(self):
        if self.retry_timeout:
            self.retry_timeout.cancel()
            self.retry_timeout = None
  
    def set_retry_timeout(self, func, seconds):
        from threading import Timer
        t = Timer(seconds, func)
        t.start()

internet_checker = InternetChecker()
internet_checker.start_checking()
