import { useState } from 'react'
import classNames from 'classnames'
import Dropdown from '@/components/ui/Dropdown'
import ScrollBar from '@/components/ui/ScrollBar'
import Button from '@/components/ui/Button'
import Tooltip from '@/components/ui/Tooltip'
import withHeaderItem from '@/utils/hoc/withHeaderItem'
import useResponsive from '@/utils/hooks/useResponsive'
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

/**
 * Header notification bell + dropdown listing.
 *
 * UI ONLY — the list below is local mock data so the design can be reviewed
 * without a backend. When the API is ready, replace `initialNotifications`
 * (and the mark-as-read handlers) with real calls; the markup can stay as-is.
 */

type NotificationItem = {
    id: string
    title: string
    description: string
    time: string
    icon: JSX.Element
    iconClass: string
    read: boolean
}

const initialNotifications: NotificationItem[] = [
    {
        id: '1',
        title: 'New track uploaded',
        description: '“Ocean Calm” finished processing and is now live.',
        time: '2 min ago',
        icon: <TbMusic />,
        iconClass: 'bg-[#9949F3]/15 text-[#9949F3]',
        read: false,
    },
    {
        id: '2',
        title: 'Theme published',
        description: '“Midnight Bloom” theme is now available to users.',
        time: '25 min ago',
        icon: <TbPalette />,
        iconClass: 'bg-[#C078F8]/15 text-[#C078F8]',
        read: false,
    },
    {
        id: '3',
        title: 'New premium subscriber',
        description: 'Aarav M. just upgraded to a yearly plan.',
        time: '1 hour ago',
        icon: <TbCrown />,
        iconClass: 'bg-amber-400/15 text-amber-500',
        read: false,
    },
    {
        id: '4',
        title: 'New user registered',
        description: 'Priya S. created a Balm account.',
        time: '3 hours ago',
        icon: <TbUserPlus />,
        iconClass: 'bg-emerald-400/15 text-emerald-500',
        read: true,
    },
    {
        id: '5',
        title: 'Scheduled notification sent',
        description: 'Your “Evening Wind-down” push reached 4,210 users.',
        time: 'Yesterday',
        icon: <TbBellRinging />,
        iconClass: 'bg-sky-400/15 text-sky-500',
        read: true,
    },
]

const listHeight = 'h-[320px]'

const _NotificationDropdown = ({ className }: { className?: string }) => {
    const [notifications, setNotifications] =
        useState<NotificationItem[]>(initialNotifications)

    const { larger } = useResponsive()

    const unreadCount = notifications.filter((n) => !n.read).length

    const onMarkAllAsRead = () => {
        setNotifications((prev) => prev.map((n) => ({ ...n, read: true })))
    }

    const onMarkAsRead = (id: string) => {
        setNotifications((prev) =>
            prev.map((n) => (n.id === id ? { ...n, read: true } : n)),
        )
    }

    return (
        <Dropdown
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
            <ScrollBar className={classNames('overflow-y-auto', listHeight)}>
                {notifications.map((item, index) => (
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
                                <span className="text-sm">
                                    {item.description}
                                </span>
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
                ))}
                {notifications.length === 0 && (
                    <div
                        className={classNames(
                            'flex flex-col items-center justify-center text-center',
                            listHeight,
                        )}
                    >
                        <PiBellDuotone className="text-4xl text-gray-400 mb-2" />
                        <h6 className="font-semibold">No notifications</h6>
                        <p className="mt-1 text-sm">You're all caught up!</p>
                    </div>
                )}
            </ScrollBar>
        </Dropdown>
    )
}

const NotificationDropdown = withHeaderItem(_NotificationDropdown)

export default NotificationDropdown
