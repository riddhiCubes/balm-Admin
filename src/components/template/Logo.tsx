import classNames from 'classnames'
import type { CommonProps } from '@/@types/common';

const logo = `${import.meta.env.BASE_URL}img/balm-logo/app-icon.jpg`

interface LogoProps extends CommonProps {
    type?: 'full' | 'streamline'
    mode?: 'light' | 'dark'
    imgClass?: string
    logoWidth?: number | string
}

const Logo = (props: LogoProps) => {
    const {
        type = 'full',
        mode = 'light',
        className,
        imgClass,
        style,
        logoWidth = 'auto',
    } = props

    return (
        <div
            className={classNames('logo', className, 'flex items-center gap-3')}
            style={{
                ...style,
                ...{ width: logoWidth },
            }}
        >
            <img
                className={classNames(imgClass, 'rounded-lg')}
                src={logo}
                alt="Balm logo"
            />
            {type === "full" && (
                <h4 className="bg-gradient-to-r from-[#9949F3] to-[#C078F8] bg-clip-text text-transparent tracking-wide">
                    Balm
                </h4>
            )}
        </div>
    )
}

export default Logo
