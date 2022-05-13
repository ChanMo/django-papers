from django.contrib import admin
from django.shortcuts import get_object_or_404, render
from django.utils.html import format_html
from django.urls import path
from .models import Paper


@admin.register(Paper)
class PaperAdmin(admin.ModelAdmin):
    list_display = ('title', 'show_tags', 'creator', 'updated_at', 'extra_actions')
    list_per_page = 12
    list_filter = ('created_at', 'updated_at')
    search_fields = ('title', 'creator__username', 'tags__name')

    @admin.display(description='标签')
    def show_tags(self, obj):
        return ','.join(obj.tags.names())

    @admin.display(description='操作')
    def extra_actions(self, obj):
        return format_html(
            '<a href="{0}/edit/">编辑</a>',
            obj.pk
        )

    def get_urls(self):
        urls = super().get_urls()
        my_urls = [
            path('<int:pk>/edit/', self.edit_view),
        ]
        return my_urls + urls


    def edit_view(self, request, pk):
        obj = get_object_or_404(Paper, pk=pk)
        context = {
            'props': {
                'paper': pk,
                'user': request.user.username
            }
        }
        return render(request, 'admin/papers/paper/edit.html', context)
