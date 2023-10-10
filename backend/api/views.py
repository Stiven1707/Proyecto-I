from django.shortcuts import render

# Create your views here.
from .models import Profile, User, Propuesta
from .serializer import UserSerializer, ProfileSerializer, MyTokenObtainPairSerializer, RegisterSerializer, PropuestaSerializer
from rest_framework import generics, status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework_simplejwt.views import TokenObtainPairView
from rest_framework.response import Response
# Create your views here.
class MyTokenObtainPairView(TokenObtainPairView):
    serializer_class = MyTokenObtainPairSerializer

class RegisterView(generics.CreateAPIView):
    queryset = User.objects.all()
    permission_classes = ([AllowAny])
    serializer_class = RegisterSerializer

@api_view(['GET', 'POST'])
@permission_classes([IsAuthenticated])
def dashboard(request):
    if request.method == 'GET':
        response = f"Hello, {request.user}, you are seeing a GET request"
        return Response({'response': response}, status=status.HTTP_200_OK)
    elif request.method == 'POST':
        text = request.data.get('text')
        response = f"Hello, {request.user}, you are seeing a POST request, and you sent this text: {text}"
        return Response({'response': response}, status=status.HTTP_200_OK)
    return Response({}, status=status.HTTP_400_BAD_REQUEST)

class ProfileUpdateAPIView(generics.UpdateAPIView):
    
    serializer_class = ProfileSerializer
    permission_classes = ([IsAuthenticated])

    def get_queryset(self):
        #return self.get_serializer().Meta.model.objects.filter(state = True)
        return self.get_serializer().Meta.model.objects.filter(user=self.request.user)

class PropuestaList(generics.ListCreateAPIView):
    serializer_class = PropuestaSerializer
    grups_required = ['profesor']
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        grups_user = self.request.user.groups.all().values('name')
        print("user_permisson: ", self.request.user.user_permissions.all()  )
        #imprimir grupos
        print("user_groups: ", grups_user )
        for grupo in grups_user:
            if grupo['name'] in self.grups_required:
                #Solo sus propias propuestas(profesor)
                return Propuesta.objects.filter(user=self.request.user) 
        #(Estudiante) Todas las propuestas que estan activas
        return Propuesta.objects.filter(pro_estado="ACTIVO")