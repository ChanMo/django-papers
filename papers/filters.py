import re
from django.db.models import Q
import django_filters
from django_filters import rest_framework as filters
from .models import Paper


class PaperFilter(django_filters.FilterSet):
    class Meta:
        model = Paper
        fields = ('category', 'grade')


class PaperAPIFilter(filters.FilterSet):
    source = filters.CharFilter(
        method='filter_source',
    )

    def filter_source(self, queryset, name, value):
        return queryset

    # @property
    # def qs(self):
    #     source = self.form.cleaned_data['source']
    #     parent = super().qs
    #     if not source:
    #         # 如果是平台
    #         return parent.filter(org__isnull=True)
    #     elif re.match(r'^(\d+)s$', source):
    #         # 如果是学校端
    #         return parent.filter(
    #             Q(org__pk=source)|Q(Q(org__isnull=True) & Q(is_template=True))
    #         )
    #     elif re.match(r'^(\d+)$', source):
    #         # 如果是学校端
    #         return parent.filter(org__pk=source)
    #     elif source == 'wxa':
    #         # 如果是小程序
    #         return parent.filter(org__isnull=True, is_published=True)

    #     return parent

    class Meta:
        model = Paper
        fields = ('category', 'source', 'ptype')
