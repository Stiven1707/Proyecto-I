import unittest
import requests

class TestUserAPI(unittest.TestCase):
    def setUp(self):
        # Configuración común para todas las pruebas
        self.base_url = 'http://127.0.0.1:8000/api/user/'
        self.headers = {
            'Authorization': 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ0b2tlbl90eXBlIjoiYWNjZXNzIiwiZXhwIjoxNjk4MDk5OTMzLCJpYXQiOjE2OTgwOTk2MzMsImp0aSI6IjVmYWVhZDMzYzUxYzQzNTRhYTg0N2ZjMDQzNTliYmM3IiwidXNlcl9pZCI6MSwidXNlcm5hbWUiOiJqbmV1dGEiLCJpZCI6MSwiZnVsbF9uYW1lIjoiIiwicm9sIjoxfQ.FJsXBjuWrbGXFeF6wEcsJcW6M6M89FKFBQH825d2av0'
        }

    def test_create_user_invalid_username_length(self):
        data = {
            "rol": 3,  # Clase de Equivalencia 11
            "username": "TheQuickBrownFoxJumpedOverTheLazyDogAndContinuedRunningThroughTheMeadowWhileEnjoyingTheBeautifulSunse123456",  # Clase de Equivalencia 22
            "email": "jmontes@unicauca.edu.co",  # Clase de Equivalencia 31
            "password": "jmontes123",  # Clase de Equivalencia 41
            "password2": "jmontes123",  # Clase de Equivalencia 51
        }
        
        response = requests.post(self.base_url, json=data, headers=self.headers)

        print(f"Función: test_create_user_invalid_username_length, status_code: {response.status_code}")
        print(f"Respuesta: {response.text}")

    def test_create_user_invalid_email_format(self):
        data = {
            "rol": 3,  # Clase de Equivalencia 11
            "username": "jmontes",  # Clase de Equivalencia 21
            "email": "jmontes.unicauca.edu.co",  # Clase de Equivalencia 32
            "password": "jmontes123",  # Clase de Equivalencia 41
            "password2": "jmontes123",  # Clase de Equivalencia 51
        }
        
        response = requests.post(self.base_url, json=data, headers=self.headers)

        print(f"Función: test_create_user_invalid_email_format, status_code: {response.status_code}")
        print(f"Respuesta: {response.text}")

    def test_create_user_invalid_password_length(self):
        data = {
            "rol": 3,  # Clase de Equivalencia 11
            "username": "jmontes",  # Clase de Equivalencia 21
            "email": "jmontes@unicauca.edu.co",  # Clase de Equivalencia 31
            "password": "jmontes",  # Clase de Equivalencia 42
            "password2": "jmontes",  # Clase de Equivalencia 52
        }
        
        response = requests.post(self.base_url, json=data, headers=self.headers)

        print(f"Función: test_create_user_invalid_password_length, status_code: {response.status_code}")
        print(f"Respuesta: {response.text}")


    def test_create_user_valid(self):
        data = {
            "rol": 3,  # Clase de Equivalencia 11
            "username": "jmontes",  # Clase de Equivalencia 21
            "email": "jmontes@unicauca.edu.co",  # Clase de Equivalencia 31
            "password": "jmontes123",  # Clase de Equivalencia 41
            "password2": "jmontes123",  # Clase de Equivalencia 51
        }
        
        response = requests.post(self.base_url, json=data, headers=self.headers)

        print(f"Función: test_create_user_valid, status_code: {response.status_code}")
        print(f"Respuesta:{response.text}")

if __name__ == '__main__':
    unittest.main()
