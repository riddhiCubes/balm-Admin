import classNames from 'classnames'
import { APP_NAME } from '@/constants/app.constant'
import type { CommonProps } from '@/@types/common';
import logo from "../../assets/images/zenpath_logo.png";

interface LogoProps extends CommonProps {
    type?: 'full' | 'streamline'
    mode?: 'light' | 'dark'
    imgClass?: string
    logoWidth?: number | string
}

const LOGO_SRC_PATH = '/img/logo/'

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
                className={imgClass}
                // src={`${LOGO_SRC_PATH}logo-${mode}-${type}.png`}
                src={logo}
                alt={`${APP_NAME} logo`}
            />
            {type === "full" && (
                <h4 className=''>Zenpath</h4>
            )}
        </div>
    )
}

export default Logo
