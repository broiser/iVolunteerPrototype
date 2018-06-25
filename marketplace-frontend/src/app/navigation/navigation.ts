export const navigation = [
  {
    'id': 'dashboard',
    'title': 'Dashboard',
    'type': 'item',
    'icon': 'dashboard',
    'url': '/main'
  },
  {
    'id': 'profile',
    'title': 'Profile',
    'type': 'item',
    'icon': 'person',
    'url': '/main/profile'
  },
  {
    'id': 'calendar',
    'title': 'Calendar',
    'type': 'item',
    'icon': 'today',
    'url': '/main/calendar'
  },
  {
    'id': 'tasks',
    'title': 'Tasks',
    'type': 'collapse',
    'icon': 'work',
    'children': [
      {
        'id': 'available-tasks',
        'title': 'Available',
        'type': 'item',
        'url': '/main/tasks/available'
      },
      {
        'id': 'upcomming-tasks',
        'title': 'Upcomming',
        'type': 'item',
        'url': '/main/tasks/upcomming'
      },
      {
        'id': 'running-tasks',
        'title': 'Running',
        'type': 'item',
        'url': '/main/tasks/running'
      },
      {
        'id': 'finished-tasks',
        'title': 'Finished',
        'type': 'item',
        'url': '/main/tasks/finished'
      }
    ]
  },
  {
    'id': 'competencies',
    'title': 'Competencies',
    'type': 'item',
    'icon': 'widgets',
    'url': '/main/competencies'
  }
];

