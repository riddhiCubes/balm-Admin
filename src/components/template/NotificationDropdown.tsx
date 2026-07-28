import { useState, useEffect, useCallback, useRef } from 'react'
import classNames from 'classnames'
import InfiniteScroll from 'react-infinite-scroll-component'
import Dropdown from '@/components/ui/Dropdown'
import Button from '@/components/ui/Button'
import Tooltip from '@/components/ui/Tooltip'
import Spinner from '@/components/ui/Spinner'
import withHeaderItem from '@/utils/hoc/withHeaderItem'
import useResponsive from '@/utils/hooks/useResponsive'
import {
    getnotifications,
    readnotification,
    readallnotifications,
} from '@/Service/ApiService'
import { PiBellDuotone } from 'react-icons/pi'
import { HiOutlineMailOpen } from 'react-icons/hi'
import {
    TbMusic,
    TbPalette,
    TbUserPlus,
    TbCrown,
    TbBellRinging,
} from 'react-icons/tb'
import type { JSX } from 'react'

type NotificationItem = {
    id: number
    title: string
    description: string
    time: string
    icon: JSX.Element
    iconClass: string
    read: boolean
}

const PAGE_SIZE = 10
const LIST_HEIGHT = 320 // px — matches the old h-[320px] list area.

// Map the numeric `notification_type` to an icon + brand color. Unknown types
// fall back to a generic bell so the list still renders cleanly.
const iconForType = (
    type?: number,
): { icon: JSX.Element; iconClass: string } => {
    switch (Number(type)) {
        case 1: // new session / track
            return { icon: <TbMusic />, iconClass: 'bg-[#9949F3]/15 text-[#9949F3]' }
        case 2: // theme
            return { icon: <TbPalette />, iconClass: 'bg-[#C078F8]/15 text-[#C078F8]' }
        case 3: // premium / subscription
            return { icon: <TbCrown />, iconClass: 'bg-amber-400/15 text-amber-500' }
        case 4: // user / registration
            return { icon: <TbUserPlus />, iconClass: 'bg-emerald-400/15 text-emerald-500' }
        default:
            return { icon: <TbBellRinging />, iconClass: 'bg-sky-400/15 text-sky-500' }
    }
}

// Compact "x min ago" style relative time; falls back to the raw string.
const timeAgo = (value: any): string => {
    if (!value) return ''
    const d = new Date(value)
    if (isNaN(d.getTime())) return String(value)
    const diff = Date.now() - d.getTime()
    const sec = Math.floor(diff / 1000)
    if (sec < 60) return 'Just now'
    const min = Math.floor(sec / 60)
    if (min < 60) return `${min} min ago`
    const hr = Math.floor(min / 60)
    if (hr < 24) return `${hr} hour${hr > 1 ? 's' : ''} ago`
    const day = Math.floor(hr / 24)
    if (day === 1) return 'Yesterday'
    if (day < 7) return `${day} days ago`
    return d.toLocaleDateString()
}

// Normalize a raw API record into the shape the UI renders.
const mapNotification = (raw: any): NotificationItem => {
    const { icon, iconClass } = iconForType(raw?.notification_type)
    return {
        id: raw?.id,
        title: raw?.title ?? 'Notification',
        description: raw?.body ?? '',
        time: timeAgo(raw?.createdAt),
        read: raw?.is_read === true || raw?.is_read === 1,
        icon,
        iconClass,
    }
}

const _NotificationDropdown = ({ className }: { className?: string }) => {
    const [notifications, setNotifications] = useState<NotificationItem[]>([])
    const [unreadCount, setUnreadCount] = useState(0)
    const [hasMore, setHasMore] = useState(false)
    const [initialLoading, setInitialLoading] = useState(false)

    const pageRef = useRef(1) // last page loaded
    const loadingRef = useRef(false) // guard against overlapping requests

    const { larger } = useResponsive()

    const fetchPage = useCallback(async (page: number, append: boolean) => {
        if (loadingRef.current) return
        loadingRef.current = true
        if (!append) setInitialLoading(true)
        try {
            const res = await getnotifications({ page, limit: PAGE_SIZE })
            const payload = res?.data ?? {}
            const list: any[] = Array.isArray(payload?.data) ? payload.data : []
            const mapped = list.map(mapNotification)

            setNotifications((prev) => (append ? [...prev, ...mapped] : mapped))

            const pg = payload?.pagination
            setHasMore(
                pg ? Number(pg.currentPage) < Number(pg.totalPages) : false,
            )
            pageRef.current = page

            if (typeof payload?.unreadCount === 'number') {
                setUnreadCount(payload.unreadCount)
            }
        } catch {
            if (!append) {
                setNotifications([])
                setHasMore(false)
            }
        } finally {
            loadingRef.current = false
            if (!append) setInitialLoading(false)
        }
    }, [])

    // Reload from page 1 (on mount and every time the dropdown opens).
    const refresh = useCallback(() => {
        pageRef.current = 1
        fetchPage(1, false)
    }, [fetchPage])

    // Called by InfiniteScroll when the bottom is reached.
    const loadMore = useCallback(() => {
        fetchPage(pageRef.current + 1, true)
    }, [fetchPage])

    useEffect(() => {
        refresh()
    }, [refresh])

    const onMarkAllAsRead = async () => {
        // Optimistic UI, then persist.
        setNotifications((prev) => prev.map((n) => ({ ...n, read: true })))
        setUnreadCount(0)
        try {
            await readallnotifications()
        } catch {
            refresh() // reconcile on failure
        }
    }

    const onMarkAsRead = async (id: number) => {
        const target = notifications.find((n) => n.id === id)
        if (!target || target.read) return
        setNotifications((prev) =>
            prev.map((n) => (n.id === id ? { ...n, read: true } : n)),
        )
        setUnreadCount((c) => Math.max(0, c - 1))
        try {
            await readnotification({ notification_id: id })
        } catch {
            refresh() // reconcile on failure
        }
    }

    const renderItem = (item: NotificationItem, index: number) => (
        <div key={item.id}>
            <div
                className="relative rounded-xl flex px-4 py-3 cursor-pointer hover:bg-gray-100 dark:hover:bg-[#3b2565]"
                onClick={() => onMarkAsRead(item.id)}
            >
                <div
                    className={classNames(
                        'flex items-center justify-center shrink-0 rounded-full h-10 w-10 text-xl',
                        item.iconClass,
                    )}
                >
                    {item.icon}
                </div>
                <div className="mx-3">
                    <div>
                        <span className="font-semibold heading-text">
                            {item.title}{' '}
                        </span>
                    </div>
                    <span className="text-sm">{item.description}</span>
                    <div className="text-xs mt-1 text-gray-500 dark:text-gray-400">
                        {item.time}
                    </div>
                </div>
                {!item.read && (
                    <span className="absolute top-4 ltr:right-4 rtl:left-4 mt-1.5 h-2 w-2 rounded-full bg-[#9949F3]" />
                )}
            </div>
            {index !== notifications.length - 1 && (
                <div className="border-b border-gray-200 dark:border-[#6d51a6]/30 mx-4" />
            )}
        </div>
    )

    return (
        <Dropdown
            onOpen={(open) => {
                if (open) refresh()
            }}
            renderTitle={
                <div
                    className={classNames(
                        className,
                        'dark:bg-[#4a2f7a] dark:hover:bg-[#573a8c]',
                    )}
                    role="button"
                    title="Notifications"
                >
                    <div className="relative h-6 w-6 text-2xl">
                        <PiBellDuotone />
                        {unreadCount > 0 && (
                            <span className="absolute -top-1 -right-1 flex items-center justify-center min-w-[16px] h-[16px] px-1 rounded-full bg-[#9949F3] text-white text-[10px] font-semibold leading-none border border-white dark:border-[#341f58]">
                                {unreadCount > 9 ? '9+' : unreadCount}
                            </span>
                        )}
                    </div>
                </div>
            }
            menuClass="min-w-[300px] md:min-w-[360px]"
            placement={larger.md ? 'bottom-end' : 'bottom'}
        >
            <Dropdown.Item variant="header">
                <div className="px-2 flex items-center justify-between mb-1">
                    <h6>Notifications</h6>
                    <Tooltip title="Mark all as read">
                        <Button
                            variant="plain"
                            shape="circle"
                            size="sm"
                            icon={<HiOutlineMailOpen className="text-xl" />}
                            onClick={onMarkAllAsRead}
                        />
                    </Tooltip>
                </div>
            </Dropdown.Item>

            {initialLoading && notifications.length === 0 ? (
                <div
                    className="flex items-center justify-center"
                    style={{ height: LIST_HEIGHT }}
                >
                    <Spinner size={32} />
                </div>
            ) : notifications.length === 0 ? (
                <div
                    className="flex flex-col items-center justify-center text-center"
                    style={{ height: LIST_HEIGHT }}
                >
                    <PiBellDuotone className="text-4xl text-gray-400 mb-2" />
                    <h6 className="font-semibold">No notifications</h6>
                    <p className="mt-1 text-sm">You're all caught up!</p>
                </div>
            ) : (
                <InfiniteScroll
                    dataLength={notifications.length}
                    next={loadMore}
                    hasMore={hasMore}
                    height={LIST_HEIGHT}
                    loader={
                        <div className="py-3 flex justify-center">
                            <Spinner size={24} />
                        </div>
                    }
                    endMessage={
                        <p className="text-center text-xs py-3 text-gray-400 dark:text-gray-500">
                            No more notifications
                        </p>
                    }
                >
                    {notifications.map(renderItem)}
                </InfiniteScroll>
            )}
        </Dropdown>
    )
}

const NotificationDropdown = withHeaderItem(_NotificationDropdown)

export default NotificationDropdown
