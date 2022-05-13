from rest_framework import filters
from rest_framework.viewsets import ModelViewSet
from rest_framework.routers import DefaultRouter
from rest_framework.permissions import IsAuthenticated
from .models import Paper
from .serializers import PaperSerializer, BasePaperSerializer


class PaperViewSet(ModelViewSet):
    permission_classes = [IsAuthenticated]
    serializer_class = PaperSerializer
    queryset = Paper.objects.all()
    search_fields = ('title', )
    filter_backends = [filters.SearchFilter]

    def get_serializer_class(self):
        if self.action == 'list':
            return BasePaperSerializer
        return super().get_serializer_class()

    def perform_create(self, serializer):
        serializer.save(
            creator=self.request.user,
        )


router = DefaultRouter()
router.register('', PaperViewSet)

urlpatterns = router.urls
