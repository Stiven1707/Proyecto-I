import unittest
import requests

class TestCreateTokenAPI(unittest.TestCase):
    
    def setUp(self):
        # Configuración común para todas las pruebas
        self.base_url = 'http://127.0.0.1:8000/api/token/'

    def print_test_result(self, test_name, response):
        print(f"\n----------------- CREATE TOKEN ------------------------------")
        print(f"\nTest: {test_name}")
        print(f"Status Code: {response.status_code}")
        print(f"Response: {response.text}")
        print("----------------------------------------------------------------")

    def assert_request_status(self, response, expected_status_code):
        self.assertEqual(
            response.status_code,
            expected_status_code,
            f"Expected status code {expected_status_code}, but got {response.status_code}. Response: {response.text}"
        )

    def test_create_token_Email_NoExist(self):
        data = {
            "email": "jnauta@unicauca.edu.co",
            "password": "juancarlos123"
        }
        
        response = requests.post(self.base_url, json=data)
        self.print_test_result("Create Token with Email No Exist", response)
        self.assert_request_status(response, 401)

    def test_create_token_wrongPassword(self):
        data = {
            "email": "jneuta@unicauca.edu.co",
            "password": "juanclos123"
        }
        
        response = requests.post(self.base_url, json=data)
        self.print_test_result("Create Token with Wrong Password", response)
        self.assert_request_status(response, 401)

    def test_create_token_Valid(self):
        data = {
            "email": "jneuta@unicauca.edu.co",
            "password": "juancarlos123"
        }
        
        response = requests.post(self.base_url, json=data)
        self.print_test_result("Create Token Valid", response)
        self.assert_request_status(response, 200)


class TestCreateUserAPI(unittest.TestCase):
    def setUp(self):
        # Configuración común para todas las pruebas
        self.base_url = 'http://127.0.0.1:8000/api/user/'
        self.headers = {
            'Authorization': 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ0b2tlbl90eXBlIjoiYWNjZXNzIiwiZXhwIjoxNjk5NTY1Mjk4LCJpYXQiOjE2OTk1NjQ5OTgsImp0aSI6IjFkMDdhMDcyZjM3ZjQ2MGQ4ZDdiYTE1YmM0NTFmZDE5IiwidXNlcl9pZCI6MSwidXNlcm5hbWUiOiJqbmV1dGEiLCJpZCI6MSwiZnVsbF9uYW1lIjoiSnVhbiBDYXJsb3MgTmV1dGEgTW9udGVuZWdybyIsInJvbCI6MX0.ulKP0xGYfhYRITu1BvEijted8_TOosknOb5VSukrCFs'
        }

    def print_test_result(self, test_name, response):
        print(f"\n----------------------- CREATE USER -------------------------")
        print(f"\nTest: {test_name}")
        print(f"Status Code: {response.status_code}")
        print(f"Response: {response.text}")
        print("----------------------------------------------------------------")

    def assert_request_status(self, response, expected_status_code):
        self.assertEqual(
            response.status_code,
            expected_status_code,
            f"Expected status code {expected_status_code}, but got {response.status_code}. Response: {response.text}"
        )

    def test_create_user_invalid_username_length(self):
        data = {
            "rol": 3,
            "username": "TheQuickBrownFoxJumpedOverTheLazyDogAndContinuedRunningThroughTheMeadowWhileEnjoyingTheBeautifulSunse123456",
            "email": "jmontes@unicauca.edu.co",
            "password": "jmontes123",
            "password2": "jmontes123",
        }
        
        response = requests.post(self.base_url, json=data, headers=self.headers)
        self.print_test_result("Create User with Invalid Username Length", response)
        self.assert_request_status(response, 400)

    
    def test_create_user_invalid_email_format(self):
        data = {
            "rol": 3,
            "username": "jmontes", 
            "email": "jmontes.unicauca.edu.co", 
            "password": "jmontes123", 
            "password2": "jmontes123", 
        }
        
        response = requests.post(self.base_url, json=data, headers=self.headers)
        self.print_test_result("Create user Invalid Email Format", response)
        self.assert_request_status(response, 400)

    def test_create_user_invalid_password_length(self):
        data = {
            "rol": 3,
            "username": "jmontes",
            "email": "jmontes@unicauca.edu.co",
            "password": "jmontes",
            "password2": "jmontes",
        }
        
        response = requests.post(self.base_url, json=data, headers=self.headers)
        self.print_test_result("Create User with Invalid Password Length", response)
        self.assert_request_status(response, 400)


    def test_create_user_valid(self):
        data = {
            "rol": 3,
            "username": "jmontes",
            "email": "jmontes@unicauca.edu.co",
            "password": "jmontes123",
            "password2": "jmontes123",
        }
        
        response = requests.post(self.base_url, json=data, headers=self.headers)
        self.print_test_result("Create User VALID", response)
        self.assert_request_status(response, 201)


"""
class TestUpdateUserAPI(unittest.TestCase):
    def setUp(self):
        # Configuración común para todas las pruebas
        self.base_url = 'http://127.0.0.1:8000/api/user/5/'
        self.headers = {
            'Authorization': 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ0b2tlbl90eXBlIjoiYWNjZXNzIiwiZXhwIjoxNjk5NTY1Mjk4LCJpYXQiOjE2OTk1NjQ5OTgsImp0aSI6IjFkMDdhMDcyZjM3ZjQ2MGQ4ZDdiYTE1YmM0NTFmZDE5IiwidXNlcl9pZCI6MSwidXNlcm5hbWUiOiJqbmV1dGEiLCJpZCI6MSwiZnVsbF9uYW1lIjoiSnVhbiBDYXJsb3MgTmV1dGEgTW9udGVuZWdybyIsInJvbCI6MX0.ulKP0xGYfhYRITu1BvEijted8_TOosknOb5VSukrCFs'
        }

    def print_test_result(self, test_name, response):
        print(f"\nTest: {test_name}")
        print(f"Status Code: {response.status_code}")
        print(f"Response: {response.text}")

    def assert_request_status(self, response, expected_status_code):
        self.assertEqual(
            response.status_code,
            expected_status_code,
            f"Expected status code {expected_status_code}, but got {response.status_code}. Response: {response.text}"
        )

    def test_update_user_invalid_username_length(self):
        data = {
            "rol": 1,
            "username": "TheQuickBrownFoxJumpedOverTheLazyDogAndContinuedRunningThroughTheMeadowWhileEnjoyingTheBeautifulSunse123456",
            "email": "egomez@unicauca.edu.co"
        }
        
        response = requests.put(self.base_url, json=data, headers=self.headers)
        self.print_test_result("Update User with Invalid Username Length", response)
        self.assert_request_status(response, 400)

    def test_update_user_invalid_username_Exist(self):
        data = {
            "rol": 1,
            "username": "jneuta",
            "email": "egomez@unicauca.edu.co"
        }
        
        response = requests.put(self.base_url, json=data, headers=self.headers)
        self.print_test_result("Update User with Invalid Username Exist", response)
        self.assert_request_status(response, 400)
    
    def test_update_user_invalid_email_Exist(self):
        data = {
            "rol": 1,
            "username": "egomez", 
            "email": "jneuta@unicauca.edu.co"
        }
        
        response = requests.put(self.base_url, json=data, headers=self.headers)
        self.print_test_result("Update user Invalid Email Exist", response)
        self.assert_request_status(response, 400)

    def test_update_user_invalid_email_format(self):
        data = {
            "rol": 1,
            "username": "egomez", 
            "email": "egomez.unicauca.edu.co"
        }
        
        response = requests.put(self.base_url, json=data, headers=self.headers)
        self.print_test_result("Update user Invalid Email Format", response)
        self.assert_request_status(response, 400)

    def test_update_user_valid(self):
        data = {
            "rol": 1,
            "username": "egomez",
            "email": "egomez@unicauca.edu.co"
        }
        
        response = requests.put(self.base_url, json=data, headers=self.headers)
        self.print_test_result("Update User VALID", response)
        self.assert_request_status(response, 201)
"""

if __name__ == '__main__':
    unittest.main()
