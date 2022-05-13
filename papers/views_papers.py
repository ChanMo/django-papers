from django_filters.views import FilterView
from django.contrib.auth.decorators import login_required
from django.shortcuts import get_object_or_404, redirect, render
from django.contrib import messages
from django.http import HttpResponse
from django.core.paginator import Paginator

from courses.models import Category, Grade
from orgs.serializers import OrgSerializer
from utils.tags import get_hotest_tags
from .models import Paper
from .filters import PaperFilter
from orgs.models import Org
from .serializers import PaperSerializer


def index_view(request, org_slug):
    search = request.GET.get('search', '')
    qs = Paper.objects.filter(org__isnull=True, is_template=True).order_by('-published_at')
    if search:
        qs = qs.filter(title__icontains=search)
    categories = Category.objects.filter(is_recommend=True)
    f = PaperFilter(request.GET, queryset=qs)
    paginator = Paginator(f.qs, 12)
    p = paginator.get_page(request.GET.get('page'))

    context = {
        'search': search,
        'filter': f,
        'paginator': p,
        'categories': Category.objects.root_nodes()
    }
    return render(request, 'papers/index3.html', context)


@login_required
def copy_view(request, pk, org_slug):
    # copy to private papers repository
    obj = get_object_or_404(Paper, pk=pk)
    org = get_object_or_404(Org, slug=org_slug, staff__user=request.user)
    paper = Paper.objects.create(
        title = f'[复制]{obj.title}',
        description = obj.description,
        preview = obj.preview,
        category = obj.category,
        grade = obj.grade,
        data = obj.data,
        style = obj.style,
        org = org,
        creator = request.user,
    )

    messages.success(request, '复制成功')
    return redirect(f'/@{org_slug}/papers/{paper.id}/update/')


@login_required
def look_paper_view(request, pk, **kwargs):
    obj = get_object_or_404(Paper, pk=pk)
    context = {
        'object':obj,
        'object_json': PaperSerializer(obj).data
    }
    return render(request, 'papers/look_paper.html', context)