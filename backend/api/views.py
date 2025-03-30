from django.shortcuts import render
from django.contrib.auth.hashers import make_password
from rest_framework import generics, permissions, status
from rest_framework.response import Response
from rest_framework.views import APIView
from .models import User, Address, UploadedFile
from .serializers import (
    UserSerializer, AddressSerializer, UploadedFileSerializer,
    UserProfileSerializer, FileUploadSerializer, CustomTokenObtainPairSerializer
)
from rest_framework_simplejwt.views import TokenObtainPairView
from django.shortcuts import get_object_or_404
from django.db.models import Count

from django.contrib.auth import authenticate
from rest_framework.decorators import api_view 

import logging
logger = logging.getLogger(__name__)


@api_view(['POST'])
def test_auth(request):
    email = request.data.get('email')
    password = request.data.get('password')
    user = authenticate(request, email=email, password=password)
    if user:
        return Response({'status': 'success', 'user': user.email})
    return Response({'status': 'failed'}, status=400)


class CustomTokenObtainPairView(TokenObtainPairView):
    serializer_class = CustomTokenObtainPairSerializer

    def post(self, request, *args, **kwargs):
        # logger.info(f"Login attempt for email: {request.data.get('email')}")
        # response = super().post(request, *args, **kwargs)
        # logger.info(f"Login response status: {response.status_code}")
        # return response
        # Add debug logging
        print(f"Login attempt for email: {request.data.get('email')}")
        
        # Manually verify credentials first
        email = request.data.get('email')
        password = request.data.get('password')
        user = authenticate(request, email=email, password=password)
        
        if user is None:
            print("Authentication failed - invalid credentials")
            return Response({'detail': 'Invalid email or password'}, status=401)
        
        if not user.is_active:
            print("Authentication failed - user inactive")
            return Response({'detail': 'User account is disabled'}, status=401)
        
        # Proceed with token generation
        return super().post(request, *args, **kwargs)

class UserRegistrationView(generics.CreateAPIView):
    queryset = User.objects.all()
    serializer_class = UserSerializer
    permission_classes = [permissions.AllowAny]

    def perform_create(self, serializer):
        # Ensure password is properly hashed
        # user = serializer.save(is_active=True)
        # user.set_password(serializer.validated_data['password'])
        # user.save()
        # password = make_password(serializer.validated_data['password'])
        # serializer.save(password=password)
        password = serializer.validated_data.pop('password')
        user = serializer.save()
        user.set_password(password)  # Properly hash the password
        user.is_active = True  # Explicitly activate user
        user.save()
        print(f"New user created: {user.email} (active: {user.is_active})")

class UserProfileView(generics.RetrieveUpdateAPIView):
    serializer_class = UserProfileSerializer
    permission_classes = [permissions.IsAuthenticated]
    
    def get_object(self):
        return self.request.user

class AddressListCreateView(generics.ListCreateAPIView):
    serializer_class = AddressSerializer
    permission_classes = [permissions.IsAuthenticated]
    
    def get_queryset(self):
        return Address.objects.filter(user=self.request.user)
    
    def perform_create(self, serializer):
        serializer.save(user=self.request.user)

class AddressDetailView(generics.RetrieveUpdateDestroyAPIView):
    serializer_class = AddressSerializer
    permission_classes = [permissions.IsAuthenticated]
    
    def get_queryset(self):
        return Address.objects.filter(user=self.request.user)

class FileUploadView(APIView):
    permission_classes = [permissions.IsAuthenticated]
    
    def post(self, request, *args, **kwargs):
        serializer = FileUploadSerializer(data=request.data)
        if serializer.is_valid():
            uploaded_file = request.FILES['file']
            file_obj = UploadedFile.objects.create(
                user=request.user,
                file=uploaded_file,
                original_filename=uploaded_file.name
            )
            file_serializer = UploadedFileSerializer(file_obj, context={'request': request})
            return Response(file_serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

class FileListView(generics.ListAPIView):
    serializer_class = UploadedFileSerializer
    permission_classes = [permissions.IsAuthenticated]
    
    def get_queryset(self):
        return UploadedFile.objects.filter(user=self.request.user).order_by('-upload_date')

class FileDownloadView(APIView):
    permission_classes = [permissions.IsAuthenticated]
    
    def get(self, request, pk, *args, **kwargs):
        file_obj = get_object_or_404(UploadedFile, pk=pk, user=request.user)
        response = Response()
        response['Content-Disposition'] = f'attachment; filename={file_obj.original_filename}'
        response['X-Accel-Redirect'] = file_obj.file.url
        return response

class DashboardView(APIView):
    permission_classes = [permissions.IsAuthenticated]
    
    def get(self, request, *args, **kwargs):
        # Total files uploaded by the user
        total_files = UploadedFile.objects.filter(user=request.user).count()
        
        # Breakdown by file type
        file_types = UploadedFile.objects.filter(user=request.user).values('file_type').annotate(count=Count('file_type'))
        
        # For admin: number of files uploaded by each user
        if request.user.is_staff:
            users_files = User.objects.annotate(file_count=Count('files')).values('email', 'file_count')
        else:
            users_files = None
        
        return Response({
            'total_files': total_files,
            'file_types': list(file_types),
            'users_files': users_files,
        })
    

class FileDeleteView(generics.DestroyAPIView):
    permission_classes = [permissions.IsAuthenticated]
    queryset = UploadedFile.objects.all()
    
    def get_queryset(self):
        return self.queryset.filter(user=self.request.user)
    
    def perform_destroy(self, instance):
        # Delete the file from storage
        instance.file.delete()
        # Delete the database record
        instance.delete()