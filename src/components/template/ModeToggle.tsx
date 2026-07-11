import classNames from 'classnames'
import { PiSunDuotone, PiMoonStarsDuotone } from 'react-icons/pi'
import useDarkMode from '@/utils/hooks/useDarkMode'

const ModeToggle = () => {
    const [isDark, setMode] = useDarkMode()

    const toggle = () => {
        setMode(isDark ? 'light' : 'dark')
    }

    return (
        <div
            className={classNames(
                'header-action-item',
                'header-action-item-hoverable',
                'dark:bg-[#4a2f7a] dark:hover:bg-[#573a8c]',
            )}
            role="button"
            onClick={toggle}
            title={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
        >
            <div className="relative h-6 w-6 text-2xl">
                <PiSunDuotone
                    className={classNames(
                        'absolute inset-0 transition-all duration-300 ease-out text-amber-400 dark:text-white',
                        isDark
                            ? 'opacity-100 rotate-0 scale-100'
                            : 'opacity-0 -rotate-90 scale-0',
                    )}
                />
                <PiMoonStarsDuotone
                    className={classNames(
                        'absolute inset-0 transition-all duration-300 ease-out text-violet-500 dark:text-violet-400',
                        isDark
                            ? 'opacity-0 rotate-90 scale-0'
                            : 'opacity-100 rotate-0 scale-100',
                    )}
                />
            </div>
        </div>
    )
}

export default ModeToggle
