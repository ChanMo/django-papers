from django.urls import path
from django.shortcuts import render, get_object_or_404, redirect
from django.contrib.auth.mixins import LoginRequiredMixin
from django.contrib.auth.decorators import login_required
from django.views.generic import ListView, DetailView
from django.core.paginator import Paginator
from django.contrib import messages
from django.http import FileResponse
from django_filters.views import FilterView

from utils.mixins import SearchMixin
from courses.models import Category
from .models import Paper
from .serializers import PaperSerializer
from .filters import PaperFilter
from .utils import export_docx


@login_required
def index_view(request, **kwargs):
    # recent_papers = Paper.objects.filter(creator__user=request.user).order_by('-updated_at')[0:6]
    search = request.GET.get('search', '')
    # qs = Paper.objects.filter()
    # print([(i.title,i.org) for i in qs])
    qs = Paper.objects.filter(org=request.org)
    if search:
        qs = qs.filter(title__icontains=search)

    f = PaperFilter(request.GET, queryset=qs)
    paginator = Paginator(f.qs, 12)
    p = paginator.get_page(request.GET.get('page'))
    context = {
        # 'recent_list': recent_papers,
        'search': search,
        'filter': f,
        'paginator': p,
        'categories': Category.objects.root_nodes()
    }
    return render(request, 'papers/index2.html', context)


@login_required
def create_view(request, **kwargs):
    t = request.GET.get('t')
    if t and t != 'null' and Paper.objects.filter(id=t).exists():
        temp = Paper.objects.get(id=t)
        ins = Paper.objects.create(
            title=temp.title,
            preview=temp.preview,
            category=temp.category,
            description=temp.description,
            data=temp.data,
            org=request.org,
            creator=request.user
        )
        return redirect(f'/@{kwargs["org_slug"]}/papers/{ins.pk}/update/')

    context = {}
    return render(request, 'papers/paper.html', context)


@login_required
def update_view(request, pk, **kwargs):
    obj = get_object_or_404(Paper, pk=pk)
    context = {
        'object':obj,
        'object_json': PaperSerializer(obj).data
    }
    return render(request, 'papers/paper.html', context)


@login_required
def delete_view(request, pk, **kwargs):
    obj = get_object_or_404(Paper, pk=pk)
    if request.method == 'POST':
        obj.delete()
        messages.success(request, '删除成功')
        return redirect('orgs:papers:index', org_slug=kwargs['org_slug'])

    context = {
        'title': '删除试卷',
        'obj':obj
    }
    return render(request, 'papers/delete_confirm.html', context)


@login_required
def preview_view(request, pk, **kwargs):
    obj = get_object_or_404(Paper, pk=pk)
    props = {
        'data': PaperSerializer(obj).data
    }
    context = {
        'props': props
    }
    return render(request, 'papers/export.html', context)


@login_required
def export_view(request, pk, **kwargs):
    obj = get_object_or_404(Paper, pk=pk)
    res = export_docx(obj)
    return FileResponse(open(res, 'rb'))




urlpatterns = [
    path('<int:pk>/delete/', delete_view, name='delete'),
    path('<int:pk>/update/', update_view, name='update'),
    path('create/', create_view, name='create'),
    path('', index_view, name='index'),
    path('<int:pk>/export/', export_view, name='export'),
    path('<int:pk>/preview/', preview_view, name='preview'),
]

app_name = 'papers'
