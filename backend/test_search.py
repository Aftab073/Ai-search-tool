import requests

def test_search():
    url = 'http://127.0.0.1:8000/api/search/'
    headers = {'Content-Type': 'application/json'}
    data = {'query': 'artificial intelligence'}

    try:
        response = requests.post(url, json=data, headers=headers)
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