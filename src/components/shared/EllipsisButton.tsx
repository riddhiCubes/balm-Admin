import Button from '@/components/ui/Button'
import { TbDots } from 'react-icons/tb'
import type { ButtonProps } from '@/components/ui/Button'
import { HiOutlineDotsVertical } from 'react-icons/hi'

type EllipsisButtonProps = ButtonProps

const EllipsisButton = (props: EllipsisButtonProps) => {
    const { shape = 'circle', variant = 'plain', size = 'xs' } = props

    return (
        <Button
            shape={shape}
            variant={variant}
            size={size}
            icon={<HiOutlineDotsVertical />}
            {...props}
        />
    )
}

export default EllipsisButton
