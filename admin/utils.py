def is_admin(user):
    return bool(user and user.is_authenticated and user.role == 'admin')
