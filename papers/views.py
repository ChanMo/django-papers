from django.core.paginator import Paginator
from django.contrib.contenttypes.models import ContentType
from django.contrib.auth.mixins import LoginRequiredMixin
from django.views.generic.detail import SingleObjectMixin
from django_filters.views import FilterView
from django.contrib.auth.decorators import login_required
from django.shortcuts import get_object_or_404, redirect, render
from django.http import FileResponse
from django.contrib import messages

from utils.mixins import SearchMixin
from utils.generic import ReactView
from orgs.models import Org
from courses.models import Category, Grade
from orgs.serializers import OrgSerializer
from utils.tags import get_hotest_tags
from .serializers import PaperSerializer
from .models import Paper
from .utils import export_docx, export_docx_answer, export_all_docx_answer


def export_view(request, pk):
    obj = get_object_or_404(Paper, pk=pk)
    status = request.GET.get('status')
    status = int(status)
    res = None
    if status == 1:
        # 导出试卷
        res = export_docx(obj)
    elif status == 2:
        # 导出答案及解析
        res = export_docx_answer(obj)
    else:
        # 导出试卷 ，试卷后面跟答案解析
        res = export_all_docx_answer(obj)
    return FileResponse(open(res, 'rb'))


def index_view(request):
    # tags = get_hotest_tags(ContentType.objects.get_for_model(Paper))
    latest_list = Paper.objects.filter(org__isnull=True, is_template=True).order_by('-published_at')[0:4]
    categories = Category.objects.filter(is_recommend=True)
    # grades = Grade.objects.all() #

    context = {
        # 'tags': tags,
        'latest_list': latest_list,
        'categories': categories,
        # 'grades': grades
    }
    return render(request, 'papers/index.html', context)


def category_view(request, slug):
    category = get_object_or_404(Category, slug=slug)
    paginator = Paginator(category.paper_set.filter(is_template=True), 12)
    page_number = request.GET.get('page')
    page_obj = paginator.get_page(page_number)
    context = {
        'category': category,
        'page_obj': page_obj,
        'categories': Category.objects.filter(is_recommend=True)
    }
    return render(request, 'papers/category.html', context)



class PreviewView(LoginRequiredMixin, SingleObjectMixin, ReactView):
    model = Paper
    app_root = 'src/paperPreview.jsx'
    template_name = 'papers/preview.html'
    def get_queryset(self):
        return super().get_queryset().filter(org__isnull=True)

    def dispatch(self, request, *args, **kwargs):
        self.object = self.get_object()
        return super().dispatch(request, *args, **kwargs)

    def get_props_data(self):
        props = super().get_props_data()
        props['paper'] = PaperSerializer(self.object).data
        orgs = Org.objects.filter(staff__user=self.request.user, is_active=True)
        props['orgs'] = OrgSerializer(orgs, many=True).data
        return props

    def get_context_data(self, **kwargs):
        context = super().get_context_data(**kwargs)
        context['categories'] = Category.objects.filter(is_recommend=True)
        context['category'] = self.object.category
        return context



@login_required
def download_view(request, pk):
    obj = get_object_or_404(Paper, pk=pk)
    res = export_docx(obj)
    return FileResponse(open(res, 'rb'))


@login_required
def copy_view(request, pk, org_slug):
    # copy to private papers repository
    obj = get_object_or_404(Paper, pk=pk)
    org = get_object_or_404(Org, slug=org_slug, staff__user=request.user)
    Paper.objects.create(
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
    return redirect(f'/@{org_slug}/papers/')
