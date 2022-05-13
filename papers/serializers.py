from rest_framework import serializers
from taggit.serializers import TagListSerializerField, TaggitSerializer
from .models import Paper

class BasePaperSerializer(TaggitSerializer, serializers.ModelSerializer):
    creator = serializers.HiddenField(
        default=serializers.CurrentUserDefault()
    )
    tags = TagListSerializerField()
    class Meta:
        model = Paper
        read_only_fields = ('creator',)
        exclude = ('data', )

    def to_representation(self, instance):
        ret = super().to_representation(instance)
        if instance.creator:
            ret['creator_name'] = instance.creator.username
        return ret


class PaperSerializer(BasePaperSerializer):
    class Meta:
        model = Paper
        read_only_fields = ('creator',)
        fields = '__all__'
