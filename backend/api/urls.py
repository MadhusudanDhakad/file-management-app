# from django.urls import path
# from .views import (
#     CustomTokenObtainPairView, UserRegistrationView, UserProfileView,
#     AddressListCreateView, AddressDetailView, FileUploadView,
#     FileListView, FileDownloadView, DashboardView, FileDeleteView,
# )
# from rest_framework_simplejwt.views import (
#     TokenObtainPairView,
#     TokenRefreshView,
# )

# urlpatterns = [
#     path('login/', CustomTokenObtainPairView.as_view(), name='token_obtain_pair'),
#     path('token/refresh/', TokenRefreshView.as_view(), name='token_refresh'),
#     path('register/', UserRegistrationView.as_view(), name='register'),
#     path('profile/', UserProfileView.as_view(), name='profile'),
#     path('addresses/', AddressListCreateView.as_view(), name='address-list'),
#     path('addresses/<int:pk>/', AddressDetailView.as_view(), name='address-detail'),
#     path('files/upload/', FileUploadView.as_view(), name='file-upload'),
#     path('files/', FileListView.as_view(), name='file-list'),
#     path('files/<int:pk>/download/', FileDownloadView.as_view(), name='file-download'),
#     path('dashboard/', DashboardView.as_view(), name='dashboard'),
#     path('files/<int:pk>/', FileDeleteView.as_view(), name='file-delete'),
# ]


from django.urls import path
from .views import (
    CustomTokenObtainPairView, UserRegistrationView, UserProfileView,
    AddressListCreateView, AddressDetailView, FileUploadView,
    FileListView, FileDownloadView, DashboardView, FileDeleteView,
)
from rest_framework_simplejwt.views import TokenRefreshView

urlpatterns = [
    # Authentication
    path('auth/login/', CustomTokenObtainPairView.as_view(), name='token_obtain_pair'),
    path('auth/refresh/', TokenRefreshView.as_view(), name='token_refresh'),
    path('auth/register/', UserRegistrationView.as_view(), name='register'),
    
    # User endpoints
    path('user/profile/', UserProfileView.as_view(), name='profile'),
    
    # Address endpoints
    path('user/addresses/', AddressListCreateView.as_view(), name='address-list'),
    path('user/addresses/<int:pk>/', AddressDetailView.as_view(), name='address-detail'),
    
    # File endpoints
    path('files/upload/', FileUploadView.as_view(), name='file-upload'),
    path('files/', FileListView.as_view(), name='file-list'),
    path('files/<int:pk>/download/', FileDownloadView.as_view(), name='file-download'),
    path('files/<int:pk>/', FileDeleteView.as_view(), name='file-delete'),
    
    # Dashboard
    path('dashboard/', DashboardView.as_view(), name='dashboard'),
]