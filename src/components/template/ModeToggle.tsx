import classNames from 'classnames'
import { LuSun, LuMoon } from 'react-icons/lu'
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
                'text-xl',
            )}
            role="button"
            onClick={toggle}
            title={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
        >
            {isDark ? <LuSun /> : <LuMoon />}
        </div>
    )
}

export default ModeToggle
