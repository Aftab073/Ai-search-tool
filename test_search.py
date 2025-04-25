import requests
import urllib3

# Disable SSL verification warnings
urllib3.disable_warnings(urllib3.exceptions.InsecureRequestWarning)

def test_search():
    url = 'http://127.0.0.1:8000/api/search/'
    headers = {'Content-Type': 'application/json'}
    data = {'query': 'artificial intelligence'}

    try:
        # Explicitly use HTTP and disable SSL verification
        response = requests.post(url, json=data, headers=headers, verify=False)
        print('Status Code:', response.status_code)
        print('Response Headers:')
        for key, value in response.headers.items():
            print(f'{key}: {value}')
        print('\nResponse Body:')
        print(response.text)
    except Exception as e:
        print('Error:', str(e))

if __name__ == '__main__':
    test_search() 