from rest_framework import serializers
from .models import User, Address, UploadedFile
from rest_framework_simplejwt.serializers import TokenObtainPairSerializer

class CustomTokenObtainPairSerializer(TokenObtainPairSerializer):
    @classmethod
    def get_token(cls, user):
        token = super().get_token(user)
        token['email'] = user.email
        token['username'] = user.username
        return token
    
    def validate(self, attrs):
        data = super().validate(attrs)
        data['email'] = self.user.email
        data['username'] = self.user.username
        if not self.user.is_active:
            raise serializers.ValidationError("User account is disabled.")
        return data

class UserSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True)

    class Meta:
        model = User
        fields = ['id', 'email', 'username', 'phone_number', 'password']

    def create(self, validated_data):
        # Create user with hashed password
        user = User.objects.create_user(
            email=validated_data['email'],
            username=validated_data['username'],
            password=validated_data['password'],
            phone_number=validated_data.get('phone_number', '')
        )
        return user

class AddressSerializer(serializers.ModelSerializer):
    class Meta:
        model = Address
        fields = ['id', 'street', 'city', 'state', 'postal_code', 'country', 'is_default']
    
    def validate(self, data):
        if data.get('is_default'):
            user = self.context['request'].user
            Address.objects.filter(user=user).update(is_default=False)
        return data

class UploadedFileSerializer(serializers.ModelSerializer):
    user = UserSerializer(read_only=True)
    file_url = serializers.SerializerMethodField()
    
    class Meta:
        model = UploadedFile
        fields = ['id', 'user', 'original_filename', 'file_type', 'upload_date', 'file_url']
    
    def get_file_url(self, obj):
        request = self.context.get('request')
        if obj.file and hasattr(obj.file, 'url'):
            return request.build_absolute_uri(obj.file.url)
        return None

class UserProfileSerializer(serializers.ModelSerializer):
    addresses = AddressSerializer(many=True, read_only=True)
    
    class Meta:
        model = User
        fields = ['id', 'email', 'username', 'phone_number', 'addresses']
    
    def update(self, instance, validated_data):
        instance.username = validated_data.get('username', instance.username)
        instance.phone_number = validated_data.get('phone_number', instance.phone_number)
        instance.save()
        return instance

class FileUploadSerializer(serializers.Serializer):
    file = serializers.FileField()
    
    def validate_file(self, value):
        max_size = 10 * 1024 * 1024  # 10MB
        if value.size > max_size:
            raise serializers.ValidationError("File size exceeds 10MB limit.")
        return value