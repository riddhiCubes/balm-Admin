import classNames from 'classnames'
import type { CSSProperties, ElementType, Ref } from 'react'
import type { CommonProps } from '../@types/common'

export interface SpinnerProps extends CommonProps {
    customColorClass?: string
    enableTheme?: boolean
    indicator?: ElementType
    isSpining?: boolean
    size?: string | number
    ref?: Ref<HTMLElement>
}

const Spinner = (props: SpinnerProps) => {
    const {
        className,
        customColorClass,
        enableTheme = true,
        indicator: Component,
        isSpining = true,
        size = 20,
        style,
        ref,
        ...rest
    } = props

    const spinnerColor = customColorClass || (enableTheme && 'text-primary')

    // When a custom indicator icon is supplied, keep the original icon behaviour.
    if (Component) {
        return (
            <Component
                ref={ref}
                style={{ height: size, width: size, ...style }}
                className={classNames(
                    isSpining && 'animate-spin',
                    spinnerColor,
                    className,
                )}
                {...rest}
            />
        )
    }

    // Default: three concentric rings (small, medium, large) rotating together.
    const numericSize =
        typeof size === 'number' ? size : parseInt(size, 10) || 20
    const thickness = Math.max(2, Math.round(numericSize / 12))

    // scale, animation duration and direction for each ring (outer -> inner)
    const rings: {
        scale: number
        duration: string
        reverse: boolean
        opacity: number
    }[] = [
        { scale: 1, duration: '1.4s', reverse: false, opacity: 1 },
        { scale: 0.68, duration: '1.1s', reverse: false, opacity: 0.85 },
        { scale: 0.38, duration: '0.8s', reverse: false, opacity: 0.7 },
    ]

    const containerStyle: CSSProperties = {
        height: size,
        width: size,
        position: 'relative',
        ...style,
    }

    return (
        <span
            ref={ref as Ref<HTMLSpanElement>}
            style={containerStyle}
            className={classNames('inline-block shrink-0', spinnerColor, className)}
            {...rest}
        >
            {rings.map((ring, index) => (
                <span
                    key={index}
                    style={{
                        position: 'absolute',
                        inset: 0,
                        margin: 'auto',
                        width: `${ring.scale * 100}%`,
                        height: `${ring.scale * 100}%`,
                        borderStyle: 'solid',
                        borderWidth: thickness,
                        borderColor: 'currentColor transparent transparent transparent',
                        borderRadius: '9999px',
                        opacity: ring.opacity,
                        animation: isSpining
                            ? `${
                                  ring.reverse
                                      ? 'balm-spin-reverse'
                                      : 'balm-spin'
                              } ${ring.duration} linear infinite`
                            : undefined,
                    }}
                />
            ))}
        </span>
    )
}

export default Spinner
