import uuid
from django.db import models
from django.conf import settings
from sorl.thumbnail.fields import ImageField
from taggit.managers import TaggableManager


class Paper(models.Model):
    uuid = models.UUIDField(default=uuid.uuid4, editable=False)
    title = models.CharField('标题', max_length=200)
    preview = ImageField(
        '预览图', upload_to='uploads/%Y%m/%d', blank=True, null=True)
    data = models.JSONField('数据', blank=True, default=dict)
    creator = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL, blank=True, null=True,
        verbose_name='创建人'
    )
    tags = TaggableManager('标签', blank=True)
    created_at = models.DateTimeField('创建时间', auto_now_add=True)
    updated_at = models.DateTimeField('更新时间', auto_now=True)

    def __str__(self):
        return self.title

    class Meta:
        ordering = ['-created_at']
