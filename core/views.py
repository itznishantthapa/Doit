from django.shortcuts import render


def privacy(request):
    return render(request, 'privacy.html')


def terms(request):
    return render(request, 'terms.html')


def support(request):
    return render(request, 'support.html', {
        'support_email': 'itsnishantu@gmail.com',
    })
