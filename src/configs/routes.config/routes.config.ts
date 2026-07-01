import { lazy } from 'react'
import authRoute from './authRoute'
import othersRoute from './othersRoute'
import type { Routes } from '@/@types/routes'

export const publicRoutes: Routes = [...authRoute]

export const protectedRoutes: Routes = [
    {
        key: 'dashboard',
        path: '/admin/dashboard',
        component: lazy(() => import('@/views/Dashboard/Dashboard')),
        authority: [],
    },
    {
        key: 'users',
        path: '/admin/users',
        component: lazy(() => import('@/views/Users/Users')),
        authority: [],
    },
    {
        key: 'users',
        path: '/admin/userdetails/:id',
        component: lazy(() => import('@/views/Users/UserDetails/UserDetails')),
        authority: [],
    },
    {
        key: 'resetpassword',
        path: '/admin/reset-password',
        component: lazy(() => import('@/views/auth/ResetPassword')),
        authority: [],
    },
    {
        key: 'theme',
        path: `/admin/theme`,
        component: lazy(() => import('@/views/Theme/Theme')),
        authority: [],
    },
    {
        key: 'theme',
        path: `/admin/theme_details`,
        component: lazy(() => import('@/views/Theme/ThemeDetails/ThemeDetails')),
        authority: [],
    },
    {
        key: 'theme',
        path: `/admin/addtheme`,
        component: lazy(() => import('@/views/Theme/AddTheme/AddTheme')),
        authority: [],
    },
    {
        key: 'category',
        path: `/admin/category`,
        component: lazy(() => import('@/views/Category/Category')),
        authority: [],
    },
    {
        key: 'subcategory',
        path: `/admin/subcategory`,
        component: lazy(() => import('@/views/SubCategory/SubCategory')),
        authority: [],
    },
    {
        key: 'music',
        path: `/admin/music`,
        component: lazy(() => import('@/views/Music/Music')),
        authority: [],
    },
    {
        key: 'music',
        path: `/admin/addmusic`,
        component: lazy(() => import('@/views/Music/AddMusic/AddMusic')),
        authority: [],
    },
    {
        key: 'music',
        path: `/admin/music_details`,
        component: lazy(() => import('@/views/Music/MusicDetails/MusicDetails')),
        authority: [],
    },
    {
        key: 'subscribers',
        path: `/admin/subscribers`,
        component: lazy(() => import('@/views/Subscribers/Subscribers')),
        authority: [],
    },
    {
        key: 'setting',
        path: `/admin/setting`,
        component: lazy(() => import('@/views/Setting/Setting')),
        authority: [],
    },
    {
        key: 'notificationsend',
        path: `/admin/notificationsend`,
        component: lazy(() => import('@/views/NotificationSend/NotificationSend')),
        authority: [],
    },
    {
        key: 'notificationsend',
        path: `/admin/musiclist`,
        component: lazy(() => import('@/views/NotificationSend/MusicList')),
        authority: [],
    },
    {
        key: 'about',
        path: '/admin/about',
        component: lazy(() => import('@/views/About/About')),
        authority: [],
    },
    ...othersRoute,
]
