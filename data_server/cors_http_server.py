from http.server import HTTPServer, SimpleHTTPRequestHandler
import json
from datetime import datetime
import time

class CORSRequestHandler(SimpleHTTPRequestHandler):
    def end_headers(self):
        self.send_header('Access-Control-Allow-Origin', '*')
        self.send_header('Access-Control-Allow-Methods', '*')
        self.send_header('Access-Control-Allow-Headers', '*')
        self.send_header('Cache-Control', 'no-store, no-cache, must-revalidate')
        return super().end_headers()

httpd = HTTPServer(('localhost', 8003), CORSRequestHandler)
print("Serving at port 8003")
httpd.serve_forever()