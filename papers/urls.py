from django.urls import path
from . import views, views_papers


urlpatterns = [
    # path('<str:pk>/<slug:org_slug>/copy/', views.copy_view, name='copy'),
    path('<str:pk>/download/', views.download_view, name='download'),
    path('<str:pk>/preview/', views.PreviewView.as_view(), name='preview'),
    path('<slug:slug>/', views.category_view, name='category'),
    path('', views.index_view, name='index'),
    path('paper/<int:pk>/export/', views.export_view, name='download_docx'),

    path('@<slug:org_slug>/plataforma/', views_papers.index_view, name='ensayo_plataforma'),
    path('<str:pk>/<slug:org_slug>/copy/', views_papers.copy_view, name='copys'),
    path('@<slug:org_slug>/<int:pk>/look_paper/', views_papers.look_paper_view, name='look_paper')
]

app_name = 'papers'
